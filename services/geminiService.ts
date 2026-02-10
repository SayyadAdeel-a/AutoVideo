
import { GoogleGenAI, Type } from "@google/genai";

export const generateRemotionCode = async (topic: string, script: string, style: string, duration: number) => {
  const model = 'gemini-3-pro-preview';
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are a world-class Remotion engineer. 
    Your task is to generate valid TypeScript React code for a Remotion composition.
    
    CRITICAL RULES:
    1. The component MUST be exported as a NAMED export: export const Main = () => { ... }
    2. Do NOT use default exports.
    3. Import components ONLY from 'remotion' or 'lucide-react' (if needed).
    4. Topic: ${topic}.
    5. Script: ${script}.
    6. Duration: ${duration} seconds.
    7. Style: ${style}.
    8. Use AbsoluteFill, useCurrentFrame, useVideoConfig, Interpolate, spring for animations.
    9. Ensure the code is self-contained and syntactically perfect.
    10. Return ONLY the code in a JSON field named "code".
  `;

  const response = await ai.models.generateContent({
    model,
    contents: `Generate a Remotion TSX file for a video about "${topic}" with this script: "${script}". Duration: ${duration}s. Style: ${style}.`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          code: {
            type: Type.STRING,
            description: "The complete valid TSX code with a named export 'Main'."
          }
        },
        required: ["code"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from Gemini");

  try {
    const result = JSON.parse(text);
    // Sanitize any potential markdown wrappers if the model ignored responseMimeType
    return result.code.replace(/```tsx|```/g, '').trim();
  } catch (e) {
    console.error("Failed to parse Gemini JSON:", text);
    throw new Error("Invalid code format received from AI");
  }
};
