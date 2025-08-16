import { GoogleGenAI, Type } from "@google/genai";
import { bulkUpdateQuestions, getQuestionsByDocument } from "./questionService";

const geminiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: geminiKey });

async function getRationale(questionText: string) {
  const prompt = `
Provide a clear and concise rationale or explanation as to why the given answer is correct for each question below in exactly one paragraph with at least 3 sentences each.
Return only a JSON array of strings, one rationale per question, in the same order as the questions.

"${questionText}"
  `;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
  });
  if (response.text) {
    return JSON.parse(response.text);
  }
}

export async function generateRationalesForQuestions(
  documentId: string,
  rationaleImageIndices: number[]
) {
  const questions = await getQuestionsByDocument(documentId);

  // Collect only questions that need a rationale
  const questionsToGenerate = questions
    .map((q, index) => ({ q, index }))
    .filter(
      ({ q, index }) =>
        (q.rationale === null || q.rationale.trim() === "") &&
        !rationaleImageIndices.includes(index)
    );

  if (questionsToGenerate.length === 0) return;

  // Concatenate all question texts
  let promptText = "";
  questionsToGenerate.forEach(({ q }, i) => {
    promptText += `Question ${i + 1}: ${q.question_text}\n`;
    q.choices.forEach((choice) => {
      promptText += `${choice.letter}. ${choice.text}\n`;
    });
    promptText += `Answer: ${q.answer}\n`;
    promptText += "\n";
  });

  const allRationales = await getRationale(promptText);

  console.log("Generated rationales:", allRationales);

  const updates = questionsToGenerate.map(({ q }, i) => ({
    id: q.id,
    data: { rationale: allRationales[i] || "" },
  }));
  console.log("Updates to be made:", updates);
  await bulkUpdateQuestions(updates);
}
