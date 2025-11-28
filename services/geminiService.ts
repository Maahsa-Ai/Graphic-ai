

import { GoogleGenAI } from "@google/genai";
import { Character, ChatMessage, SearchResult, NewsItem } from "../types";

// Initialize API Client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// 1. Smart Search Service with Google Grounding
export const smartSearch = async (query: string): Promise<SearchResult> => {
  if (!apiKey) {
    return { 
      answer: "کلید API تنظیم نشده است.", 
      sources: [] 
    };
  }

  try {
    // Using Google Search Tool for grounded answers
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `
          You are a helpful graphic design assistant. 
          - Answer the user's question CONCISELY in Persian (Farsi).
          - If the user asks about a specific color (e.g., "Red", "Pastel Blue"), ALWAYS provide its Hex code (e.g., #FF0000) in the answer.
          - If the user asks for a tool, mention the website URL if found.
          - Do NOT use JSON format. Return natural language text.
          - Keep the response short and direct.
        `,
      }
    });

    // Extract text
    const text = response.text || "نتیجه‌ای یافت نشد.";

    // Extract Grounding Metadata (Sources)
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => {
        if (chunk.web) {
          return { title: chunk.web.title, uri: chunk.web.uri };
        }
        return null;
      })
      .filter((s: any) => s !== null) || [];

    return {
      answer: text,
      sources: sources as { title: string; uri: string }[]
    };

  } catch (error) {
    console.error("Error in smart search:", error);
    return {
      answer: "متاسفانه در جستجو مشکلی پیش آمد. لطفا اتصال اینترنت خود را بررسی کنید.",
      sources: []
    };
  }
};

// 2. Character Chat Service
export const chatWithCharacter = async (
  character: Character, 
  history: ChatMessage[], 
  newMessage: string
): Promise<string> => {
  if (!apiKey) return "کلید API تنظیم نشده است.";

  try {
    // Convert generic ChatMessage to SDK Content format
    const historyContents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `
          You are roleplaying as ${character.name}.
          Age: ${character.age}
          Job: ${character.job}
          Design Style: ${character.style}
          Personality Traits: ${character.traits.join(', ')}
          Tone of Voice: ${character.tone}
          Bio: ${character.bio}

          Your task is to act EXACTLY like this persona. 
          - Respond in Persian.
          - Critique designs or give advice based on your specific 'Design Style' and 'Job'.
          - Use the 'Tone of Voice' defined.
          - Keep responses concise unless asked for a deep analysis.
        `,
      },
      history: historyContents,
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "";

  } catch (error) {
    console.error("Error in character chat:", error);
    return "متاسفانه در ارتباط با این شخصیت مشکلی پیش آمده است.";
  }
};

// 3. Auto Tagging Service
export const generateTagsForFile = async (fileName: string): Promise<string[]> => {
  if (!apiKey) return ["General", "File"];
  
  try {
    const prompt = `Generate 3 Persian tags for a design file named: "${fileName}". Return ONLY comma separated words.`;
    
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    if (result.text) {
      const tags = result.text.split(/[,\n]+/).map(t => t.trim()).filter(t => t.length > 0);
      return tags.length > 0 ? tags : ["Graphic", "Asset"];
    }
    return ["Graphic", "Asset"];
  } catch (e) {
    console.error("Tagging error - returning defaults", e);
    return ["گرافیک", "فایل", "طراحی"];
  }
};

// 4. Design News Service
export const fetchDesignNews = async (): Promise<NewsItem[]> => {
  if (!apiKey) return [];

  try {
    const prompt = `
      Find 3 of the most recent and interesting news stories in Graphic Design (Global and Iranian) from the last week.
      Include a mix of reputable sources (e.g., Roozrang, Neshan, Dezeen, Behance, Creative Boom).
      
      Format the output strictly as a list where each item is separated by "|||". 
      Inside each item, format it exactly like this:
      TITLE: [Headline in Persian]
      SOURCE: [Source Name in Persian or English]
      SUMMARY: [Brief summary in Persian (max 150 chars)]
      URL: [Link to the article if found, otherwise write 'None']
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "";
    
    // Parse the structured text
    const items = text.split('|||').map(item => {
      const lines = item.trim().split('\n').filter(l => l.trim().length > 0);
      
      const getVal = (key: string) => {
        const line = lines.find(l => l.toUpperCase().startsWith(key));
        return line ? line.substring(key.length).trim() : '';
      };

      const title = getVal('TITLE:');
      const source = getVal('SOURCE:');
      const summary = getVal('SUMMARY:');
      let url = getVal('URL:');
      
      if (url === 'None' || url === '') {
        // Fallback: try to find any http link in the text block
        const urlMatch = item.match(/https?:\/\/[^\s]+/);
        if (urlMatch) url = urlMatch[0];
      }

      return {
        title: title || 'خبر جدید',
        source: source || 'دنیای دیزاین',
        summary: summary || 'برای مشاهده جزئیات کلیک کنید.',
        url: url !== 'None' ? url : '#',
        date: new Date().toLocaleDateString('fa-IR')
      };
    }).filter(i => i.title.length > 5); // Filter out empty or malformed items

    // If parsing failed significantly, return empty to avoid ugly UI
    if (items.length === 0) return [];

    return items.slice(0, 3);

  } catch (error) {
    console.error("News fetch error", error);
    return [];
  }
};

// 5. Brief Assistant Service
export const generateBriefAssist = async (title: string, client: string): Promise<any> => {
  if (!apiKey) return null;

  try {
    const prompt = `
      Write a professional graphic design brief structure for a project titled "${title}" for client "${client}".
      Output ONLY a JSON object with these keys (content in Persian):
      {
        "objective": "Main goal of the design",
        "targetAudience": "Who is this for?",
        "deliverables": "List of typical items (Logo, Poster, etc.)",
        "preferences": "Suggested style or preferences based on the client/project type"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Brief assist error", error);
    return null;
  }
};
