import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TEXT_MODEL = "openai/gpt-oss-120b";
const VISION_MODEL = "qwen/qwen3.6-27b";

/**
 * Extract structured fields from raw OCR text using Groq LLM.
 */
export async function extractReportFields(ocrText: string) {
  const response = await groq.chat.completions.create({
    model: TEXT_MODEL,
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content: `You are a medical report data extractor. Given raw OCR text from a medical report, extract structured fields. Return ONLY valid JSON with this shape:
{
  "testResults": [{ "testName": "string", "value": number, "unit": "string", "referenceRange": "string" }],
  "diagnosis": "string or null",
  "medication": "string or null",
  "doctorName": "string or null",
  "hospitalGuess": "string or null"
}
If a field cannot be determined, use null. Never fabricate values.`,
      },
      {
        role: "user",
        content: `Extract structured data from this medical report OCR text:\n\n${ocrText}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content || "{}";
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      testResults: [],
      diagnosis: null,
      medication: null,
      doctorName: null,
      hospitalGuess: null,
    };
  }
  return JSON.parse(jsonMatch[0]);
}

/**
 * Generate a plain-language explanation of a medical report.
 */
export async function generatePlainLanguageSummary(
  ocrText: string,
  extractedFields: {
    testResults: Array<{ testName: string; value: number; unit: string; referenceRange: string }>;
    diagnosis: string | null;
    medication: string | null;
  }
): Promise<string> {
  const response = await groq.chat.completions.create({
    model: TEXT_MODEL,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `You are a medical report explainer for patients with low health literacy. Your job is to translate medical jargon into simple, everyday language.

RULES:
- Explain what the report MEANS in plain language, not what it diagnoses
- Use hedged, descriptive language: "this measurement often relates to..." or "doctors look at this to assess..."
- Never say "you have X condition" — say things like "these results may suggest..." or "your doctor may discuss..."
- If values are outside normal ranges, mention it gently and suggest discussing with their doctor
- Keep it under 150 words
- Write at a 6th-grade reading level
- No medical jargon without immediate explanation`,
      },
      {
        role: "user",
        content: `Medical report text:\n${ocrText}\n\nExtracted data:\n${JSON.stringify(extractedFields, null, 2)}\n\nWrite a plain-language explanation.`,
      },
    ],
  });

  return response.choices[0]?.message?.content || "Summary unavailable. Please consult your doctor.";
}

/**
 * Extract text from image using Groq vision (qwen model).
 * Falls back gracefully if vision model is unavailable.
 */
export async function extractTextFromImage(imageBase64: string): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      model: VISION_MODEL,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract ALL text from this medical report image. Return the raw text exactly as it appears, preserving line breaks and formatting. Do not interpret or summarize — just extract the text.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    });

    return response.choices[0]?.message?.content || "";
  } catch (err: any) {
    console.error("[groq] vision extraction failed:", err.message);
    return "";
  }
}
