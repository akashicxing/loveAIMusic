export interface Question {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'chips' | 'number';
  required: boolean;
  placeholder?: string;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  maxSelect?: number;
  min?: number;
  max?: number;
  options?: Array<{ value: string; label: string }>;
  maxLengthPerItem?: number;
}

export interface QuestionRound {
  id: string;
  title: string;
  description: string;
  version: string;
  questions: Question[];
}

export interface FormAnswers {
  [questionId: string]: string | string[] | number;
}
