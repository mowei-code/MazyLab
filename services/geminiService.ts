
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import type { GeneratedAd, AspectRatioValue } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}
const apiKey = process.env.API_KEY;

const ai = new GoogleGenAI({ apiKey });

export const generateImageFromText = async (prompt: string): Promise<{ url: string; base64: string; mimeType: string }> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("Image generation failed to produce an image.");
    }

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    const mimeType = 'image/png';
    const url = `data:${mimeType};base64,${base64ImageBytes}`;

    return { url, base64: base64ImageBytes, mimeType };
};

export const compositeImages = async (
  images: { base64ImageData: string; mimeType: string }[],
  prompt: string
): Promise<{ url: string; base64: string; mimeType: string }> => {
    const imageParts = images.map(image => ({
        inlineData: {
            data: image.base64ImageData,
            mimeType: image.mimeType,
        },
    }));

    const contents = {
        parts: [
            ...imageParts,
            { text: prompt || "Combine these images into a single, cohesive product shot." },
        ],
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: contents,
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64 = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;
            const url = `data:${mimeType};base64,${base64}`;
            return { url, base64, mimeType };
        }
    }

    throw new Error("Image composition failed. The model did not return an image.");
};

export const generateImageAd = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string,
  aspectRatio: AspectRatioValue
): Promise<GeneratedAd> => {
    const imagePart = {
        inlineData: {
            data: base64ImageData,
            mimeType: mimeType,
        },
    };

    const textPart = { text: `${prompt} The final image must have an aspect ratio of ${aspectRatio}.` };

    const contents = { parts: [imagePart, textPart] };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: contents,
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    let imageUrl: string | null = null;
    let adText: string | null = null;

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64 = part.inlineData.data;
            const imageMimeType = part.inlineData.mimeType;
            imageUrl = `data:${imageMimeType};base64,${base64}`;
        } else if (part.text) {
            adText = part.text;
        }
    }

    if (!imageUrl) {
        throw new Error("Ad generation failed. The model did not return an image.");
    }

    return { type: 'image', url: imageUrl, text: adText };
};

export const generateVideo = async (
    base64ImageData: string,
    mimeType: string,
    prompt: string,
    aspectRatio: AspectRatioValue
): Promise<any> => {
    // The VEO model's aspect ratio is determined by the input image.
    // The prompt is passed directly.
    const fullPrompt = prompt;
    
    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: fullPrompt,
      image: {
        imageBytes: base64ImageData,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1
      }
    });

    return operation;
};

export const getVideosOperation = async (operation: any): Promise<any> => {
    const updatedOperation = await ai.operations.getVideosOperation({operation: operation});
    return updatedOperation;
};

export const fetchVideo = async (videoUri: string): Promise<string> => {
    if (!apiKey) {
        throw new Error("API Key not found for fetching video.");
    }
    const response = await fetch(`${videoUri}&key=${apiKey}`);
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Failed to fetch video:", response.status, errorBody);
        throw new Error(`Failed to fetch video file: ${response.statusText}`);
    }
    const blob = await response.blob();
    const objectURL = URL.createObjectURL(blob);
    return objectURL;
};