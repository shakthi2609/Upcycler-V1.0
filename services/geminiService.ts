import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import type { AnalysisResult } from '../types';

const getAiClient = (): GoogleGenAI => {
    const apiKey = localStorage.getItem('gemini-api-key');
    if (!apiKey) {
        throw new Error("API key not found in local storage. Please set it.");
    }
    return new GoogleGenAI({ apiKey });
};

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

export const analyzeImage = async (imageFiles: File[]): Promise<AnalysisResult> => {
    try {
        const ai = getAiClient();
        const imageParts = await Promise.all(imageFiles.map(fileToGenerativePart));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{
                parts: [
                    { text: SYSTEM_PROMPT },
                    ...imageParts
                ],
            }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        identified_items: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                        },
                        project_ideas: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    project_name: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    materials_used: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING },
                                    },
                                    difficulty: { type: Type.STRING },
                                    time_required: { type: Type.STRING },
                                    step_by_step_guide: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING },
                                    },
                                    ai_image_prompt: { type: Type.STRING },
                                    youtube_search_query: { type: Type.STRING },
                                },
                                required: ["project_name", "description", "materials_used", "difficulty", "time_required", "step_by_step_guide", "ai_image_prompt", "youtube_search_query"],
                            },
                        },
                    },
                    required: ["identified_items", "project_ideas"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        const result: AnalysisResult = JSON.parse(jsonText);

        if (!result.identified_items || result.identified_items.length === 0) {
            throw new Error("No items were identified in the image. Please try again with a clearer photo against a plain background.");
        }

        return result;

    } catch (error) {
        console.error("Gemini API Error:", error);
        if (error instanceof Error) {
            if(error.message.includes('API key not valid')) {
                // Force user to re-enter key
                localStorage.removeItem('gemini-api-key');
                window.location.reload();
            }
            if(error.message.includes('SAFETY')) {
                throw new Error("The image could not be processed due to safety settings. Please try a different image.");
            }
            throw new Error(`An error occurred while analyzing the image: ${error.message}`);
        }
        throw new Error("An unknown error occurred while analyzing the image.");
    }
};

export const generateProjectImage = async (prompt: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image data found in response.");

    } catch (error) {
        console.error("Image Generation Error:", error);
        if (error instanceof Error) {
             if(error.message.includes('API key not valid')) {
                // Force user to re-enter key
                localStorage.removeItem('gemini-api-key');
                window.location.reload();
            }
            if(error.message.includes('SAFETY')) {
                throw new Error("The image could not be generated due to safety settings.");
            }
            throw new Error(`An error occurred while generating the image: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the image.");
    }
};