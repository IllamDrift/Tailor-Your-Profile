
import React, { useState } from 'react';
import { DiscoveryAnswers, UsageType, StructurePreference, TonePreference } from '../types';

interface Props {
  initialData: DiscoveryAnswers;
  onSubmit: (data: DiscoveryAnswers) => void;
}

export const DiscoveryForm: React.FC<Props> = ({ initialData, onSubmit }) => {
  const [answers, setAnswers] = useState<DiscoveryAnswers>(initialData);

  const usageOptions: { value: UsageType; label: string }[] = [
    { value: 'resume', label: 'Resume Builder' },
    { value: 'linkedin', label: 'LinkedIn Profile' },
    { value: 'portfolio', label: 'Webpage Portfolio' },
    { value: 'pitch-deck', label: 'Corporate / VC Pitch Deck' },
    { value: 'public-profile', label: 'Public Profile' },
    { value: 'delegate-intro', label: 'Delegate Introduction' },
    { value: 'academic', label: 'Academic Submission' },
  ];

  const toggleUsage = (val: UsageType) => {
    setAnswers(prev => ({
      ...prev,
      usage: prev.usage.includes(val) 
        ? prev.usage.filter(u => u !== val)
        : [...prev.usage, val]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answers.targetRole || answers.usage.length === 0) {
      alert("Please specify a target role and at least one usage context.");
      return;
    }
    onSubmit(answers);
  };

  const isResumeSelected = answers.usage.includes('resume');

  return (
    <div className="w-full max-w-2xl bg-white/40 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/40 p-10">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-gray-900 mb-2">Strategy Session</h2>
        <p className="text-gray-500 font-medium">Define the context clusters for your professional narrative.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">1. Target Opportunity</label>
          <input 
            type="text"
            placeholder="e.g. Creative Director, Full-Stack Engineer"
            className="w-full px-5 py-4 rounded-2xl dark-input focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={answers.targetRole}
            onChange={e => setAnswers({ ...answers, targetRole: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">2. Context Clusters</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {usageOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleUsage(opt.value)}
                className={`flex items-center p-4 rounded-2xl border transition-all text-sm ${
                  answers.usage.includes(opt.value)
                    ? 'border-indigo-600 bg-white text-indigo-700 font-bold shadow-md'
                    : 'border-white/50 bg-white/30 text-gray-600 hover:bg-white/50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center mr-3 ${
                  answers.usage.includes(opt.value) ? 'bg-indigo-600 text-white shadow-sm' : 'border-2 border-gray-300'
                }`}>
                  {answers.usage.includes(opt.value) && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                  )}
                </div>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {isResumeSelected && (
          <div className="animate-fade-in">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Job Description (Catchy Optimization)</label>
            <textarea
              placeholder="Paste the Job Description here to tailor your resume and cover letter..."
              className="w-full px-5 py-4 rounded-2xl dark-input focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-32 resize-none"
              value={answers.jobDescription || ''}
              onChange={e => setAnswers({ ...answers, jobDescription: e.target.value })}
            />
            <p className="mt-2 text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Optimizes for Applicant Tracking Systems & Hiring Managers</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">3. Structure</label>
            <select 
              className="w-full px-5 py-4 rounded-2xl dark-input focus:ring-2 focus:ring-indigo-500 outline-none"
              value={answers.structure}
              onChange={e => setAnswers({ ...answers, structure: e.target.value as StructurePreference })}
            >
              <option value="hybrid">Hybrid Balance</option>
              <option value="job-focused">Job Experience First</option>
              <option value="skill-focused">Skill Matrix First</option>
              <option value="authority-focused">Authority & Impact</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">4. Narrative Tone</label>
            <select 
              className="w-full px-5 py-4 rounded-2xl dark-input focus:ring-2 focus:ring-indigo-500 outline-none"
              value={answers.tone}
              onChange={e => setAnswers({ ...answers, tone: e.target.value as TonePreference })}
            >
              <option value="corporate">Executive Corporate</option>
              <option value="warm">Warm & Human</option>
              <option value="confident">Bold & Confident</option>
              <option value="minimal">Sleek & Minimal</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-5 bg-black text-white font-bold rounded-2xl transition-all shadow-xl hover:bg-gray-900 active:scale-95 flex items-center justify-center gap-3"
        >
          Begin Architecture
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </form>
    </div>
  );
};
