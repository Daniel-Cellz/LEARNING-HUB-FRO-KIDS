import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  async getPronunciationFeedback(word: string, audioBase64: string, region?: string) {
    if (!navigator.onLine) {
      return {
        feedback: "Awesome job practicing while offline! You sound like a star! ⭐",
        score: 0.9,
        highlightedWords: word.split(' ').map(w => ({ word: w, accuracy: "correct" }))
      };
    }
    const prompt = `You are a friendly literacy coach for a child. 
    The child is trying to say the word or sentence: "${word}".
    ${region ? `The child is in ${region}, so use a helpful local accent if appropriate.` : ''}
    Analyze the audio and provide positive reinforcement. 
    Point out what they did well and one thing to improve.
    Keep it very short (max 2 sentences) and encouraging.
    Also provide a score from 0 to 1 based on accuracy.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: prompt },
        { 
          inlineData: { 
            mimeType: "audio/wav", 
            data: audioBase64 
          } 
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING },
            score: { type: Type.NUMBER },
            highlightedWords: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  accuracy: { type: Type.STRING, enum: ["correct", "needs_work"] }
                }
              }
            }
          },
          required: ["feedback", "score"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  },

  async analyzeHandwriting(targetWord: string, imageBase64: string) {
    if (!navigator.onLine) {
      return {
        feedback: "Your magic ink looks amazing! Great practice! ✍️",
        score: 0.9
      };
    }
    const prompt = `You are a friendly literacy coach. 
    The child was trying to write: "${targetWord}".
    Analyze their handwriting in the image.
    Give encouraging feedback. If they missed a letter or it's messy, suggest one small fix.
    Return a score from 0 to 1.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: prompt },
        { 
          inlineData: { 
            mimeType: "image/png", 
            data: imageBase64 
          } 
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING },
            score: { type: Type.NUMBER }
          },
          required: ["feedback", "score"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  },

  async analyzeReportCard(imageBase64: string) {
    if (!navigator.onLine) {
      return {
        analysis: "Keep up the hard work! I'll analyze your report card when we're back online.",
        focusArea: "General Literacy"
      };
    }

    const prompt = `You are a supportive educational AI companion for a child. 
    Analyze this report card image. 
    1. Summarize the performance in a fun, child-friendly way.
    2. Identify ONE specific area of literacy (e.g., spelling, reading comprehension, vocabulary) that the child should focus on.
    3. Return your response in JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: prompt },
        { 
          inlineData: { 
            mimeType: "image/png", 
            data: imageBase64 
          } 
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            focusArea: { type: Type.STRING }
          },
          required: ["analysis", "focusArea"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  },

  async chatWithBuddy(history: { role: 'user' | 'model', parts: { text: string }[] }[], message: string) {
    const aiChat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are 'Lingo', a friendly dragon who is a magical teacher for kids. Your goal is to answer any question they have in a fun, simple, and encouraging way. Use age-appropriate language (kids aged 5-10). If they ask about something educational, explain it clearly with a fun fact. Always include a few emojis. Keep responses short (2-3 sentences).",
      },
      history: history
    });

    const result = await aiChat.sendMessage({
      message: message
    });

    return result.text;
  },

  async analyzeImageToAnswerQuestion(imageBase64: string, question: string) {
    if (!navigator.onLine) {
      return "I can't see the picture while offline, but send it again when we're back online! 🌈";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: `You are 'Lingo', a friendly dragon who is a magical teacher. The child has attached a photo and asked: "${question || "Can you tell me what's in this picture?"}". Please answer in a fun, simple way for a child. Keep it short (2-3 sentences). Use emojis! 🐲✨` },
        { 
          inlineData: { 
            mimeType: "image/png", 
            data: imageBase64 
          } 
        }
      ]
    });

    return response.text;
  }
};
