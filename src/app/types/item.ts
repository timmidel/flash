export interface Choice {
  id?: string;
  question_id?: string;
  letter: string;
  text: string;
}

export interface Question {
  id?: string;
  document_id?: string;
  question_text: string;
  created_at?: string;
  rationale?: string;
  choices: Choice[];
  selected_answer?: string;
  answer: string;
}
