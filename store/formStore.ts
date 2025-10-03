import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FormAnswers } from '@/types/questions';

type FormStage = 'round1' | 'transition' | 'round2' | 'summary' | 'complete';

interface FormState {
  currentStep: number;
  currentRound: number;
  stage: FormStage;
  answers: FormAnswers;
  round1Answers: FormAnswers;
  round2Answers: FormAnswers;
  lastSaved: number | null;
  hasDraft: boolean;
  setCurrentStep: (step: number) => void;
  setCurrentRound: (round: number) => void;
  setStage: (stage: FormStage) => void;
  setAnswer: (questionId: string, value: string | string[] | number) => void;
  completeRound1: () => void;
  completeRound2: () => void;
  resetForm: () => void;
  clearDraft: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToQuestion: (round: number, questionIndex: number) => void;
}

export const useFormStore = create<FormState>()(
  persist(
    (set) => ({
      currentStep: 0,
      currentRound: 1,
      stage: 'round1',
      answers: {},
      round1Answers: {},
      round2Answers: {},
      lastSaved: null,
      hasDraft: false,
      setCurrentStep: (step) => set({ currentStep: step }),
      setCurrentRound: (round) => set({ currentRound: round }),
      setStage: (stage) => set({ stage }),
      setAnswer: (questionId, value) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: value },
          lastSaved: Date.now(),
          hasDraft: true,
        })),
      completeRound1: () =>
        set((state) => ({
          round1Answers: { ...state.answers },
          answers: {},
          stage: 'transition',
        })),
      completeRound2: () =>
        set((state) => ({
          round2Answers: { ...state.answers },
          stage: 'summary',
        })),
      resetForm: () =>
        set({
          currentStep: 0,
          currentRound: 1,
          stage: 'round1',
          answers: {},
          round1Answers: {},
          round2Answers: {},
          lastSaved: null,
          hasDraft: false,
        }),
      clearDraft: () =>
        set({
          lastSaved: null,
          hasDraft: false,
        }),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
      goToQuestion: (round, questionIndex) =>
        set({
          currentRound: round,
          currentStep: questionIndex,
          stage: round === 1 ? 'round1' : 'round2',
        }),
    }),
    {
      name: 'starwhisper-form-storage',
    }
  )
);
