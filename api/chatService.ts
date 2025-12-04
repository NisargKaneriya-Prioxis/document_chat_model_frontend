export interface ChatResponse {
  answer: string;
  metadata?: any;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const askChatBot = async (query: string, sessionId: string): Promise<ChatResponse> => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        query: query, 
        session_id: sessionId 
      }),
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    return data;
    
  } catch (error) {
    console.error("Failed to fetch chat response:", error);
    throw error;
  }
};