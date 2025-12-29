
import { GoogleGenAI, Type } from "@google/genai";
import { DiscoveryAnswers, ProfileData, GeneratedProfile, PersonalDetails } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    oneLinePositioning: { type: Type.STRING },
    executiveSummary: { type: Type.STRING },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING }
        },
        required: ["title", "content"]
      }
    },
    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    atsVersion: { 
      type: Type.STRING,
      description: "A plaintext, markdown-formatted version of the resume optimized for Applicant Tracking Systems. Should include contact info, summary, skills, and experience in a clear, linear format."
    }
  },
  required: ["oneLinePositioning", "executiveSummary", "sections", "skills", "atsVersion"]
};

export async function generateProfessionalProfile(
  discovery: DiscoveryAnswers,
  profile: ProfileData,
  personal: PersonalDetails
): Promise<GeneratedProfile> {
  const textPrompt = `
    ROLE: Senior HR Strategist & Personal Branding Consultant.
    OBJECTIVE: Build a high-impact professional profile/resume.
    
    USER IDENTIFICATION:
    - Name: ${personal.fullName}
    - Current Role: ${personal.occupation}
    - Education: ${personal.education}
    - Contact: Email: ${personal.email}, Phone: ${personal.phone}, Location: ${personal.location}

    STRATEGY:
    - Target: ${discovery.targetRole}
    - Platform: ${discovery.usage.join(', ')}
    - Audience: ${discovery.audience}
    - Style: ${discovery.structure} / ${discovery.tone}
    ${discovery.jobDescription ? `- JOB DESCRIPTION CONTEXT: ${discovery.jobDescription}` : ''}
    
    CONTENT SOURCES:
    1. Provided Text: ${profile.rawContent}
    2. Portfolio/LinkedIn: ${profile.portfolioUrl || 'None'}
    
    STRICT COMPLIANCE RULES:
    - ABSOLUTELY NO HALLUCINATIONS. Do not invent companies, dates, or degrees not in the data.
    - SKILLFULLY RESTRUCTURE: Use the provided name and personal details in the narrative where appropriate.
    ${discovery.jobDescription ? '- MATCH JD: Mirror the terminology and core requirements found in the Job Description to ensure catchiness and keyword matching.' : ''}
    - ATS VERSION: Create a comprehensive plaintext version that includes all relevant contact info, skills, and experience sections for ATS parsing.
    
    Output must be JSON.
  `;

  const parts: any[] = [{ text: textPrompt }];
  profile.attachments.forEach(att => {
    parts.push({
      inlineData: {
        data: att.data.split(',')[1],
        mimeType: att.mimeType
      }
    });
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: "user", parts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    if (!response.text) throw new Error("No response from AI.");
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Strategy generation failed.");
  }
}

export async function generateCoverLetter(
  profile: GeneratedProfile,
  discovery: DiscoveryAnswers,
  personal: PersonalDetails
): Promise<string> {
  const prompt = `
    You are an expert executive resume writer. Generate a persuasive, high-impact cover letter.
    
    APPLICANT: ${personal.fullName}
    TARGET ROLE: ${discovery.targetRole}
    PERSONAL DETAILS: ${JSON.stringify(personal)}
    ${discovery.jobDescription ? `JOB DESCRIPTION: ${discovery.jobDescription}` : ''}
    
    PROFESSIONAL SUMMARY: ${profile.executiveSummary}
    KEY SKILLS: ${profile.skills.join(', ')}
    
    INSTRUCTIONS:
    1. Write a professional cover letter that bridges the applicant's experience with the role's requirements.
    2. Use a ${discovery.tone} tone.
    3. Keep it to roughly 300-400 words.
    4. Focus on impact and specific value proposition.
    5. Output the text in a clear, ready-to-copy format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    return response.text || "Failed to generate cover letter.";
  } catch (error) {
    console.error("Cover Letter Error:", error);
    throw new Error("Failed to generate cover letter.");
  }
}

export async function refineProfessionalProfile(
  currentResult: GeneratedProfile,
  userRequest: string,
  originalProfile: ProfileData,
  personal: PersonalDetails
): Promise<GeneratedProfile> {
  const prompt = `
    You are a professional profile architect. Apply user refinements to the current draft.
    
    STRICT CONTENT POLICY: 
    Stick only to the original source data and personal details.
    
    PERSONAL DATA:
    ${JSON.stringify(personal)}

    ORIGINAL SOURCE DATA:
    ${originalProfile.rawContent}
    
    CURRENT DRAFT:
    ${JSON.stringify(currentResult)}
    
    USER EDIT REQUEST:
    "${userRequest}"
    
    INSTRUCTIONS:
    1. Update the draft and the ATS version based on the user's request.
    2. Maintain the high-impact branding voice.
    3. Output the updated JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    if (!response.text) throw new Error("No response from AI.");
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Refine Error:", error);
    throw new Error("Failed to refine profile.");
  }
}
