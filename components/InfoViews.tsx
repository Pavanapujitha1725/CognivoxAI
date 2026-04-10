import React from 'react';
import { Clock, HelpCircle, Shield, Globe, PlayCircle, FileText, Calculator, ArrowRight } from 'lucide-react';
import { useHistory } from '../context/HistoryContext';

export const HistoryView: React.FC = () => {
  const { historyItems } = useHistory();

  // Helper to format the timestamp nicely
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="p-8 h-full overflow-y-auto max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Clock className="text-blue-500" />
          Recent Activity
        </h2>
        <p className="text-gray-400">View and access your previously generated notes and solutions.</p>
      </div>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        {historyItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No history yet. Start using the tools to see your activity here!
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-900/50 text-gray-200 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Resource Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {historyItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700/30 transition-colors group">
                  <td className="px-6 py-4 font-medium text-white">{item.title}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${item.type === 'Lecture' ? 'bg-blue-900 text-blue-300' : 
                        item.type === 'PDF' ? 'bg-purple-900 text-purple-300' :
                        item.type === 'Math' ? 'bg-green-900 text-green-300' :
                        item.type === 'Homework' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-pink-900 text-pink-300'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">{formatTimeAgo(item.timestamp)}</td>
                  <td className="px-6 py-4 text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                      {item.status}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-400 hover:text-blue-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export const HowToUseView: React.FC = () => {
  const guides = [
    {
      icon: <PlayCircle size={24} className="text-blue-500" />,
      title: "Lecture Notes",
      steps: [
        "Upload an audio file (MP3/WAV) or paste a YouTube URL.",
        "Wait for the AI to analyze the content.",
        "Access the Summary, Transcript, and taking the Quiz.",
        "Use the Charts tab to see topic breakdowns."
      ]
    },
    {
      icon: <FileText size={24} className="text-purple-500" />,
      title: "PDF Summarizer",
      steps: [
        "Click to upload a PDF document.",
        "The AI will extract key takeaways and a detailed summary.",
        "Perfect for research papers and textbooks."
      ]
    },
    {
      icon: <Calculator size={24} className="text-green-500" />,
      title: "Math & Homework",
      steps: [
        "Type your question or upload a photo of the problem.",
        "Receive step-by-step logic and solutions.",
        "Use the dedicated Math tool for complex equations."
      ]
    }
  ];

  const demoSteps = [
    {
      title: "Step 1: Select Your Tool",
      description: "Navigate to the dashboard using the sidebar. Choose 'Lecture Notes' for audio analysis, 'PDF Summarizer' for research documents, or 'Homework Helper' for specific questions.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
      caption: "Intuitive Dashboard"
    },
    {
      title: "Step 2: Upload Content",
      description: "Easily upload your study materials. For lectures, you can upload MP3 files or simply paste a YouTube URL. For math, you can even upload images of handwritten problems.",
      image: "https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?q=80&w=800&auto=format&fit=crop",
      caption: "Flexible Inputs"
    },
    {
      title: "Step 3: AI Processing",
      description: "Our advanced Gemini AI analyzes the content in seconds. It transcribes audio, identifies key topics, solves equations, and structures unstructured data into clear notes.",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop",
      caption: "Smart Analysis"
    },
    {
      title: "Step 4: Master the Subject",
      description: "Review the executive summary, take the auto-generated quiz to test your knowledge, and view the concept complexity charts to identify weak points.",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop",
      caption: "Effective Learning"
    }
  ];

  return (
    <div className="p-8 h-full overflow-y-auto max-w-6xl mx-auto custom-scrollbar">
       <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">How to use Cognivox AI</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">Master your studies with our suite of AI-powered tools. Follow this visual guide to get the best results.</p>
      </div>

      {/* Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {guides.map((guide, idx) => (
          <div key={idx} className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all">
            <div className="mb-6 w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center border border-gray-700">
              {guide.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-4">{guide.title}</h3>
            <ul className="space-y-3">
              {guide.steps.map((step, sIdx) => (
                <li key={sIdx} className="flex gap-3 text-sm text-gray-400 leading-relaxed">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                    {sIdx + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Demo Script / Visual Walkthrough Section */}
      <div className="border-t border-gray-800 pt-16 pb-16">
        <h3 className="text-2xl font-bold text-white mb-12 text-center flex items-center justify-center gap-2">
            <HelpCircle className="text-blue-500" />
            Visual Walkthrough
        </h3>
        
        <div className="space-y-24 relative">
            {/* Central Timeline Line (Desktop) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-800 -translate-x-1/2 hidden md:block rounded-full"></div>

            {demoSteps.map((step, index) => (
                <div key={index} className={`flex flex-col md:flex-row gap-8 items-center relative ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                    
                    {/* Number Badge */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 rounded-full border-4 border-[#030712] flex items-center justify-center font-bold text-white z-10 hidden md:flex shadow-lg shadow-blue-900/50">
                        {index + 1}
                    </div>

                    {/* Text Side */}
                    <div className="flex-1 md:text-right p-4">
                        <div className={`md:pr-12 ${index % 2 === 1 ? 'md:text-left md:pl-12 md:pr-0' : ''}`}>
                            <h4 className="text-xl font-bold text-white mb-3 text-blue-400">{step.title}</h4>
                            <p className="text-gray-300 leading-relaxed text-lg">{step.description}</p>
                        </div>
                    </div>

                    {/* Image Side */}
                    <div className="flex-1 w-full">
                        <div className={`relative group overflow-hidden rounded-2xl border border-gray-700 shadow-2xl ${index % 2 === 1 ? 'md:mr-12' : 'md:ml-12'}`}>
                            <div className="aspect-video bg-gray-900 relative">
                                <img 
                                    src={step.image} 
                                    alt={step.caption}
                                    className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity duration-700 transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent"></div>
                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                    <span className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-medium text-white border border-white/10 shadow-lg">
                                        {step.caption}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            ))}
        </div>

        <div className="mt-20 text-center">
             <p className="text-gray-400 mb-6">Ready to start learning smarter?</p>
             <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-900/20 inline-flex items-center gap-2">
                Get Started <ArrowRight size={20} />
             </button>
        </div>
      </div>
    </div>
  );
};

export const AboutView: React.FC = () => {
  return (
    <div className="p-8 h-full overflow-y-auto max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-10 border border-gray-700 text-center mb-12 relative overflow-hidden">
        <div className="relative z-10">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-900/50">
                <span className="text-4xl font-bold text-white">C</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">About Cognivox AI</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Cognivox AI acts as your intelligent 'second brain.' We bridge the gap between passive listening and active understanding. Instead of drowning in hours of raw audio or endless pages of text, Cognivox listens, reads, and analyzes alongside you.
            </p>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
            <Shield className="text-blue-500 mb-4" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">Privacy First</h3>
            <p className="text-gray-400">Your data is processed securely. We prioritize user privacy and data protection in every feature we build.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
            <Globe className="text-purple-500 mb-4" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">Powered by Gemini</h3>
            <p className="text-gray-400">Leveraging Google's advanced Gemini 2.0 Flash models for multimodal understanding of audio, video, and text.</p>
        </div>
      </div>

      <div className="text-center border-t border-gray-800 pt-12">
        <h3 className="text-white font-semibold mb-6">Built for the Future of Education</h3>
        <div className="flex justify-center gap-8">
            <div className="text-center">
                <p className="text-3xl font-bold text-white mb-1">10k+</p>
                <p className="text-sm text-gray-500">Students</p>
            </div>
            <div className="text-center">
                <p className="text-3xl font-bold text-white mb-1">500k+</p>
                <p className="text-sm text-gray-500">Notes Generated</p>
            </div>
            <div className="text-center">
                <p className="text-3xl font-bold text-white mb-1">99%</p>
                <p className="text-sm text-gray-500">Satisfaction</p>
            </div>
        </div>
      </div>
    </div>
  );
};