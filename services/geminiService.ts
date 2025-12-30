import { GoogleGenAI, Type } from "@google/genai";
import { Candidate, RecruitmentPlan } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to check if API key is available
export const isAiAvailable = () => !!apiKey;

export const parseResume = async (base64Data: string, mimeType: string) => {
  if (!isAiAvailable()) {
    // Mock response if no API key
    return {
      name: "Alex Morgan",
      email: "alex.morgan@example.com",
      role: "Software Engineer",
      experience: 4,
      skills: ["JavaScript", "React", "Node.js", "System Design"],
      resumeSummary: "Simulated parsing: Detailed software engineer with 4 years of experience in full-stack development. Proven track record in fintech."
    };
  }

  const prompt = `
    You are an expert ATS (Applicant Tracking System) AI. 
    Extract the following information from the attached resume document in strict JSON format.
    
    Fields required:
    - name (string): Full name of the candidate
    - email (string): Contact email
    - role (string): The most relevant job title or target role
    - experience (number): Total years of relevant experience
    - skills (array of strings): Top 10 technical or professional skills
    - resumeSummary (string): A concise, 2-sentence professional summary
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest',
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            role: { type: Type.STRING },
            experience: { type: Type.NUMBER },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            resumeSummary: { type: Type.STRING },
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Resume Parsing failed", error);
    throw error;
  }
};

export const analyzeCandidate = async (candidate: Candidate, jobDescription: string) => {
  if (!isAiAvailable()) {
    // Mock response if no API key
    return {
      matchScore: 85,
      reasoning: "Review based on mock logic: Candidate skills appear relevant to the job description provided.",
      flags: ["Resume gap in 2021"],
      keySkills: candidate.skills
    };
  }

  try {
    const prompt = `
      You are an expert HR AI Agent. Analyze this candidate against the job description.
      
      Job Description: ${jobDescription}
      
      Candidate Resume Summary: ${candidate.resumeSummary}
      Candidate Skills: ${candidate.skills.join(', ')}
      Experience: ${candidate.experience} years
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER, description: "Score from 0 to 100 indicating fit" },
            reasoning: { type: Type.STRING, description: "A professional, short paragraph explaining the score" },
            flags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Potential red flags or risks" },
            keySkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top matching skills found" }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Analysis failed", error);
    throw error;
  }
};

export const answerPolicyQuestion = async (question: string, contextPolicies: string) => {
  if (!isAiAvailable()) {
    return "This is a simulated AI response. Please configure your API KEY to get real policy answers.";
  }

  try {
    const prompt = `
      You are a helpful HR Assistant. Answer the employee's question strictly based on the provided policy context.
      If the answer is not in the context, say so.
      
      Context:
      ${contextPolicies}
      
      Question: ${question}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Policy Q&A failed", error);
    return "Sorry, I couldn't process your request at this time.";
  }
};

export const analyzeLeaveRequest = async (description: string, employeeName: string) => {
  if (!isAiAvailable()) {
    return {
      recommendation: "Approve",
      reason: "Mock AI: Request appears reasonable based on standard leave policies.",
      confidenceScore: 85
    };
  }

  try {
    const prompt = `
      Act as an HR Operations AI. Evaluate the following leave request for approval.
      Employee Name: ${employeeName}
      Request Description: ${description}

      Determine if the request should be 'Approve' or 'Reject'.
      Provide a brief reason for the decision.
      Provide a confidence score (0-100).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendation: { type: Type.STRING, description: "Approve or Reject" },
            reason: { type: Type.STRING },
            confidenceScore: { type: Type.INTEGER }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Leave request analysis failed", error);
    throw error;
  }
};

export const generateRecruitmentPlan = async (goal: string): Promise<RecruitmentPlan> => {
  if (!isAiAvailable()) {
    return {
      timeline: "Q3 - Q4 2024",
      budgetEstimate: "$150,000 - $200,000",
      summary: "Mock Plan: This is a simulated response. Connect API Key for real AI planning.",
      hiringPhases: [
        {
          phaseName: "Immediate Hires",
          strategy: "Direct outreach on LinkedIn",
          roles: [{ title: "Senior Developer", count: 2, seniority: "Senior" }]
        }
      ]
    };
  }

  try {
    const prompt = `
      Act as a Senior HR Strategist. Create a detailed recruitment plan based on the following goal: "${goal}".
      Include a timeline, estimated budget (conservative), and breakdown of hiring phases with roles and strategy.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            timeline: { type: Type.STRING, description: "Estimated timeline (e.g. 3 months)" },
            budgetEstimate: { type: Type.STRING, description: "Estimated total recruitment & salary budget range" },
            summary: { type: Type.STRING, description: "Executive summary of the plan" },
            hiringPhases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phaseName: { type: Type.STRING },
                  strategy: { type: Type.STRING, description: "Sourcing strategy for this phase" },
                  roles: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        count: { type: Type.INTEGER },
                        seniority: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    
    return JSON.parse(response.text || '{}') as RecruitmentPlan;
  } catch (error) {
    console.error("Recruitment Planning failed", error);
    throw error;
  }
};

export const evaluatePerformance = async (role: string, metrics: { tasksCompleted: number, attendance: number, qualityScore: number }) => {
  if (!isAiAvailable()) {
    return {
      score: 85,
      analysis: `Mock Analysis: Performance is solid based on mock data for ${role}. Attendance and task completion rates are within expected parameters.`
    };
  }

  try {
    const prompt = `
      Act as an AI Performance Manager. Evaluate the employee based on the provided metrics.
      Role: ${role}
      Metrics:
      - Tasks Completed: ${metrics.tasksCompleted}
      - Attendance: ${metrics.attendance}%
      - Quality Score: ${metrics.qualityScore}/10

      Provide a performance score (0-100) and a concise analysis paragraph (max 50 words) highlighting strengths or weaknesses.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            analysis: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Performance Evaluation failed", error);
    throw error;
  }
};

export const draftProfessionalEmail = async (
  recipient: string,
  topic: string,
  tone: string,
  keyPoints: string
) => {
  if (!isAiAvailable()) {
    return {
      subject: `Subject: ${topic}`,
      body: `Dear ${recipient},\n\n[AI Draft Mode - API Key Missing]\n\nRegarding ${topic}:\n${keyPoints}\n\nPlease configure your API key to generate a full professional email draft.\n\nBest regards,\nHR Team`
    };
  }

  try {
    const prompt = `
      You are an expert HR Communication Assistant. Draft a professional email based on these parameters:
      
      Recipient Name: ${recipient}
      Topic/Purpose: ${topic}
      Tone: ${tone} (e.g., Professional, Empathetic, Stern, Formal)
      Key Points to Cover: ${keyPoints}
      
      Output strictly a JSON object with keys:
      - "subject": A clear, professional subject line.
      - "body": The email content. Use \\n for line breaks. Do not include placeholders like [Your Name] if possible, generic sign-off is fine.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            body: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Email drafting failed", error);
    throw error;
  }
};