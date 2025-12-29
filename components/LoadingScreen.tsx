
import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "Analyzing core strengths and impact points...",
  "Aligning narrative with target role...",
  "Applying senior HR strategy logic...",
  "Removing redundancy and storytelling excess...",
  "Drafting executive summary...",
  "Optimizing for maximum authority and confidence...",
  "Polishing final structure...",
];

export const LoadingScreen: React.FC = () => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIdx(prev => (prev + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <div className="relative mb-8">
        <div className="w-20 h-20 border-4 border-indigo-100 rounded-full"></div>
        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Architecting Your Profile</h2>
      <p className="text-indigo-600 font-medium h-6 text-center">{MESSAGES[msgIdx]}</p>
      
      <div className="mt-12 max-w-sm text-center">
        <p className="text-xs text-gray-400">Our AI-strategist is processing your request using the highest standards of executive branding. This usually takes 10-20 seconds.</p>
      </div>
    </div>
  );
};
