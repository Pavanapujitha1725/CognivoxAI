import React, { useState, useRef } from 'react';
import { Upload, FileAudio, Youtube, Play, FileText, Brain, BarChart2, CheckCircle, Loader2, Volume2, AlertCircle, Link as LinkIcon, Globe2, Mic, StopCircle } from 'lucide-react';
import { ProcessingStatus, LectureData } from '../types';
import { fileToBase64 } from '../services/audioUtils';
import { analyzeLectureContent, synthesizeSpeech } from '../services/geminiService';
import { AnalyticsCharts } from './AnalyticsCharts';
import Quiz from './Quiz';
import { useHistory } from '../context/HistoryContext';

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Chinese (Simplified)',
  'Hindi',
  'Telugu',
  'Portuguese',
  'Japanese',
  'Korean'
];

const LectureTool: React.FC = () => {
  const [mode, setMode] = useState<'upload' | 'youtube' | 'record'>('upload');
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [language, setLanguage] = useState('English');
  const [data, setData] = useState<LectureData | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'notes' | 'transcript' | 'quiz' | 'analytics'>('notes');
  const [loadingStep, setLoadingStep] = useState(0);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { addHistoryItem } = useHistory();
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg(null);
      setStatus(ProcessingStatus.IDLE);
    }
  };

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunksRef.current.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            const recordedFile = new File([blob], `recording_${new Date().getTime()}.webm`, { type: 'audio/webm' });
            setFile(recordedFile);
            setIsRecording(false);
            setRecordingTime(0);
            
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setFile(null); // Clear previous file
        setErrorMsg(null);

        // Start Timer
        setRecordingTime(0);
        timerIntervalRef.current = window.setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);

    } catch (err) {
        console.error("Error accessing microphone:", err);
        setErrorMsg("Could not access microphone. Please allow permissions.");
    }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
          }
      }
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProcess = async () => {
    if ((mode === 'upload' || mode === 'record') && !file) return;
    if (mode === 'youtube' && !youtubeUrl) return;

    setStatus(ProcessingStatus.UPLOADING);
    setErrorMsg(null);
    setLoadingStep(0);
    
    // Simulate steps for UI effect
    const stepsInterval = setInterval(() => {
        setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 2500);

    try {
      let result;
      
      if ((mode === 'upload' || mode === 'record') && file) {
         const base64Audio = await fileToBase64(file);
         setStatus(ProcessingStatus.PROCESSING);
         // Ensure we pass the correct mime type, usually audio/webm for browser recordings
         result = await analyzeLectureContent(base64Audio, 'audio', file.type, language);
      } else {
         setStatus(ProcessingStatus.PROCESSING);
         result = await analyzeLectureContent(youtubeUrl, 'url', undefined, language);
      }
      
      setData(result);
      setStatus(ProcessingStatus.COMPLETE);
      
      addHistoryItem({
        type: 'Lecture',
        title: file ? file.name : 'YouTube Video Analysis',
        status: 'Completed'
      });
    } catch (error: any) {
      console.error(error);
      setStatus(ProcessingStatus.ERROR);
      setErrorMsg(error.message || "Error processing lecture. Please try again.");
    } finally {
      clearInterval(stepsInterval);
    }
  };

  const handleTTS = async () => {
    if (!data?.executiveSummary || isPlayingTTS) return;
    setIsPlayingTTS(true);
    await synthesizeSpeech(data.executiveSummary);
    setIsPlayingTTS(false);
  };

  const renderInputSection = () => (
    <div className="flex flex-col items-center justify-center min-h-[500px] animate-fade-in">
      <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl">
        <div className="flex gap-2 mb-6 bg-gray-900 p-1 rounded-xl">
            {[
                { id: 'upload', label: 'Upload' },
                { id: 'youtube', label: 'YouTube' },
                { id: 'record', label: 'Record' }
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => {
                        setMode(tab.id as any);
                        setFile(null);
                        setErrorMsg(null);
                        setStatus(ProcessingStatus.IDLE);
                    }}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                        mode === tab.id 
                            ? 'bg-blue-600 text-white shadow' 
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>

        {mode === 'upload' && (
            <div 
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all group ${
                status === ProcessingStatus.ERROR 
                ? 'border-red-500/50 bg-red-500/5' 
                : 'border-gray-600 hover:border-blue-500 hover:bg-gray-700/30'
            }`}
            onClick={() => fileInputRef.current?.click()}
            >
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="audio/*" 
                className="hidden" 
            />
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                status === ProcessingStatus.ERROR ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
            }`}>
                {status === ProcessingStatus.ERROR ? <AlertCircle size={32} /> : <Upload size={32} />}
            </div>
            <p className="text-white font-medium mb-1">Click to upload audio</p>
            <p className="text-xs text-gray-500">MP3, WAV, M4A (Max 50MB)</p>
            </div>
        )}

        {mode === 'youtube' && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4 text-red-400">
                    <Youtube size={24} />
                    <span className="font-semibold">YouTube Analysis</span>
                </div>
                <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                        type="text"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="Paste YouTube URL here..."
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-3">
                    We will analyze the video content to generate notes and charts.
                </p>
            </div>
        )}

        {mode === 'record' && (
             <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center min-h-[200px]">
                {isRecording ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <div className="text-3xl font-mono text-red-500 font-bold mb-4">
                            {formatTime(recordingTime)}
                        </div>
                        <div className="w-full flex items-center justify-center gap-1 mb-6 h-8">
                             {[1,2,3,4,5].map(i => (
                                 <div key={i} className="w-1 bg-red-500 h-full animate-bounce" style={{animationDelay: `${i * 0.1}s`}}></div>
                             ))}
                        </div>
                        <button 
                            onClick={stopRecording}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-transform hover:scale-105"
                        >
                            <StopCircle size={20} /> Stop Recording
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 border-2 border-gray-700 relative">
                             <Mic size={32} className="text-gray-400" />
                        </div>
                        <button 
                            onClick={startRecording}
                            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-transform hover:scale-105 shadow-lg shadow-blue-600/20"
                        >
                            <Mic size={20} /> Start Recording
                        </button>
                    </div>
                )}
             </div>
        )}

        {/* Language Selector */}
        <div className="mt-6">
            <label className="block text-xs font-medium text-gray-400 mb-2">Output Language</label>
            <div className="relative">
                <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 appearance-none cursor-pointer hover:bg-gray-800 transition-colors"
                >
                    {LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-gray-400 border-t-gray-400"></div>
            </div>
        </div>

        {(mode === 'upload' || mode === 'record') && file && (
          <div className="mt-6 bg-gray-750 border border-gray-700 rounded-lg p-3 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 bg-blue-600/20 rounded flex items-center justify-center text-blue-500 shrink-0">
                    <FileAudio size={16} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm text-gray-300 truncate font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
            </div>
            {mode === 'record' && (
                <button onClick={() => setFile(null)} className="text-gray-500 hover:text-red-400 p-2">
                    Start Over
                </button>
            )}
          </div>
        )}

        {status === ProcessingStatus.ERROR && (
          <div className="mt-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <div className="text-sm">
                  <p className="font-semibold text-red-400">Processing Failed</p>
                  <p className="text-red-300/80">{errorMsg}</p>
              </div>
          </div>
        )}

        <button 
          onClick={handleProcess}
          disabled={(mode === 'upload' || mode === 'record') ? !file : !youtubeUrl}
          className={`w-full mt-6 py-3 rounded-xl font-medium transition-all ${
            ((mode === 'upload' || mode === 'record') ? file : youtubeUrl)
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20' 
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
            {status === ProcessingStatus.UPLOADING ? 'Analyzing...' : status === ProcessingStatus.ERROR ? 'Try Again' : 'Generate Notes'}
        </button>
      </div>
    </div>
  );

  const renderProcessingState = () => (
    <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-6">Processing {mode === 'youtube' ? 'Video' : 'Lecture'}</h3>
            
            <div className="space-y-6">
                {[
                    { label: mode === 'youtube' ? 'Video Research' : 'Audio Processing', done: loadingStep >= 0 },
                    { label: `Transcript Generation (${language})`, done: loadingStep >= 1 },
                    { label: 'Content Analysis', done: loadingStep >= 2 },
                    { label: 'Chart Generation', done: loadingStep >= 3 },
                ].map((step, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                            step.done ? 'bg-blue-600 border-blue-600' : 'border-gray-600'
                        }`}>
                            {step.done ? <CheckCircle size={14} className="text-white" /> : null}
                        </div>
                        <span className={`text-sm ${step.done ? 'text-white' : 'text-gray-500'}`}>{step.label}</span>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-center">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">
                {mode === 'youtube' 
                    ? "Deep research and search grounding in progress..." 
                    : "This uses Gemini 2.0 Flash multimodal capabilities."}
            </p>
        </div>
    </div>
  );

  const renderResultsState = () => {
    if (!data) return null;

    return (
      <div className="flex gap-6 h-full flex-col lg:flex-row">
        {/* Left Panel: Audio Player & Mini Stats */}
        <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mode === 'youtube' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {mode === 'youtube' ? <Youtube size={20} /> : <FileAudio size={20} />}
                    </div>
                    <div>
                        <h3 className="text-white font-medium truncate max-w-[200px]">{mode === 'youtube' ? 'YouTube Video' : file?.name}</h3>
                        <p className="text-xs text-gray-500">Processed successfully</p>
                        <p className="text-xs text-blue-400 mt-1">{language}</p>
                    </div>
                </div>
                {(mode === 'upload' || mode === 'record') && (
                  <div className="bg-gray-900 rounded-lg p-3 flex items-center justify-center gap-3 mb-4">
                      <button className="w-8 h-8 rounded-full bg-white text-gray-900 flex items-center justify-center hover:scale-105 transition-transform">
                          <Play size={14} fill="currentColor" />
                      </button>
                      <div className="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
                          <div className="w-1/3 h-full bg-blue-500"></div>
                      </div>
                      <span className="text-xs text-gray-400">Audio Preview</span>
                  </div>
                )}
            </div>

            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex-1">
                <h3 className="text-white font-semibold mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                     <div className="bg-gray-900/50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Topics</p>
                        <p className="text-xl font-bold text-blue-400">{data.topicDistribution.length}</p>
                     </div>
                     <div className="bg-gray-900/50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Difficulty</p>
                        <p className="text-xl font-bold text-purple-400">
                             {Math.round(data.conceptComplexity.reduce((acc, curr) => acc + curr.score, 0) / data.conceptComplexity.length)}%
                        </p>
                     </div>
                </div>
            </div>
        </div>

        {/* Right Panel: Tabs & Content */}
        <div className="lg:w-2/3 flex flex-col">
            <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
                {[
                    { id: 'notes', label: 'Study Notes', icon: <FileText size={16} /> },
                    { id: 'transcript', label: 'Transcript', icon: <FileText size={16} /> },
                    { id: 'quiz', label: 'Quiz', icon: <Brain size={16} /> },
                    { id: 'analytics', label: 'Charts & Diagrams', icon: <BarChart2 size={16} /> },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveResultTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                            activeResultTab === tab.id 
                                ? 'border-blue-500 text-blue-400' 
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 animate-fade-in">
                {activeResultTab === 'notes' && (
                    <div className="space-y-6">
                        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                             <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-white">Executive Summary</h3>
                                <button 
                                  onClick={handleTTS}
                                  disabled={isPlayingTTS}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                >
                                    {isPlayingTTS ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
                                    {isPlayingTTS ? 'Playing...' : 'Listen to Summary'}
                                </button>
                             </div>
                             <p className="text-gray-300 leading-relaxed text-sm lg:text-base">
                                {data.executiveSummary}
                             </p>
                        </div>
                    </div>
                )}

                {activeResultTab === 'transcript' && (
                     <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 h-[600px] overflow-y-auto custom-scrollbar">
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {data.transcript}
                        </p>
                     </div>
                )}

                {activeResultTab === 'quiz' && (
                    <Quiz questions={data.quiz} />
                )}

                {activeResultTab === 'analytics' && (
                    <AnalyticsCharts topics={data.topicDistribution} complexity={data.conceptComplexity} />
                )}
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Lecture Notes Generator</h2>
            <p className="text-gray-400">Upload audio, record a lecture, or link a YouTube video.</p>
        </div>

        {status === ProcessingStatus.IDLE && renderInputSection()}
        {status === ProcessingStatus.ERROR && renderInputSection()}
        {(status === ProcessingStatus.UPLOADING || status === ProcessingStatus.PROCESSING) && renderProcessingState()}
        {status === ProcessingStatus.COMPLETE && renderResultsState()}
      </div>
    </div>
  );
};

export default LectureTool;