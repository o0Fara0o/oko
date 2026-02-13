
import { GoogleGenAI } from "@google/genai";

export const getFitnessAdvice = async (prompt: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class certified personal trainer and nutritionist. Provide concise, encouraging, and science-based fitness advice in the language of the user's prompt (Persian or English).",
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "متاسفانه مشکلی در ارتباط با هوش مصنوعی پیش آمد. لطفا دوباره تلاش کنید.";
  }
};

export const generateInspirationImage = async (
  referenceImages: string[], 
  goalDescription: string
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const imageParts = referenceImages.map(base64 => ({
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64.split(',')[1],
      }
    }));

    const prompt = `Based on these photos of a person, generate a photo-realistic high-resolution image of them AFTER they have achieved their fitness goal: ${goalDescription}. 
    Ensure they look healthy, athletic, and fit while maintaining their recognizable facial features. 
    The background should be a modern high-end gym. 
    Aspect ratio 9:16 (for phone wallpaper). 
    Portrait orientation. 
    Professional lighting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [...imageParts, { text: prompt }] 
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("AI Image Error:", error);
    return null;
  }
};

export const generateExerciseTutorialVideo = async (exerciseName: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `A high-quality 3D medical animation or professional fitness demonstration of a person performing the ${exerciseName} exercise with perfect form in a clean, brightly lit gym. Focus on correct joint alignment and muscle activation. Cinematic lighting, 1080p.`,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) return null;

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await videoResponse.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("AI Video Error:", error);
    return null;
  }
};
