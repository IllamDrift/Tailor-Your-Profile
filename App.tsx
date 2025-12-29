
import React, { useState } from 'react';
import { DiscoveryForm } from './components/DiscoveryForm';
import { ProfileInput } from './components/ProfileInput';
import { ResumePreview } from './components/ResumePreview';
import { LoadingScreen } from './components/LoadingScreen';
import { DiscoveryAnswers, ProfileData, AppState, PersonalDetails } from './types';
import { generateProfessionalProfile, refineProfessionalProfile, generateCoverLetter } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    step: 'discovery',
    discovery: {
      targetRole: '',
      usage: [],
      audience: '',
      structure: 'hybrid',
      tone: 'corporate',
      constraints: '',
    },
    personal: {
      fullName: '',
      occupation: '',
      education: '',
      email: '',
      phone: '',
      location: ''
    },
    profile: {
      rawContent: '',
      attachments: [],
    },
    heroImage: null,
    result: null,
    error: null,
  });

  const [isRefining, setIsRefining] = useState(false);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);

  const handleDiscoverySubmit = (answers: DiscoveryAnswers) => {
    setState(prev => ({ ...prev, discovery: answers, step: 'input' }));
  };

  const handleProfileSubmit = async (profile: ProfileData, personal: PersonalDetails, heroImage: string | null) => {
    setState(prev => ({ ...prev, profile, personal, heroImage, step: 'processing', error: null }));
    
    try {
      const result = await generateProfessionalProfile(state.discovery, profile, personal);
      setState(prev => ({ ...prev, result, step: 'result' }));
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        step: 'input', 
        error: err instanceof Error ? err.message : 'An error occurred during generation.' 
      }));
    }
  };

  const handleRefine = async (request: string) => {
    if (!state.result) return;
    setIsRefining(true);
    try {
      const updatedResult = await refineProfessionalProfile(state.result, request, state.profile, state.personal);
      setState(prev => ({ ...prev, result: updatedResult }));
    } catch (err) {
      console.error(err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!state.result) return;
    setIsGeneratingCoverLetter(true);
    try {
      const coverLetter = await generateCoverLetter(state.result, state.discovery, state.personal);
      setState(prev => ({
        ...prev,
        result: prev.result ? { ...prev.result, coverLetter } : null
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to generate cover letter.");
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const handleInPlaceUpdate = (updatedResult: any) => {
    setState(prev => ({ ...prev, result: updatedResult }));
  };

  const reset = () => {
    setState({
      step: 'discovery',
      discovery: {
        targetRole: '',
        usage: [],
        audience: '',
        structure: 'hybrid',
        tone: 'corporate',
        constraints: '',
      },
      personal: {
        fullName: '',
        occupation: '',
        education: '',
        email: '',
        phone: '',
        location: ''
      },
      profile: {
        rawContent: '',
        attachments: [],
      },
      heroImage: null,
      result: null,
      error: null,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass-morphism border-b border-black/5 px-6 py-4 flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4C14.2091 4 16 5.79086 16 8C16 10.2091 14.2091 12 12 12C9.79086 12 8 10.2091 8 8C8 5.79086 9.79086 4 12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M6 19C6 16.2386 8.23858 14 11 14H13C14.0537 14 15.0292 14.3274 15.8341 14.8856" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M18.5 12L16.5 14M18.5 12L20.5 10M18.5 12L17.5 9M18.5 12L21 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M21.5 14.5L17.5 18.5L16.5 21.5L19.5 20.5L23.5 16.5L21.5 14.5Z" fill="currentColor"/>
              <path d="M16 21L19 20" stroke="white" strokeWidth="0.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tighter leading-none">Tailor Your Profile</h1>
            <span className="text-[9px] uppercase tracking-[0.2em] text-indigo-500 font-bold">Executive Architect</span>
          </div>
        </div>
        
        {state.step !== 'discovery' && (
          <button 
            onClick={reset}
            className="text-xs font-black text-indigo-600 hover:bg-white/60 px-4 py-2 rounded-full transition-all border border-indigo-100 uppercase tracking-widest"
          >
            New Narrative
          </button>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center py-10 px-4 md:px-8 max-w-7xl mx-auto w-full animate-fade-in">
        {state.step === 'discovery' && (
          <DiscoveryForm 
            initialData={state.discovery} 
            onSubmit={handleDiscoverySubmit} 
          />
        )}

        {state.step === 'input' && (
          <ProfileInput 
            error={state.error}
            onSubmit={handleProfileSubmit} 
            onBack={() => setState(prev => ({ ...prev, step: 'discovery' }))}
          />
        )}

        {state.step === 'processing' && <LoadingScreen />}

        {state.step === 'result' && state.result && (
          <ResumePreview 
            data={state.result} 
            personal={state.personal}
            heroImage={state.heroImage}
            onEdit={() => setState(prev => ({ ...prev, step: 'input' }))}
            onRefine={handleRefine}
            onGenerateCoverLetter={handleGenerateCoverLetter}
            isGeneratingCoverLetter={isGeneratingCoverLetter}
            onInPlaceUpdate={handleInPlaceUpdate}
            isRefining={isRefining}
          />
        )}
      </main>

      <footer className="py-8 border-t border-black/5 mt-auto text-center text-[10px] text-gray-400 no-print uppercase tracking-widest">
        <p className="font-bold">© {new Date().getFullYear()} Tailor Your Profile • High Impact Branding</p>
      </footer>
    </div>
  );
};

export default App;
