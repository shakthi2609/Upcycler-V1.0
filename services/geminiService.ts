import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import type { AnalysisResult } from '../types';

const getAiClient = (apiKey: string): GoogleGenAI => {
    if (!apiKey) {
        throw new Error("API key is missing.");
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

export const analyzeImage = async (imageFiles: File[], apiKey: string): Promise<AnalysisResult> => {
    try {
        if (!apiKey) {
            throw new Error("Please provide your API key in the settings.");
        }
        const ai = getAiClient(apiKey);
        const imageParts = await Promise.all(imageFiles.map(fileToGenerativePart));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
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
                                    variations_and_alternatives: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING },
                                    },
                                    ai_image_prompt: { type: Type.STRING },
                                    youtube_search_query: { type: Type.STRING },
                                },
                                required: ["project_name", "description", "materials_used", "difficulty", "time_required", "step_by_step_guide", "variations_and_alternatives", "ai_image_prompt", "youtube_search_query"],
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
            if (error.message.includes('API key not valid')) {
                throw new Error("Your API key is not valid. Please check it and try again.");
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
        // Using Pollinations.ai for free, key-less image generation.
        // The API returns an image directly from the URL.
        const encodedPrompt = encodeURIComponent(prompt);
        // Added some parameters for better image quality based on Pollinations docs
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&nologo=true`;

        // The API doesn't require a fetch call; the URL itself is the result.
        // We'll return it as a resolved promise to maintain the async function signature.
        return Promise.resolve(imageUrl);

    } catch (error) {
        console.error("Image Generation Error:", error);
        if (error instanceof Error) {
            throw new Error(`An error occurred while generating the image: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the image.");
    }
};