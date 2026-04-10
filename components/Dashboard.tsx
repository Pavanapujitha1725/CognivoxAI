import React from 'react';
import { PlayCircle, FileText, BookOpen, Calculator, Image as ImageIcon } from 'lucide-react';

interface DashboardProps {
    onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const cards = [
    {
        id: 'lecture',
        title: 'Lecture Notes',
        desc: 'Audio to Summary & Quiz',
        icon: <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><PlayCircle size={24} /></div>
    },
    {
        id: 'pdf',
        title: 'PDF Summarizer',
        desc: 'Summarize Documents',
        icon: <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500"><FileText size={24} /></div>
    },
    {
        id: 'image-ai',
        title: 'Image AI',
        desc: 'Analyze Visual Content',
        icon: <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500"><ImageIcon size={24} /></div>
    },
    {
        id: 'homework',
        title: 'Homework Helper',
        desc: 'Step-by-step Explanations',
        icon: <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500"><BookOpen size={24} /></div>
    },
    {
        id: 'math',
        title: 'Math Solver',
        desc: 'Solve Complex Equations',
        icon: <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500"><Calculator size={24} /></div>
    },
  ];

  return (
    <div className="p-8 h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-400">What would you like to learn today?</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700 text-sm">
                    <PlayCircle size={16} />
                    View Demo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
                {cards.map((card) => (
                    <button 
                        key={card.id}
                        onClick={() => onNavigate(card.id)}
                        className="bg-gray-800 border border-gray-700 p-6 rounded-2xl text-left hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all group"
                    >
                        <div className="mb-4 group-hover:scale-110 transition-transform duration-300 origin-left">
                            {card.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">{card.title}</h3>
                        <p className="text-sm text-gray-500">{card.desc}</p>
                    </button>
                ))}
            </div>

            <div>
                <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center text-gray-500">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PlayCircle size={24} className="opacity-50" />
                    </div>
                    <p>No recent activity. Start a new session!</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;