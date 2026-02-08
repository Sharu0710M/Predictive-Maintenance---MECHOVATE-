
import { GoogleGenAI, Type } from "@google/genai";
import { Asset, AIInsight } from "../types";

export const getAssetInsight = async (asset: Asset): Promise<AIInsight> => {
  // Always initialize GoogleGenAI with a named parameter object as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const latest = asset.sensors[asset.sensors.length - 1];
  
  const prompt = `
    As an industrial AI diagnostic specialist, analyze this asset:
    Name: ${asset.name}
    Type: ${asset.type}
    Current Sensors: Temp ${latest.temperature.toFixed(1)}C, Vibration ${latest.vibration.toFixed(2)}mm/s, Current ${latest.current.toFixed(1)}A.
    Predicted RUL: ${asset.predictedRUL} days.
    Operating Load: ${asset.operatingLoad}%.
    Criticality: ${asset.criticality}/10.

    Explain:
    1. Why the maintenance priority is set based on these values.
    2. The most likely root cause based on sensor deviations.
    3. Specific recommended action for the plant engineer.
    4. Estimated percentage contribution of each sensor to the current risk level.
  `;

  // Upgraded to gemini-3-pro-preview for complex reasoning and diagnostic tasks.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reasoning: { 
            type: Type.STRING,
            description: "Detailed analysis of why this priority level was assigned."
          },
          recommendation: { 
            type: Type.STRING,
            description: "Actionable recommendation for the maintenance team."
          },
          rootCauseContribution: {
            type: Type.OBJECT,
            properties: {
              temperature: { type: Type.NUMBER, description: "Percentage contribution (0-100)" },
              vibration: { type: Type.NUMBER, description: "Percentage contribution (0-100)" },
              current: { type: Type.NUMBER, description: "Percentage contribution (0-100)" }
            },
            required: ["temperature", "vibration", "current"]
          }
        },
        required: ["reasoning", "recommendation", "rootCauseContribution"]
      }
    }
  });

  try {
    // Correctly accessing .text property (not a method) from GenerateContentResponse.
    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Model returned empty text output.");
    }
    return JSON.parse(textOutput.trim()) as AIInsight;
  } catch (e) {
    console.error("Failed to parse AI response as JSON", e);
    throw new Error("Predictive insight generation failed. Please try again.");
  }
};
