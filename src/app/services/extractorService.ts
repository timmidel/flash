import * as cheerio from "cheerio";
import { convert } from "html-to-text";
import { Choice, Question } from "../types/item";
import { createQuestion, updateQuestions } from "./questionService";
import { createChoices } from "./choiceService";

const convertNestedOlToParagraphs = (html: string): string => {
  const $ = cheerio.load(html);

  // Target only nested <ol> elements
  $("ol ol, ul ol").each((_, nestedOl) => {
    const $nested = $(nestedOl);

    const newParagraphs: string[] = [];

    $nested.find("li").each((i, li) => {
      const letter = String.fromCharCode(65 + i); // A, B, C...
      const text = $(li).text().trim();
      newParagraphs.push(`<p>${letter}. ${text}</p>`);
    });

    // Replace the nested <ol> with the new <p> elements
    $nested.replaceWith(newParagraphs.join(""));
  });

  return $.html();
};

export function preprocessHtml(html: string): string {
  const flattenedHtml = convertNestedOlToParagraphs(html);

  const options = {
    wordwrap: null,
    selectors: [
      {
        selector: "ol",
        format: "paragraph",
      },
      {
        selector: "ul",
        format: "paragraph",
      },
      {
        selector: "li",
        format: "paragraph", // convert each <li> to a paragraph
      },
      {
        selector: "img",
        format: "skip",
      },
    ],
  };
  return convert(flattenedHtml, options);
}

export async function saveItemData(
  docId: string,
  content: string,
  answerFlag: string,
  rationaleFlag: string
) {
  const lines = content.split("\n");
  let currentQuestion = "";
  let choices: Omit<Choice, "id">[] = [];

  let lastQuestionId: string | null | undefined = null;

  try {
    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.match(/^[A-Z]\./)) {
        const letter = trimmedLine.charAt(0);
        const choiceText = trimmedLine.substring(2).trim();
        choices.push({ letter, text: choiceText });
      } else if (trimmedLine.includes(answerFlag)) {
        const question = currentQuestion.trim();
        const answer = trimmedLine
          .split(answerFlag)[1]
          ?.trim()
          .replace(".", "");

        if (question && choices.length > 0 && answer) {
          const newQuestion: Question = await createQuestion({
            document_id: docId,
            question_text: question,
            answer,
          });

          console.log("Created question:", newQuestion);
          lastQuestionId = newQuestion.id;

          const choicesWithQuestionId = choices.map((choice) => ({
            ...choice,
            question_id: newQuestion.id,
          }));

          const newChoices = await createChoices(choicesWithQuestionId);
          console.log("Created choices:", newChoices);
        }

        // Reset for the next question
        currentQuestion = "";
        choices = [];
      } else if (rationaleFlag && trimmedLine.includes(rationaleFlag)) {
        const parts = trimmedLine.split(rationaleFlag);
        const rationale = parts[1]?.trim();

        if (lastQuestionId && rationale) {
          await updateQuestions([lastQuestionId], { rationale });
          console.log("Updated question rationale");
        }
      } else if (trimmedLine) {
        currentQuestion += trimmedLine + "\n\n";
      }
    }
  } catch (error) {
    console.error("Error processing item data:", error);
    throw error;
  }
}
