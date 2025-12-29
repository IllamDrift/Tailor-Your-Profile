
export type StructurePreference = 'job-focused' | 'skill-focused' | 'authority-focused' | 'hybrid';
export type TonePreference = 'corporate' | 'warm' | 'confident' | 'minimal';
export type UsageType = 
  | 'resume' 
  | 'linkedin' 
  | 'portfolio' 
  | 'pitch-deck' 
  | 'public-profile' 
  | 'delegate-intro' 
  | 'academic';

export interface PersonalDetails {
  fullName: string;
  occupation: string;
  education: string;
  email: string;
  phone: string;
  location: string;
}

export interface DiscoveryAnswers {
  targetRole: string;
  usage: UsageType[];
  jobDescription?: string;
  audience: string;
  structure: StructurePreference;
  tone: TonePreference;
  constraints: string;
}

export interface ProfileMedia {
  data: string; // base64
  mimeType: string;
}

export interface ProfileData {
  rawContent: string;
  portfolioUrl?: string;
  attachments: ProfileMedia[];
}

export interface ResumeSection {
  title: string;
  content: string;
}

export interface GeneratedProfile {
  oneLinePositioning: string;
  executiveSummary: string;
  sections: ResumeSection[];
  atsVersion?: string;
  skills: string[];
  coverLetter?: string;
}

export interface AppState {
  step: 'discovery' | 'input' | 'processing' | 'result';
  discovery: DiscoveryAnswers;
  personal: PersonalDetails;
  profile: ProfileData;
  heroImage: string | null;
  result: GeneratedProfile | null;
  error: string | null;
}
