import React, { createContext, useContext, useState, useEffect } from 'react';

export interface HistoryItem {
  id: string;
  type: 'Lecture' | 'PDF' | 'Image' | 'Homework' | 'Math';
  title: string;
  date: string;
  status: string;
  timestamp: number;
}

interface HistoryContextType {
  historyItems: HistoryItem[];
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'date' | 'timestamp'>) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('cognivox_history');
    if (saved) {
      try {
        setHistoryItems(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const addHistoryItem = (item: Omit<HistoryItem, 'id' | 'date' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 11),
      timestamp: Date.now(),
      date: new Date().toLocaleString(),
    };
    
    setHistoryItems(prev => {
      const updated = [newItem, ...prev].slice(0, 50); // keep last 50
      localStorage.setItem('cognivox_history', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <HistoryContext.Provider value={{ historyItems, addHistoryItem }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
