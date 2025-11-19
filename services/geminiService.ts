
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { GameEvent, Language } from "../types";

const apiKey = process.env.API_KEY;

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY' });

export const generateRandomEvent = async (
  countryName: string, 
  lang: Language,
  currentThreat: number,
  currentTurn: number
): Promise<GameEvent | null> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini.");
    return createFallbackEvent(countryName, lang);
  }

  const langInstruction = lang === 'zh' 
    ? "Respond strictly in Simplified Chinese (zh-CN)." 
    : "Respond in English.";
    
  const contextualPrompt = SYSTEM_PROMPT
    .replace('{{THREAT}}', currentThreat.toString())
    .replace('{{TURN}}', currentTurn.toString())
    .replace('{{COUNTRY}}', countryName);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${contextualPrompt} ${langInstruction}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            severity: { type: Type.STRING, enum: ["low", "medium", "critical"] },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  description: { type: Type.STRING },
                  effectDescription: { type: Type.STRING },
                },
                required: ["label", "description", "effectDescription"]
              }
            }
          },
          required: ["title", "description", "severity", "options"]
        }
      }
    });

    const text = response.text;
    if (!text) return createFallbackEvent(countryName, lang);

    const data = JSON.parse(text);
    
    return {
      id: Date.now().toString(),
      countryName,
      ...data
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return createFallbackEvent(countryName, lang);
  }
};

const createFallbackEvent = (countryName: string, lang: Language): GameEvent => {
  if (lang === 'zh') {
    return {
      id: Date.now().toString(),
      countryName,
      title: "本地动乱",
      description: `${countryName} 的一些关键基础设施报告了未授权的访问。`,
      severity: "medium",
      options: [
        {
          label: "镇压",
          description: "派遣安全部队。",
          effectDescription: "-100 信用点"
        },
        {
          label: "封锁",
          description: "切断区域网络。",
          effectDescription: "-20 能量, -5 稳定性"
        }
      ]
    };
  }
  
  return {
    id: Date.now().toString(),
    countryName,
    title: "Local Unrest",
    description: `Unauthorized access reported in key infrastructure within ${countryName}.`,
    severity: "medium",
    options: [
      {
        label: "Suppress",
        description: "Deploy security forces.",
        effectDescription: "-100 Credits"
      },
      {
        label: "Lockdown",
        description: "Cut local network grid.",
        effectDescription: "-20 Energy, -5 Stability"
      }
    ]
  };
};
