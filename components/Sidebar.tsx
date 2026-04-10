import React from 'react';
import { 
  LayoutDashboard, 
  Headphones, 
  FileText, 
  BookOpen, 
  Calculator, 
  Clock, 
  HelpCircle, 
  Info,
  LogOut,
  User,
  Image as ImageIcon
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'lecture', label: 'Lecture Notes', icon: <Headphones size={20} /> },
    { id: 'pdf', label: 'PDF Summarizer', icon: <FileText size={20} /> },
    { id: 'image-ai', label: 'Image AI', icon: <ImageIcon size={20} /> },
    { id: 'homework', label: 'Homework Helper', icon: <BookOpen size={20} /> },
    { id: 'math', label: 'Math Solver', icon: <Calculator size={20} /> },
  ];

  const libraryItems = [
    { id: 'history', label: 'History', icon: <Clock size={20} /> },
    { id: 'how-to-use', label: 'How to Use', icon: <HelpCircle size={20} /> },
    { id: 'about', label: 'About App', icon: <Info size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 border-r border-gray-800 flex flex-col fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
        </div>
        <span className="text-xl font-bold text-white tracking-tight">Cognivox AI</span>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4 px-2">Tools</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}

        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-8 px-2">Library</div>
        {libraryItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              activeTab === item.id 
                ? 'bg-gray-800 text-white border border-gray-700' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer group">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-gray-600">
            <User size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Student User</p>
            <p className="text-xs text-gray-500 truncate">Free Plan</p>
          </div>
          <LogOut size={16} className="text-gray-500 group-hover:text-white" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;