
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateRemotionCode = async (topic: string, script: string, style: string, duration: number) => {
  const model = 'gemini-3-pro-preview';
  
  const systemInstruction = `
    You are a world-class Remotion engineer. 
    Your task is to generate valid TypeScript React code for a Remotion composition.
    The composition ID MUST be "Main".
    The component should be named "Main".
    Import components from 'remotion' (AbsoluteFill, useCurrentFrame, useVideoConfig, Interpolate, spring, etc).
    The video should be visually appealing based on the user's requested style: ${style}.
    Topic: ${topic}.
    Script: ${script}.
    Include simple typography animations using 'spring' and 'interpolate'.
    The code must be a single file that can be bundled. 
    Wrap your response in a JSON object with a 'code' property containing the stringified TSX.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: `Generate a Remotion TSX file for a video about "${topic}" with this script: "${script}". Duration is ${duration} seconds. Style: ${style}.`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          code: {
            type: Type.STRING,
            description: "The complete valid TSX code for the Remotion Main composition."
          },
          explanation: {
            type: Type.STRING,
            description: "A short summary of what the code does."
          }
        },
        required: ["code"]
      }
    }
  });

  const result = JSON.parse(response.text);
  return result.code as string;
};
