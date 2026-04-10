import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, Calculator, Loader2, X, Sigma, AlertCircle } from 'lucide-react';
import { solveMath } from '../services/geminiService';
import { fileToBase64 } from '../services/audioUtils';
import { useHistory } from '../context/HistoryContext';

const MathTool: React.FC = () => {
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
        const result = await solveMath(input, base64Image, image?.type);
        setResponse(result);
        
        addHistoryItem({
          type: 'Math',
          title: input ? (input.length > 30 ? input.substring(0, 30) + '...' : input) : (image ? image.name : 'Math Problem'),
          status: 'Solved'
        });
    } catch (error: any) {
        setError(error.message || "Sorry, I couldn't solve that problem.");
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
                <Calculator className="text-green-500" />
                Math Solver
            </h2>
            <p className="text-gray-400">Enter an equation or upload a photo of the problem.</p>
        </div>

        <div className="flex-1 bg-gray-800 rounded-2xl border border-gray-700 flex flex-col overflow-hidden">
            {/* Chat Area */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                {!response && !loading && !error && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                        <Sigma size={48} className="mb-4" />
                        <p>Ready to crunch numbers...</p>
                    </div>
                )}
                
                {loading && (
                    <div className="flex items-center gap-3 text-green-400">
                        <Loader2 className="animate-spin" size={20} />
                        <span>Calculating...</span>
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
                        <div className="prose prose-invert max-w-none text-gray-200 font-mono text-sm">
                             <div dangerouslySetInnerHTML={{ 
                                 __html: response
                                    .replace(/\n/g, '<br/>')
                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
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
                        placeholder="e.g. Solve for x: 2x + 5 = 15"
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 text-white focus:outline-none focus:border-green-500 transition-colors font-mono"
                    />
                    <button 
                        type="submit"
                        disabled={loading || (!input && !image)}
                        className="p-3 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
};

export default MathTool;