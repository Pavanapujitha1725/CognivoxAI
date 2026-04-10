import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LectureData } from "../types";
import { decodeBase64, decodeAudioData } from "./audioUtils";

// Check if API key is available
if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL ERROR: process.env.GEMINI_API_KEY is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to parse complex error messages from the SDK
const handleGeminiError = (error: any) => {
  console.error("Gemini API Error Details:", error);
  let message = error.message || "An unknown error occurred";

  // Attempt to parse JSON stringified error messages
  if (typeof message === 'string' && (message.includes('{') || message.includes('429'))) {
     try {
         const jsonStart = message.indexOf('{');
         const jsonEnd = message.lastIndexOf('}');
         if (jsonStart !== -1 && jsonEnd !== -1) {
             const jsonStr = message.substring(jsonStart, jsonEnd + 1);
             const parsed = JSON.parse(jsonStr);
             if (parsed.error && parsed.error.message) {
                 message = parsed.error.message;
             }
         }
     } catch (e) {
         // Fallback to original message if parsing fails
     }
  }

  if (message.includes("429") || message.toLowerCase().includes("quota") || message.toLowerCase().includes("resource exhausted")) {
    throw new Error("API Quota exceeded. The system is switching to a backup model. Please try again in a few seconds.");
  }
  
  throw new Error(message);
};

// Generic function to generate content with fallback
const generateWithFallback = async (primaryModel: string, fallbackModel: string, params: any) => {
    try {
        return await ai.models.generateContent({
            model: primaryModel,
            ...params
        });
    } catch (error: any) {
        const msg = error.message || "";
        // If quota exceeded or model not found, try fallback
        if (msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("not found")) {
            console.warn(`Primary model ${primaryModel} failed, switching to fallback ${fallbackModel}`);
            
            // Remove tools (like googleSearch) if falling back to a model that might not support them seamlessly in the same way,
            // or keep them if supported. Flash-latest supports tools, but let's be safe.
            // For this specific implementation, we will try to pass params as is.
            return await ai.models.generateContent({
                model: fallbackModel,
                ...params
            });
        }
        throw error;
    }
};

// --- IMAGE ANALYSIS ---
export const analyzeImage = async (base64Image: string, mimeType: string, language: string = 'English'): Promise<string> => {
  const primaryModel = "gemini-2.5-flash";
  const fallbackModel = "gemini-2.0-flash";

  const prompt = `
    Analyze this image in detail.
    
    IMPORTANT: Provide the response in **${language}**.

    Structure the response in Markdown:
    1. **Main Subject**: What is the primary focus of the image?
    2. **Detailed Description**: Describe the visual elements, colors, context, and any text present.
    3. **Key Insights/Analysis**: Explain the significance, underlying meaning, or educational value of the image.
  `;

  try {
    const response = await generateWithFallback(primaryModel, fallbackModel, {
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          { text: prompt },
        ],
      },
    });
    return response.text || "Could not analyze image.";
  } catch (error) {
    handleGeminiError(error);
    return "";
  }
};

// --- LECTURE ANALYSIS (Audio or URL) ---
export const analyzeLectureContent = async (input: string, type: 'audio' | 'url', mimeType?: string, language: string = 'English'): Promise<LectureData> => {
  // Primary: Experimental 2.0 (Fast, Multimodal)
  // Fallback: Latest Flash (Stable, High Quota)
  const primaryModel = "gemini-2.5-flash"; 
  const fallbackModel = "gemini-2.0-flash";

  // Common JSON Schema Config
  const schemaConfig = {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        executiveSummary: { type: Type.STRING },
        transcript: { type: Type.STRING },
        quiz: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.INTEGER },
            },
            required: ["question", "options", "correctIndex"],
          },
        },
        topicDistribution: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              value: { type: Type.INTEGER },
            },
            required: ["name", "value"],
          },
        },
        conceptComplexity: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              concept: { type: Type.STRING },
              score: { type: Type.INTEGER },
            },
            required: ["concept", "score"],
          },
        },
      },
      required: ["executiveSummary", "transcript", "quiz", "topicDistribution", "conceptComplexity"],
    },
  };

  // --- PATH 1: YOUTUBE URL (Two-Step Process) ---
  if (type === 'url') {
    // Step 1: Research Phase (Use Tools, No JSON Schema)
    // We cannot use tools + responseSchema in the same request for some models.
    const researchPrompt = `
      You are an expert researcher. Use Google Search to find the official transcript, detailed summary, or educational content regarding this YouTube video: ${input}.
      Gather as much detailed information as possible about the key topics, spoken content, and educational concepts.
      Return a comprehensive, detailed text summary of the video content in ${language}.
    `;

    let researchText = "";
    try {
      const researchResponse = await generateWithFallback(primaryModel, fallbackModel, {
        contents: { parts: [{ text: researchPrompt }] },
        config: { tools: [{ googleSearch: {} }] }, // Enable tools here
      });
      researchText = researchResponse.text || "";
    } catch (e) {
      console.warn("Search tool failed, falling back to direct URL inference", e);
      researchText = `Analyze this YouTube URL contextually: ${input}`;
    }

    if (!researchText) throw new Error("Could not retrieve info for this URL.");

    // Step 2: Structuring Phase (No Tools, Enforce JSON Schema)
    const structuringPrompt = `
      You are an expert academic tutor. Based ONLY on the following research text about a video, generate a structured lecture analysis.
      
      Research Text:
      """${researchText}"""

      Tasks:
      1. Generate a detailed Executive Summary (approx 150 words).
      2. Provide a detailed summary of the main points accurately (do not generate a word-for-word transcript to save time).
      3. Create a Quiz with exactly 5 multiple-choice questions based on the content.
      4. Analyze the content for "Topic Distribution" (breakdown of main themes by percentage, summing to 100).
      5. Analyze "Concept Complexity" (rate key concepts from 0-100 on difficulty).

      IMPORTANT: The output must be valid JSON in **${language}**.
    `;

    const structureResponse = await generateWithFallback(primaryModel, fallbackModel, {
      contents: { parts: [{ text: structuringPrompt }] },
      config: schemaConfig, // Apply JSON schema here
    });

    return parseJSONResponse(structureResponse);
  } 

  // --- PATH 2: AUDIO FILE (One-Step Process) ---
  else {
    const prompt = `
      You are an expert academic tutor. Analyze the provided lecture audio.
      
      IMPORTANT: The user wants the output in **${language}**. ensure ALL generated text (summary, transcript, quiz questions, options) is in ${language}.

      Tasks:
      1. Generate a detailed Executive Summary (approx 150 words).
      2. Provide a detailed summary of the main points accurately (do not generate a word-for-word transcript to save time).
      3. Create a Quiz with exactly 5 multiple-choice questions based on the content.
      4. Analyze the content for "Topic Distribution" (breakdown of main themes by percentage, summing to 100).
      5. Analyze "Concept Complexity" (rate key concepts from 0-100 on difficulty).

      Return ONLY raw JSON matching the specified schema.
    `;

    const parts: any[] = [
      {
        inlineData: {
          mimeType: mimeType || 'audio/mp3',
          data: input,
        },
      },
      { text: prompt }
    ];

    let response;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount < maxRetries) {
      try {
        response = await generateWithFallback(primaryModel, fallbackModel, {
          contents: { parts },
          config: schemaConfig,
        });
        break; 
      } catch (error: any) {
        if (retryCount < maxRetries - 1) {
          const msg = error.message || "";
          if (msg.includes("429") || msg.toLowerCase().includes("quota")) {
               console.log("Quota hit, waiting before retry...");
               await wait(2000); 
               retryCount++;
               continue;
          }
        }
        handleGeminiError(error);
      }
    }

    return parseJSONResponse(response);
  }
};

// Helper to safely parse JSON from model response
const parseJSONResponse = (response: any): LectureData => {
  if (!response || !response.text) throw new Error("No response from Gemini");

  let jsonString = response.text.trim();
  if (jsonString.startsWith("```json")) jsonString = jsonString.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  else if (jsonString.startsWith("```")) jsonString = jsonString.replace(/^```\s*/, "").replace(/\s*```$/, "");

  try {
      return JSON.parse(jsonString) as LectureData;
  } catch (e) {
      console.error("JSON Parse Error. Raw text:", jsonString);
      throw new Error("Failed to parse model response as JSON.");
  }
};

// --- PDF SUMMARIZER ---
export const analyzePDF = async (base64Pdf: string, language: string = 'English'): Promise<string> => {
  const primaryModel = "gemini-2.5-flash";
  const fallbackModel = "gemini-2.0-flash";

  const prompt = `
    You are a research assistant. Read the provided PDF document.
    
    IMPORTANT: Provide the response in **${language}**.

    Provide a comprehensive summary structured in Markdown:
    - **Title**: Extract the title.
    - **Key Takeaways**: Bullet points of the most important information.
    - **Detailed Summary**: Paragraphs explaining the content.
    - **Conclusion**: A brief wrap-up.
  `;

  try {
    const response = await generateWithFallback(primaryModel, fallbackModel, {
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64Pdf,
            },
          },
          { text: prompt },
        ],
      },
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    handleGeminiError(error);
    return ""; // Unreachable
  }
};

// --- HOMEWORK HELPER ---
export const solveHomework = async (question: string, imageBase64?: string, imageMimeType?: string): Promise<string> => {
  const primaryModel = "gemini-2.5-flash";
  const fallbackModel = "gemini-2.0-flash";
  
  const prompt = `You are a helpful tutor. Help the student with this homework assignment. 
  Provide a clear, step-by-step explanation of the solution. Do not just give the answer; explain the 'why' and 'how'.
  Format the output in clean Markdown.`;

  const parts: any[] = [{ text: prompt }, { text: `Question: ${question}` }];
  
  if (imageBase64 && imageMimeType) {
    parts.unshift({
        inlineData: {
            mimeType: imageMimeType,
            data: imageBase64
        }
    });
  }

  try {
    const response = await generateWithFallback(primaryModel, fallbackModel, {
      contents: { parts },
    });
    return response.text || "Could not generate solution.";
  } catch (error) {
    handleGeminiError(error);
    return "";
  }
};

// --- MATH SOLVER ---
export const solveMath = async (problem: string, imageBase64?: string, imageMimeType?: string): Promise<string> => {
  const primaryModel = "gemini-2.5-flash";
  const fallbackModel = "gemini-2.0-flash";
  
  const prompt = `You are a brilliant mathematician. Solve the following math problem.
  1. Identify the type of problem.
  2. Show step-by-step working out.
  3. Provide the final answer clearly.
  Use LaTeX formatting for equations where appropriate (wrapped in $ signs).
  Format the output in Markdown.`;

  const parts: any[] = [{ text: prompt }, { text: `Problem: ${problem}` }];
  
  if (imageBase64 && imageMimeType) {
    parts.unshift({
        inlineData: {
            mimeType: imageMimeType,
            data: imageBase64
        }
    });
  }

  try {
    const response = await generateWithFallback(primaryModel, fallbackModel, {
      contents: { parts },
    });
    return response.text || "Could not solve problem.";
  } catch (error) {
    handleGeminiError(error);
    return "";
  }
};

// --- CHATBOT (Stream with Fallback) ---
export const streamChatMessage = async (
  message: string, 
  history: any[], 
  onChunk: (chunkText: string) => void
): Promise<string> => {
  const primaryModel = "gemini-2.5-flash"; 
  const fallbackModel = "gemini-2.0-flash";
  let fullText = "";

  const runStream = async (modelId: string) => {
      const chat = ai.chats.create({
        model: modelId,
        history: history,
        config: {
            systemInstruction: "You are NoteGen Bot, a helpful academic assistant for students. You help with study tips, explaining concepts, and navigating the app. Keep answers concise and helpful.",
        }
      });
      
      const resultStream = await chat.sendMessageStream({ message });
      for await (const chunk of resultStream) {
          const text = chunk.text || "";
          fullText += text;
          onChunk(text);
      }
  };

  try {
      await runStream(primaryModel);
  } catch (error: any) {
      const msg = error.message || "";
      // If quota exceeded or model not found, try fallback
      if (msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("not found")) {
          console.warn(`Chat primary model ${primaryModel} failed, switching to fallback ${fallbackModel}`);
          // If we already streamed data, we might want to clear it in the UI or just append.
          // Since the UI appends, ideally we would signal a reset, but usually errors happen at start.
          if (fullText.length === 0) {
              await runStream(fallbackModel);
          } else {
              throw error; 
          }
      } else {
          handleGeminiError(error);
      }
  }
  return fullText;
};

// --- TTS ---
export const synthesizeSpeech = async (text: string): Promise<void> => {
  const modelId = "gemini-2.5-flash-preview-tts";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContext, 24000, 1);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();

  } catch (error) {
    console.error("TTS Error:", error);
    // Don't throw here to avoid breaking UI flow for optional TTS
  }
};