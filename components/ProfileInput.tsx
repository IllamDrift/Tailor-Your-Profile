
import React, { useState, useRef } from 'react';
import { ProfileData, ProfileMedia, PersonalDetails } from '../types';

interface Props {
  error: string | null;
  onSubmit: (data: ProfileData, personal: PersonalDetails, heroImage: string | null) => void;
  onBack: () => void;
}

export const ProfileInput: React.FC<Props> = ({ error, onSubmit, onBack }) => {
  const [content, setContent] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [attachments, setAttachments] = useState<ProfileMedia[]>([]);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  
  // Personal Details
  const [personal, setPersonal] = useState<PersonalDetails>({
    fullName: '',
    occupation: '',
    education: '',
    email: '',
    phone: '',
    location: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (re) => {
          const base64 = re.target?.result;
          if (typeof base64 === 'string') {
            setAttachments(prev => [...prev, { data: base64, mimeType: file.type }]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        const base64 = re.target?.result;
        if (typeof base64 === 'string') {
          setHeroImage(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!personal.fullName || !personal.occupation) {
      alert("Please provide your name and current occupation.");
      return;
    }
    if (content.length < 20 && attachments.length === 0 && !portfolioUrl) {
      alert("Please provide context via text, link, or file upload.");
      return;
    }
    onSubmit({ rawContent: content, portfolioUrl, attachments }, personal, heroImage);
  };

  return (
    <div className="w-full max-w-4xl space-y-8">
      <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/40 overflow-hidden">
        <div className="p-10 border-b border-black/5 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Information Core</h2>
            <p className="text-gray-500 font-medium mt-1">Provide your identifying details and raw experience assets.</p>
          </div>
          <button onClick={onBack} className="p-3 hover:bg-white/50 rounded-full transition-all text-gray-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
        </div>

        <div className="p-10 space-y-8">
          {error && <div className="p-4 bg-red-100/50 text-red-700 rounded-2xl text-xs font-bold border border-red-200">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Full Name *</label>
              <input 
                type="text" 
                placeholder="John Doe"
                className="w-full px-5 py-4 rounded-2xl dark-input focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={personal.fullName}
                onChange={e => setPersonal({...personal, fullName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Current Occupation *</label>
              <input 
                type="text" 
                placeholder="Senior Product Designer"
                className="w-full px-5 py-4 rounded-2xl dark-input focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={personal.occupation}
                onChange={e => setPersonal({...personal, occupation: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Education Qualification</label>
              <input 
                type="text" 
                placeholder="MSc in Computer Science"
                className="w-full px-5 py-4 rounded-2xl dark-input focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={personal.education}
                onChange={e => setPersonal({...personal, education: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Location</label>
              <input 
                type="text" 
                placeholder="New York, NY"
                className="w-full px-5 py-4 rounded-2xl dark-input focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={personal.location}
                onChange={e => setPersonal({...personal, location: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Email Address</label>
              <input 
                type="email" 
                placeholder="john@example.com"
                className="w-full px-5 py-4 rounded-2xl dark-input focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={personal.email}
                onChange={e => setPersonal({...personal, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Phone Number</label>
              <input 
                type="tel" 
                placeholder="+1 (555) 000-0000"
                className="w-full px-5 py-4 rounded-2xl dark-input focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={personal.phone}
                onChange={e => setPersonal({...personal, phone: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">LinkedIn / Portfolio URL</label>
            <input 
              type="url" 
              placeholder="https://..."
              className="w-full px-5 py-4 rounded-2xl dark-input focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={portfolioUrl}
              onChange={e => setPortfolioUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Bio / Detailed Work History</label>
            <textarea
              className="w-full h-64 p-6 rounded-[2rem] dark-input focus:ring-2 focus:ring-indigo-500 outline-none font-sans text-sm resize-none transition-all"
              placeholder="Paste existing history, bullet points, or old resume text here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-zinc-900 rounded-[2rem] text-white hover-lift">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                Legacy Assets
              </h3>
              <p className="text-xs text-zinc-400 mb-6">Upload PDFs, DocX, or Profile Screenshots.</p>
              <input type="file" ref={fileInputRef} multiple className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={handleFileUpload} />
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-zinc-800 rounded-xl text-xs font-bold hover:bg-zinc-700 transition-all">
                Select Files ({attachments.length})
              </button>
            </div>

            <div className="p-8 bg-white/60 border border-white/50 rounded-[2rem] hover-lift flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Hero Image
                </h3>
                <p className="text-xs text-gray-500">A professional portrait for the header.</p>
              </div>
              <input type="file" ref={heroInputRef} className="hidden" accept="image/*" onChange={handleHeroUpload} />
              <button 
                onClick={() => heroInputRef.current?.click()} 
                className={`mt-6 w-full py-3 rounded-xl text-xs font-bold border transition-all ${heroImage ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
              >
                {heroImage ? 'Portrait Loaded' : 'Upload Portrait'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-6 bg-black text-white font-bold rounded-[2rem] transition-all shadow-2xl hover:bg-zinc-800 flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-95"
      >
        Construct Final Narrative
        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
      </button>
    </div>
  );
};
