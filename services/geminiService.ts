import { GoogleGenAI, Type } from "@google/genai";
import { PassportData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractPassportData = async (base64Image: string): Promise<PassportData> => {
  // Remove header if present
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64
          }
        },
        {
          text: `Analyze this passport image. Focus on the MRZ (Machine Readable Zone) and the Visual Inspection Zone.
          Extract the following fields accurately:
          - Surname (Family Name)
          - Given Names
          - Passport Number (Remove any < characters)
          - Nationality (3 letter ISO code)
          - Date of Birth (YYYY-MM-DD)
          - Sex (M or F)
          - Date of Expiry (YYYY-MM-DD)
          - Issuing Country Code (3 letter ISO code)
          
          If the MRZ contains '<' filler characters in the name, strip them out. Ensure names are UPPERCASE.`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          surname: { type: Type.STRING },
          givenNames: { type: Type.STRING },
          passportNumber: { type: Type.STRING },
          nationality: { type: Type.STRING },
          dateOfBirth: { type: Type.STRING },
          sex: { type: Type.STRING },
          dateOfExpiry: { type: Type.STRING },
          issuingCountry: { type: Type.STRING },
        },
        required: ["surname", "givenNames", "passportNumber", "nationality", "dateOfBirth", "sex", "dateOfExpiry", "issuingCountry"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No data returned from AI");
  }

  try {
    return JSON.parse(text) as PassportData;
  } catch (e) {
    console.error("Failed to parse JSON", e);
    throw new Error("Failed to parse passport data");
  }
};