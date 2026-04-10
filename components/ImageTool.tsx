import React, { useState, useRef } from 'react';
import { Image as ImageIcon, CheckCircle, Loader2, AlertCircle, Globe2, Upload } from 'lucide-react';
import { ProcessingStatus } from '../types';
import { fileToBase64 } from '../services/audioUtils';
import { analyzeImage } from '../services/geminiService';
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

const ImageTool: React.FC = () => {
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [language, setLanguage] = useState('English');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { addHistoryItem } = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setErrorMsg(null);
      setStatus(ProcessingStatus.IDLE);
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    setStatus(ProcessingStatus.PROCESSING);
    setErrorMsg(null);

    try {
      const base64Image = await fileToBase64(file);
      const result = await analyzeImage(base64Image, file.type, language);
      setSummary(result);
      setStatus(ProcessingStatus.COMPLETE);
      
      addHistoryItem({
        type: 'Image',
        title: file.name,
        status: 'Analyzed'
      });
    } catch (error: any) {
      console.error(error);
      setStatus(ProcessingStatus.ERROR);
      setErrorMsg(error.message || "Error processing image.");
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Image AI Summarizer</h2>
            <p className="text-gray-400">Upload an image to get a detailed breakdown and educational insights.</p>
        </div>

        {status === ProcessingStatus.IDLE || status === ProcessingStatus.ERROR ? (
          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 w-full max-w-2xl mx-auto">
            <div 
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all group ${
                status === ProcessingStatus.ERROR 
                ? 'border-red-500/50 bg-red-500/5' 
                : 'border-gray-600 hover:border-pink-500 hover:bg-gray-700/30'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              {previewUrl ? (
                  <div className="relative mb-4">
                      <img src={previewUrl} alt="Preview" className="h-40 rounded-lg shadow-lg object-contain" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                          <span className="text-white text-sm font-medium">Change Image</span>
                      </div>
                  </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ImageIcon size={32} />
                </div>
              )}
              
              {!previewUrl && (
                  <>
                    <p className="text-white font-medium mb-1">Click to upload Image</p>
                    <p className="text-xs text-gray-500">JPG, PNG, WEBP (Max 20MB)</p>
                  </>
              )}
            </div>

            {/* Language Selector */}
            <div className="mt-6">
                <label className="block text-xs font-medium text-gray-400 mb-2">Analysis Language</label>
                <div className="relative">
                    <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-pink-500 appearance-none cursor-pointer hover:bg-gray-800 transition-colors"
                    >
                        {LANGUAGES.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-gray-400 border-t-gray-400"></div>
                </div>
            </div>

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
              disabled={!file}
              className={`w-full mt-6 py-3 rounded-xl font-medium transition-all ${
                file 
                    ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-600/20' 
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
                Analyze Image
            </button>
          </div>
        ) : (
            <div className="flex gap-6 flex-col lg:flex-row h-full">
                 {/* Left Panel: Image */}
                 <div className="lg:w-1/3">
                    <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 sticky top-4">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                             <ImageIcon size={18} className="text-pink-500"/> 
                             Source Image
                        </h3>
                        {previewUrl && (
                             <img src={previewUrl} alt="Source" className="w-full rounded-xl" />
                        )}
                        <button 
                            onClick={() => {
                                setStatus(ProcessingStatus.IDLE);
                                setSummary('');
                            }} 
                            className="w-full mt-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors text-sm"
                        >
                            Upload Another
                        </button>
                    </div>
                 </div>

                 {/* Right Panel: Result */}
                 <div className="lg:w-2/3">
                     {status === ProcessingStatus.PROCESSING ? (
                         <div className="flex flex-col items-center justify-center h-64 bg-gray-800 rounded-2xl border border-gray-700">
                             <Loader2 className="animate-spin text-pink-500 mb-4" size={32} />
                             <p className="text-gray-400">Analyzing visual elements in {language}...</p>
                         </div>
                     ) : (
                         <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 animate-fade-in">
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-700">
                                 <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center text-pink-500">
                                     <CheckCircle size={20} />
                                 </div>
                                 <h3 className="text-lg font-semibold text-white">Analysis Result ({language})</h3>
                            </div>
                            <div className="prose prose-invert max-w-none text-gray-300">
                                 <div dangerouslySetInnerHTML={{ 
                                     __html: summary.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/- /g, '• ') 
                                 }} />
                            </div>
                         </div>
                     )}
                 </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageTool;