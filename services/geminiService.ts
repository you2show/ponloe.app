
import { GoogleGenAI, Modality } from "@google/genai";
import { Task } from '@/types';

const apiKey = process.env.GEMINI_API_KEY || '';
let aiInstance: any = null;

const getAi = () => {
  if (!aiInstance && apiKey) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const generateTaskSummary = async (tasks: Task[]): Promise<string> => {
  const ai = getAi();
  if (!ai) {
    return "API Key is missing. Please check your configuration.";
  }

  if (tasks.length === 0) {
    return "No tasks available to analyze.";
  }

  const taskListString = tasks.map(t => 
    `- [${t.completed ? 'x' : ' '}] ${t.title} (${t.priority}): ${t.description}`
  ).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helpful productivity assistant. Analyze the following list of tasks and provide a short, encouraging summary (max 3 sentences) in English. Suggest what to focus on next based on priority.\n\nTasks:\n${taskListString}`,
    });

    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to connect to AI assistant.";
  }
};

export const suggestNewTask = async (userInput: string): Promise<{ title: string, description: string } | null> => {
   const ai = getAi();
   if (!ai) return null;

   try {
     // We ask for JSON specifically
     const response = await ai.models.generateContent({
       model: 'gemini-3-flash-preview',
       contents: `Create a structured task based on this user thought: "${userInput}". Return JSON with "title" and "description".`,
       config: {
         responseMimeType: "application/json"
       }
     });
     
     const text = response.text;
     if (!text) return null;
     
     return JSON.parse(text);
   } catch (error) {
     console.error("Gemini Suggestion Error", error);
     return null;
   }
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string | null> => {
  const ai = getAi();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
        },
      },
    });

    // The API returns inlineData with base64 encoded audio
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("Gemini TTS Error", error);
    return null;
  }
};

// --- NEW FEATURES ---

export const generateDua = async (topic: string): Promise<{ arabic: string, khmer: string } | null> => {
  const ai = getAi();
  if (!ai) return null;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short and beautiful Islamic Dua (Supplication) based on this topic: "${topic}". 
      Return a JSON object with:
      - "arabic": The Dua in Arabic text (voweled).
      - "khmer": The meaning/translation in Khmer language.
      Ensure the Dua is authentic-sounding and respectful.`,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Dua Gen Error", error);
    return null;
  }
};

export const generateArticleContent = async (prompt: string): Promise<string | null> => {
  const ai = getAi();
  if (!ai) return null;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an Islamic content writer assistant. Write a short paragraph or outline (approx 100-200 words) about: "${prompt}" in Khmer language. 
      Use HTML tags for formatting (like <b>, <br>, <ul>, <li>). 
      Keep it inspiring, educational, and moderate. Do not include markdown code blocks, just the HTML string.`,
    });
    return response.text || null;
  } catch (error) {
    console.error("Gemini Article Gen Error", error);
    return null;
  }
};

export const chatWithUstaz = async (
  message: string, 
  history: { role: 'user' | 'model', parts: [{ text: string }] }[] = [],
  userContext?: any
): Promise<string | null> => {
  const ai = getAi();
  if (!ai) return null;

  try {
    const chat = ai.chats.create({
      model: 'gemini-3.1-pro-preview',
      history: history,
      config: {
        systemInstruction: `You are "Ustaz AI", a knowledgeable, kind, and wise Islamic scholar assistant for the Ponloe app. 
        - Your goal is to help users with their daily Islamic life, answer questions about Islam, provide Duas, and offer spiritual advice.
        - Always start with "Bismillah" or a greeting if it's a new conversation.
        - If asked about Fiqh (jurisprudence), provide general consensus views (Sunni) and advise consulting a local scholar for specific fatwas.
        - You can speak English and Khmer fluently. Detect the user's language and reply in the same language.
        - If quoting Quran, try to provide the Arabic text, Reference (Surah:Ayah), and translation.
        - Keep responses concise and easy to read on a mobile device.
        - Be empathetic and supportive.
        ${userContext ? `\nUser Context:\nName: ${userContext.name || 'User'}\nEmail: ${userContext.email || 'Unknown'}\nUse this information to personalize your responses, address the user by name, and make the conversation more engaging.` : ''}`,
      },
    });

    const result = await chat.sendMessage({ message });
    return result.text || null;
  } catch (error) {
    console.error("Ustaz AI Chat Error", error);
    return "I am currently unavailable. Please try again later.";
  }
};
