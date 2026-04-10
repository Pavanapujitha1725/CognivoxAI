import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LectureTool from './components/LectureTool';
import PDFTool from './components/PDFTool';
import ImageTool from './components/ImageTool';
import HomeworkTool from './components/HomeworkTool';
import MathTool from './components/MathTool';
import Login from './components/Login';
import ChatOverlay from './components/ChatOverlay';
import { HistoryView, HowToUseView, AboutView } from './components/InfoViews';
import { Bell, Search, MessageSquare } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'lecture':
        return <LectureTool />;
      case 'pdf':
        return <PDFTool />;
      case 'image-ai':
        return <ImageTool />;
      case 'homework':
        return <HomeworkTool />;
      case 'math':
        return <MathTool />;
      case 'history':
        return <HistoryView />;
      case 'how-to-use':
        return <HowToUseView />;
      case 'about':
        return <AboutView />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            Feature coming soon...
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-[#030712] text-gray-100 font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 flex flex-col h-screen relative">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-800 bg-[#030712] flex items-center justify-between px-8 z-10">
          <div className="flex items-center text-sm text-gray-500">
             <span className="capitalize">{activeTab.replace(/-/g, ' ')}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Search notes..." 
                    className="bg-gray-900 border border-gray-700 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-blue-500 w-64 text-gray-200 placeholder-gray-600"
                />
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
                <Bell size={20} />
            </button>
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                isChatOpen 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90'
              }`}
            >
                <MessageSquare size={16} />
                <span>{isChatOpen ? 'Close Chat' : 'Chat'}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-hidden relative">
          {renderContent()}
        </div>

        {/* Chat Overlay */}
        <ChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </main>
    </div>
  );
};

export default App;