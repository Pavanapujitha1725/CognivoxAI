import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, BookOpen, Loader2, X, AlertCircle } from 'lucide-react';
import { solveHomework } from '../services/geminiService';
import { fileToBase64 } from '../services/audioUtils';
import { useHistory } from '../context/HistoryContext';

const HomeworkTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addHistoryItem } = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input && !image) return;

    setLoading(true);
    setResponse('');
    setError(null);
    
    try {
        let base64Image = undefined;
        if (image) {
            base64Image = await fileToBase64(image);
        }
        const result = await solveHomework(input, base64Image, image?.type);
        setResponse(result);
        
        addHistoryItem({
          type: 'Homework',
          title: input ? (input.length > 30 ? input.substring(0, 30) + '...' : input) : (image ? image.name : 'Homework Question'),
          status: 'Solved'
        });
    } catch (error: any) {
        setError(error.message || "Sorry, I encountered an error trying to solve that.");
    } finally {
        setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setImage(e.target.files[0]);
      }
  };

  return (
    <div className="p-8 h-full flex flex-col max-w-4xl mx-auto">
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <BookOpen className="text-indigo-500" />
                Homework Helper
            </h2>
            <p className="text-gray-400">Ask a question or upload a photo of your assignment.</p>
        </div>

        <div className="flex-1 bg-gray-800 rounded-2xl border border-gray-700 flex flex-col overflow-hidden">
            {/* Chat Area */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                {!response && !loading && !error && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                        <BookOpen size={48} className="mb-4" />
                        <p>Waiting for your question...</p>
                    </div>
                )}
                
                {loading && (
                    <div className="flex items-center gap-3 text-indigo-400">
                        <Loader2 className="animate-spin" size={20} />
                        <span>Thinking...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 animate-fade-in">
                        <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                        <div className="text-sm text-red-300">
                            {error}
                        </div>
                    </div>
                )}

                {response && (
                    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 animate-fade-in">
                        <div className="prose prose-invert max-w-none text-gray-200">
                             <div dangerouslySetInnerHTML={{ 
                                 __html: response
                                    .replace(/\n/g, '<br/>')
                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-300">$1</strong>')
                                    .replace(/### (.*?)\n/g, '<h3 class="text-lg font-bold mt-4 mb-2 text-white">$1</h3>')
                             }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-900 border-t border-gray-700">
                {image && (
                    <div className="mb-2 inline-flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-300 border border-gray-700">
                        <ImageIcon size={12} />
                        {image.name}
                        <button onClick={() => setImage(null)} className="hover:text-white"><X size={12} /></button>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors border border-gray-700"
                    >
                        <ImageIcon size={20} />
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                    </button>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question here..."
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button 
                        type="submit"
                        disabled={loading || (!input && !image)}
                        className="p-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
};

export default HomeworkTool;