
import React, { useRef, useState, useEffect } from 'react';
import { GeneratedProfile, PersonalDetails } from '../types';
import html2pdf from 'html2pdf.js';

interface Props {
  data: GeneratedProfile;
  personal: PersonalDetails;
  heroImage: string | null;
  onEdit: () => void;
  onRefine: (request: string) => Promise<void>;
  onGenerateCoverLetter: () => Promise<void>;
  isGeneratingCoverLetter: boolean;
  onInPlaceUpdate: (updated: GeneratedProfile) => void;
  isRefining: boolean;
}

export const ResumePreview: React.FC<Props> = ({ 
  data, 
  personal, 
  heroImage, 
  onEdit, 
  onRefine, 
  onGenerateCoverLetter,
  isGeneratingCoverLetter,
  onInPlaceUpdate, 
  isRefining 
}) => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [refineInput, setRefineInput] = useState('');
  
  // Feedback Modal State
  const [showFeedback, setShowFeedback] = useState(false);
  const [pendingDownloadType, setPendingDownloadType] = useState<'pdf' | 'word' | null>(null);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  const executeDownload = () => {
    if (pendingDownloadType === 'pdf') {
      triggerPdfDownload();
    } else if (pendingDownloadType === 'word') {
      triggerWordDownload();
    }
    setShowFeedback(false);
    setRating(0);
    setFeedbackText('');
  };

  const handleDownloadClick = (type: 'pdf' | 'word') => {
    setPendingDownloadType(type);
    setShowFeedback(true);
  };

  const triggerPdfDownload = () => {
    if (!resumeRef.current) return;
    const element = resumeRef.current;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${personal.fullName.replace(/\s+/g, '_')}_Profile.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  const triggerWordDownload = () => {
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${personal.fullName} Profile</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.5; padding: 40pt; color: #1a1a1a; }
        h1 { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 28pt; font-weight: bold; border-bottom: 2px solid #333; margin-bottom: 5pt; }
        .occupation { font-size: 16pt; color: #4f46e5; font-weight: bold; margin-bottom: 15pt; }
        .contact { font-size: 10pt; color: #666; margin-bottom: 20pt; }
        .summary { font-size: 12pt; font-style: italic; color: #444; margin-bottom: 30pt; }
        h2 { font-size: 12pt; font-weight: bold; color: #4f46e5; text-transform: uppercase; margin-top: 25pt; letter-spacing: 2pt; border-bottom: 1px solid #eee; padding-bottom: 5pt; }
        p { margin-bottom: 12pt; font-size: 11pt; }
        .skills-header { font-size: 11pt; font-weight: bold; color: #444; margin-top: 30pt; }
        .skills-list { font-size: 10pt; color: #666; }
      </style>
      </head>
      <body>
        <h1>${personal.fullName}</h1>
        <p class="occupation">${personal.occupation}</p>
        <p class="contact">${personal.email} | ${personal.phone} | ${personal.location}</p>
        <p class="summary">${data.executiveSummary}</p>
        ${data.sections.map(s => `
          <h2>${s.title}</h2>
          <p>${s.content.replace(/\n/g, '<br>')}</p>
        `).join('')}
        <p class="skills-header">PROFESSIONAL COMPETENCIES</p>
        <p class="skills-list">${data.skills.join(' • ')}</p>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${personal.fullName.replace(/\s+/g, '_')}_Profile.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineInput.trim() || isRefining) return;
    onRefine(refineInput);
    setRefineInput('');
  };

  // Editable Handlers
  const updateSection = (index: number, content: string) => {
    const newSections = [...data.sections];
    newSections[index].content = content;
    onInPlaceUpdate({ ...data, sections: newSections });
  };

  const updateSummary = (content: string) => {
    onInPlaceUpdate({ ...data, executiveSummary: content });
  };

  const updatePositioning = (content: string) => {
    onInPlaceUpdate({ ...data, oneLinePositioning: content });
  };

  return (
    <div className="w-full max-w-5xl space-y-12 mb-20">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 no-print px-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Final Architecture</h2>
          <p className="text-gray-500 font-medium text-sm mt-2">Strategically mapped to your target opportunity. (Click text to edit in-place)</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={onGenerateCoverLetter} 
            disabled={isGeneratingCoverLetter}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all hover-lift shadow-sm flex items-center gap-2 ${data.coverLetter ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-white text-indigo-600 border-indigo-100'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            {isGeneratingCoverLetter ? 'Crafting...' : (data.coverLetter ? 'Regenerate Cover Letter' : 'Generate Cover Letter')}
          </button>
          <button onClick={() => handleDownloadClick('word')} className="px-6 py-3 bg-white text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-indigo-100 hover-lift shadow-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            As Word
          </button>
          <button onClick={() => handleDownloadClick('pdf')} className="px-8 py-3 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest hover-lift shadow-2xl flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            As PDF
          </button>
        </div>
      </div>

      {/* Main Resume Canvas */}
      <div ref={resumeRef} className="bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-gray-100 rounded-[3.5rem] overflow-hidden p-14 md:p-24 ats-text min-h-[1200px] relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-16 items-start mb-24 relative z-10 pb-20 border-b border-gray-50">
          {heroImage && (
            <div className="w-64 h-64 shrink-0 overflow-hidden rounded-[4.5rem] shadow-3xl border-8 border-white transform rotate-1">
              <img src={heroImage} alt="Portrait" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex flex-col gap-1 mb-6">
              <h2 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">{personal.fullName}</h2>
              <p className="text-xl font-bold text-indigo-600">{personal.occupation}</p>
              <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-medium mt-2">
                {personal.email && <span>{personal.email}</span>}
                {personal.phone && <span>{personal.phone}</span>}
                {personal.location && <span>{personal.location}</span>}
              </div>
            </div>

            <span className="inline-block px-5 py-2 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              Strategic Personal Branding
            </span>
            
            <h1 
              contentEditable 
              suppressContentEditableWarning
              onBlur={(e) => updatePositioning(e.target.innerText)}
              className="text-3xl md:text-5xl font-black text-gray-900 leading-[1.05] mb-8 tracking-tighter cursor-text hover:bg-slate-50 p-2 rounded-xl transition-colors outline-none"
            >
              {data.oneLinePositioning}
            </h1>
            
            <p 
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => updateSummary(e.target.innerText)}
              className="text-lg md:text-xl text-gray-400 font-light leading-relaxed max-w-4xl italic cursor-text hover:bg-slate-50 p-2 rounded-xl transition-colors outline-none"
            >
              {data.executiveSummary}
            </p>
          </div>
        </div>

        {/* Narrative Flow */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-24 relative z-10">
          <div className="md:col-span-8 space-y-24">
            {data.sections.map((section, idx) => (
              <div key={idx} className="group">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] shrink-0">
                    {section.title}
                  </h2>
                  <div className="h-px bg-gray-100 flex-1"></div>
                </div>
                <div 
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateSection(idx, e.target.innerText)}
                  className="text-gray-800 whitespace-pre-line leading-relaxed text-lg font-medium cursor-text hover:bg-slate-50 p-3 rounded-2xl border border-transparent hover:border-dashed hover:border-indigo-200 transition-all outline-none"
                >
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-4 space-y-16">
            <div>
              <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-10">Target Competencies</h2>
              <div className="flex flex-wrap gap-2.5">
                {data.skills.map((skill, idx) => (
                  <span key={idx} className="px-5 py-2.5 bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl text-[11px] font-bold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {personal.education && (
              <div>
                <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-6">Education</h2>
                <p className="text-sm font-bold text-gray-700">{personal.education}</p>
              </div>
            )}
            
            <div className="p-10 bg-black rounded-[3rem] text-white no-print shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg"></div>
                <h4 className="font-black text-xl tracking-tight">AI Audit</h4>
              </div>
              <p className="text-xs text-zinc-400 leading-loose">The phrasing and structure used here are specifically architected for semantic matching against high-tier executive roles.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Letter Section */}
      {data.coverLetter && (
        <div className="bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-gray-100 rounded-[3.5rem] overflow-hidden p-14 md:p-24 ats-text relative animate-fade-in">
           <div className="flex items-center gap-4 mb-12">
            <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] shrink-0">Professional Cover Letter</h2>
            <div className="h-px bg-gray-100 flex-1"></div>
            <button 
              onClick={() => {navigator.clipboard.writeText(data.coverLetter || ''); alert('Cover letter copied!');}}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 rounded-full no-print"
            >
              Copy Letter
            </button>
          </div>
          <div className="text-gray-800 whitespace-pre-line leading-relaxed text-lg font-medium">
            {data.coverLetter}
          </div>
        </div>
      )}

      {/* Refinement Panel */}
      <div className="bg-black/80 backdrop-blur-3xl rounded-[3rem] p-12 md:p-16 border border-white/10 no-print shadow-3xl transform transition-all hover:scale-[1.01]">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-white/10 rounded-2xl">
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Strategic Refinement</h3>
            <p className="text-zinc-400 font-medium text-sm">Need a major shift in focus? Request a full rewrite.</p>
          </div>
        </div>
        
        <form onSubmit={handleRefineSubmit} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="e.g., 'Make it more senior focused' or 'Add keywords for Google'" 
            className="flex-1 px-8 py-6 rounded-[2rem] dark-input text-lg font-medium shadow-inner"
            value={refineInput}
            onChange={e => setRefineInput(e.target.value)}
            disabled={isRefining}
          />
          <button 
            type="submit" 
            disabled={isRefining || !refineInput.trim()}
            className="px-12 py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
          >
            {isRefining ? 'Updating...' : 'Refine'}
          </button>
        </form>
      </div>

      {/* ATS Metadata Plaintext */}
      {data.atsVersion && (
        <div className="bg-zinc-950 rounded-[3rem] p-12 text-zinc-500 no-print border border-white/5">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-white font-black text-sm uppercase tracking-[0.3em] flex items-center gap-4 mb-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Plaintext Transfer Layer (ATS)
              </h3>
              <p className="text-xs text-zinc-600 font-medium">Use this version for automated applications that require plaintext formatting.</p>
            </div>
            <button 
              onClick={() => {navigator.clipboard.writeText(data.atsVersion || ''); alert('Copied to clipboard!');}}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-400 transition-all flex items-center gap-2"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              Copy All
            </button>
          </div>
          <div className="bg-black/50 border border-white/5 p-10 rounded-3xl font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap text-zinc-400 selection:bg-indigo-600 selection:text-white border-dashed">
            {data.atsVersion}
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 md:p-14 shadow-2xl animate-fade-in">
            <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Your Feedback</h3>
            <p className="text-gray-500 mb-8 font-medium">How was your experience building your profile with us today?</p>
            
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-2 transition-all transform hover:scale-125 ${rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                >
                  <svg className="w-10 h-10 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>

            <textarea
              className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm mb-8 h-32 resize-none"
              placeholder="Any additional thoughts or feature requests? (Optional)"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            ></textarea>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowFeedback(false)} 
                className="flex-1 py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDownload}
                disabled={rating === 0}
                className="flex-[2] py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 transition-all"
              >
                Proceed to Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
