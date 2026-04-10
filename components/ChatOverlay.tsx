import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare, Loader2, Bot, Trash2 } from 'lucide-react';
import { streamChatMessage } from '../services/geminiService';

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I\'m your AI study assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
        scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // Format history for the API (exclude the message we just added visually if we are sending it separately,
      // but SDK expects history of PREVIOUS turns)
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Add placeholder for model response
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      await streamChatMessage(userMsg, history, (chunk) => {
        setMessages(prev => {
            const newArr = [...prev];
            const lastIndex = newArr.length - 1;
            if (lastIndex >= 0 && newArr[lastIndex].role === 'model') {
                newArr[lastIndex] = {
                    ...newArr[lastIndex],
                    text: newArr[lastIndex].text + chunk
                };
            }
            return newArr;
        });
      });
      
    } catch (error) {
      setMessages(prev => {
          const newArr = [...prev];
          const lastIndex = newArr.length - 1;
          // If the last message was the empty model placeholder, update it with error
          if (lastIndex >= 0 && newArr[lastIndex].role === 'model') {
               const errText = "\n[System: Sorry, I'm having trouble connecting to the AI. Please try again.]";
               newArr[lastIndex].text += errText;
          }
          return newArr;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
      setMessages([{ role: 'model', text: 'Hi! I\'m your AI study assistant. How can I help you today?' }]);
  };

  return (
    <div 
        className={`fixed bottom-6 right-6 w-96 h-[600px] bg-[#0f172a] rounded-2xl shadow-2xl border border-gray-700 flex flex-col z-50 transition-all duration-300 transform origin-bottom-right ${
            isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-blue-600 rounded-t-2xl">
        <div className="flex items-center gap-2 text-white">
          <Bot size={24} />
          <span className="font-semibold">Student Assistant</span>
        </div>
        <div className="flex items-center gap-1">
            <button onClick={handleClear} className="p-1.5 text-blue-100 hover:text-white hover:bg-blue-700/50 rounded-lg transition-colors" title="Clear History">
                <Trash2 size={16} />
            </button>
            <button onClick={onClose} className="p-1.5 text-blue-100 hover:text-white hover:bg-blue-700/50 rounded-lg transition-colors">
                <X size={20} />
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-900/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-gray-700 text-gray-200 rounded-bl-none border border-gray-600'
              }`}
            >
              {msg.text}
              {msg.role === 'model' && msg.text === '' && isLoading && (
                  <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse align-middle ml-1">|</span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-700 bg-[#0f172a] rounded-b-2xl">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatOverlay;