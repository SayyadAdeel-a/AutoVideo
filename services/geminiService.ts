import { GoogleGenAI, Type } from "@google/genai";

export const generateRemotionCode = async (topic: string, script: string, style: string, duration: number) => {
  const model = 'gemini-3-pro-preview';
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are a world-class Remotion developer.
    Your task: Generate a high-quality React + Remotion component for a video.
    
    CRITICAL TECHNICAL REQUIREMENTS:
    1. EXPORT TYPE: Use a named export for the main component: 'export const Main = (props: any) => { ... }'.
    2. IMPORTS: Include all necessary imports from 'remotion' and 'react'.
    3. ANIMATIONS: Use 'AbsoluteFill', 'useCurrentFrame', 'useVideoConfig', 'interpolate', and 'spring'.
    4. PROPS: Use props for dynamic content (topic, script).
    5. DESIGN: Make it visually stunning. Use gradients, modern typography, and smooth transitions.
    6. STYLE: Adhere to the "${style}" aesthetic.
    7. NO MARKDOWN: Output ONLY the raw TypeScript code. No backticks, no explanations.
    
    The video is about "${topic}". 
    The script to visualize is: "${script}".
    The total duration is ${duration} seconds.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: `Topic: ${topic}\nScript: ${script}\nStyle: ${style}\nDuration: ${duration}s`,
    config: {
      systemInstruction,
      responseMimeType: "text/plain", // We want raw code
    },
  });

  const code = response.text;
  if (!code) throw new Error("Gemini returned an empty response.");

  // Clean code if Gemini adds markdown markers despite instructions
  return code.replace(/```tsx/g, '').replace(/```typescript/g, '').replace(/```/g, '').trim();
};