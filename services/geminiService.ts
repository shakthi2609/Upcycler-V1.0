import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import type { AnalysisResult, ProjectIdea } from '../types';

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

export const analyzeImage = async (imageFiles: File[], apiKey: string, dislikedProjects: ProjectIdea[] = []): Promise<AnalysisResult> => {
    try {
        if (!apiKey) {
            throw new Error("Please provide your API key in the settings.");
        }
        const ai = getAiClient(apiKey);
        const imageParts = await Promise.all(imageFiles.map(fileToGenerativePart));

        const textParts = [{ text: SYSTEM_PROMPT }];

        if (dislikedProjects.length > 0) {
            const feedbackPrompt = `\n\nIMPORTANT CONTEXT: The user has previously disliked the following project ideas. Avoid generating suggestions that are similar in concept or materials.
            Disliked Projects:
            ${dislikedProjects.map(p => `- ${p.project_name}: ${p.description}`).join('\n')}
            `;
            textParts.push({ text: feedbackPrompt });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{
                parts: [
                    ...textParts,
                    ...imageParts
                ],
            }],
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        const responseText = response.text.trim();
        // The model may return markdown ```json ... ```, so we extract the JSON part.
        const jsonMatch = responseText.match(/```(json)?\s*(\{[\s\S]*\})\s*```/);
        let jsonText: string;

        if (jsonMatch && jsonMatch[2]) {
            jsonText = jsonMatch[2];
        } else {
            // Fallback for plain JSON response
            const jsonStartIndex = responseText.indexOf('{');
            const jsonEndIndex = responseText.lastIndexOf('}');
            if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
                jsonText = responseText.substring(jsonStartIndex, jsonEndIndex + 1);
            } else {
                throw new Error("Could not find a valid JSON object in the model's response.");
            }
        }
        
        const result: AnalysisResult = JSON.parse(jsonText);

        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        if (groundingMetadata?.groundingChunks) {
            result.groundingSources = groundingMetadata.groundingChunks
                .filter(chunk => chunk.web)
                .map(chunk => ({
                    uri: chunk.web!.uri,
                    title: chunk.web!.title,
                }));
        }

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