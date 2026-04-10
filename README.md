
Here is a complete, professional README.md template for your project. You can copy and paste this directly into your GitHub repository or project folder.
code
Markdown
# 🧠 Cognivox AI - The Intelligent Educational Assistant

![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-purple?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Gemini API](https://img.shields.io/badge/Google_Gemini-2.5_Flash-orange?style=for-the-badge&logo=google)

Cognivox AI is a powerful, multimodal educational platform powered by Google's Gemini API. It acts as an intelligent "second brain" for students, researchers, and professionals, helping them transform raw educational materials—like audio lectures, YouTube videos, PDFs, and handwritten notes—into structured, easy-to-understand study guides, quizzes, and solutions.

## ✨ Features

*   🎙️ **Lecture Notes Generator:** Upload audio files, record directly from your microphone, or paste a YouTube URL to generate executive summaries, transcripts, and interactive quizzes.
*   📄 **PDF Summarizer:** Upload dense research papers or textbook chapters to instantly extract key takeaways.
*   🖼️ **Image AI Summarizer:** Upload educational diagrams or charts to get a detailed breakdown and visual insights.
*   📚 **Homework Helper:** Type a question or snap a photo of an assignment to receive step-by-step logic and explanations.
*   🧮 **Math Solver:** A dedicated tool for solving complex mathematical equations from text or uploaded images of handwritten problems.
*   🕒 **Activity History:** Automatically tracks and saves all generated notes, summaries, and solutions locally so you can easily revisit past study sessions.
*   🌍 **Multilingual Support:** Generate summaries and notes in multiple languages including English, Spanish, French, Hindi, Telugu, Japanese, and more.
*   🗣️ **Text-to-Speech (TTS):** Listen to your generated summaries on the go.

## 🛠️ Tech Stack

*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **Charts:** Recharts
*   **AI Engine:** Google GenAI SDK (`@google/genai`) using the Gemini 2.5 Flash model
*   **State Management:** React Context API & LocalStorage

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn
*   A Google Gemini API Key (Get one from [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/cognivox-ai.git
   cd cognivox-ai
Install dependencies:
code
Bash
npm install
Set up Environment Variables:
Create a .env file in the root directory of the project and add your Gemini API key:
code
Env
GEMINI_API_KEY=your_api_key_here
Start the development server:
code
Bash
npm run dev
Open the app:
Open your browser and navigate to http://localhost:3000 (or the port provided in your terminal).
💡 Usage
Select a tool from the sidebar (Lecture, PDF, Image, Homework, or Math).
Upload your file, paste a link, or record audio.
Select your preferred output language.
Click "Generate" or "Solve" and let the AI process the information.
View your past generations in the "History" tab.
🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
📝 License
This project is licensed under the MIT License - see the LICENSE file for details.### How to use this:
1. If you export your project to GitHub, create a new file named `README.md` in the root folder of your repository.
2. Paste this text into it.
3. Make sure to replace `https://github.com/yourusername/cognivox-ai.git` with your actual GitHub repository URL if you have one!
Here is the public link you can use to access and share your application with anyone:
https://ais-pre-eya25egztazb5atmnsemlt-308652562173.asia-southeast1.run.app   `npm run dev`
