import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FormAnswers } from '@/types/questions';

type FormStage = 'round1' | 'generating' | 'transition' | 'round2' | 'summary' | 'complete';

interface FormState {
  currentStep: number;
  currentRound: number;
  stage: FormStage;
  answers: FormAnswers;
  round1Answers: FormAnswers;
  round2Answers: FormAnswers;
  basicLyrics: string | null;
  songStructure: any | null;
  selectedTitle: string | null;
  selectedVersion: 'A' | 'B' | null;
  lastSaved: number | null;
  hasDraft: boolean;
  setCurrentStep: (step: number) => void;
  setCurrentRound: (round: number) => void;
  setStage: (stage: FormStage) => void;
  setAnswer: (questionId: string, value: string | string[] | number) => void;
  completeRound1: () => Promise<void>;
  completeRound2: () => void;
  setSelectedTitle: (title: string) => void;
  setSelectedVersion: (version: 'A' | 'B') => void;
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
      basicLyrics: null,
      songStructure: null,
      selectedTitle: null,
      selectedVersion: null,
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
      completeRound1: async () => {
        const currentState = get();
        const round1Answers = { ...currentState.answers };
        
        // 保存第一轮答案
        set((state) => ({
          round1Answers,
          answers: {},
          stage: 'generating',
        }));

        try {
          // 调用AI生成歌名备选和结构设计
          const response = await fetch('/api/ai/generate-basic-lyrics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ answers: round1Answers }),
          });

          if (!response.ok) {
            throw new Error('生成歌名和结构失败');
          }

          const result = await response.json();
          
          if (result.success) {
            // 保存生成的歌名备选和结构设计，并设置默认选择
            set((state) => ({
              ...state,
              songStructure: result.data,
              selectedTitle: result.data.songTitles?.[0] || null,
              selectedVersion: 'A',
              stage: 'transition',
            }));
          } else {
            throw new Error(result.error || '生成失败');
          }
        } catch (error) {
          console.error('生成歌名和结构失败:', error);
          // 如果AI生成失败，仍然进入下一轮
          set((state) => ({
            ...state,
            stage: 'transition',
          }));
        }
      },
      completeRound2: () =>
        set((state) => ({
          round2Answers: { ...state.answers },
          stage: 'summary',
        })),
      setSelectedTitle: (title) => set({ selectedTitle: title }),
      setSelectedVersion: (version) => set({ selectedVersion: version }),
      resetForm: () =>
        set({
          currentStep: 0,
          currentRound: 1,
          stage: 'round1',
          answers: {},
          round1Answers: {},
          round2Answers: {},
          basicLyrics: null,
          songStructure: null,
          selectedTitle: null,
          selectedVersion: null,
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
