import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle2, XCircle, ArrowRight, RefreshCcw, Trophy } from 'lucide-react';

interface QuizProps {
  questions: QuizQuestion[];
}

const Quiz: React.FC<QuizProps> = ({ questions }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
  };

  const checkAnswer = () => {
    if (selectedOption === null) return;
    
    if (selectedOption === questions[currentQ].correctIndex) {
      setScore(s => s + 1);
    }
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setCompleted(false);
  };

  if (completed) {
    return (
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
          <Trophy className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Quiz Completed!</h2>
        <p className="text-gray-400 mb-8">You scored {score} out of {questions.length}</p>
        
        <div className="w-full max-w-xs bg-gray-700 h-3 rounded-full overflow-hidden mb-8">
            <div 
                className="bg-blue-600 h-full transition-all duration-1000" 
                style={{width: `${(score / questions.length) * 100}%`}}
            ></div>
        </div>

        <button 
          onClick={resetQuiz}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
        >
          <RefreshCcw size={18} />
          Retake Quiz
        </button>
      </div>
    );
  }

  const question = questions[currentQ];

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden flex flex-col min-h-[500px]">
      <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
        <span className="text-sm font-medium text-gray-400">Question {currentQ + 1} of {questions.length}</span>
        <span className="text-sm font-medium text-blue-400">Score: {score}</span>
      </div>

      <div className="p-8 flex-1 flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-white mb-8 leading-relaxed">{question.question}</h3>

        <div className="space-y-4">
          {question.options.map((option, idx) => {
            let stateClass = "border-gray-700 bg-gray-800 hover:bg-gray-750 hover:border-gray-500";
            let icon = null;

            if (showResult) {
              if (idx === question.correctIndex) {
                stateClass = "border-green-500 bg-green-500/10 text-green-400";
                icon = <CheckCircle2 size={20} />;
              } else if (idx === selectedOption) {
                stateClass = "border-red-500 bg-red-500/10 text-red-400";
                icon = <XCircle size={20} />;
              } else {
                stateClass = "border-gray-700 opacity-50";
              }
            } else if (selectedOption === idx) {
              stateClass = "border-blue-500 bg-blue-500/10 text-blue-400 ring-1 ring-blue-500";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showResult}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${stateClass}`}
              >
                <span className="font-medium">{option}</span>
                {icon}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 bg-gray-800/50 border-t border-gray-700 flex justify-end">
        {!showResult ? (
          <button
            onClick={checkAnswer}
            disabled={selectedOption === null}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              selectedOption === null 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20'
            }`}
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-900/20 transition-all"
          >
            {currentQ === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;