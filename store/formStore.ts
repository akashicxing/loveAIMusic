import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FormAnswers } from '@/types/questions';

type FormStage = 'round1' | 'generating' | 'transition' | 'round2' | 'summary' | 'complete' | 'select-music-style';

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
  completeLyrics: string | null;
  finalTitle: string | null;
  isEditingLyrics: boolean;
  selectedMusicStyle: string | null;
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
  generateFinalLyrics: () => Promise<void>;
  updateCompleteLyrics: (lyrics: string) => void;
  setEditingLyrics: (editing: boolean) => void;
  setSelectedMusicStyle: (style: string) => void;
  resetForm: () => void;
  clearDraft: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToQuestion: (round: number, questionIndex: number) => void;
}

export const useFormStore = create<FormState>()(
  persist(
    (set, get) => ({
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
      completeLyrics: null,
      finalTitle: null,
      isEditingLyrics: false,
      selectedMusicStyle: null,
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
          console.log('🎵 [Store] 开始调用AI生成歌名和结构');
          console.log('📝 [Store] 第一轮答案:', JSON.stringify(round1Answers, null, 2));
          
          // 调用AI生成歌名备选和结构设计
          const response = await fetch('/api/ai/generate-basic-lyrics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ answers: round1Answers }),
          });

          console.log('📡 [Store] API响应状态:', response.status, response.statusText);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [Store] API请求失败:', {
              status: response.status,
              statusText: response.statusText,
              errorText: errorText
            });
            throw new Error(`生成歌名和结构失败: ${response.status} ${errorText}`);
          }

          const result = await response.json();
          console.log('📊 [Store] API返回结果:', {
            success: result.success,
            hasData: !!result.data,
            error: result.error
          });
          
          if (result.success) {
            console.log('✅ [Store] 成功生成歌名和结构，保存到状态');
            // 保存生成的歌名备选和结构设计，并设置默认选择
            set((state) => ({
              ...state,
              songStructure: result.data,
              selectedTitle: result.data.songTitles?.[0] || null,
              selectedVersion: 'A',
              stage: 'transition',
            }));
          } else {
            console.error('❌ [Store] AI生成失败:', result.error);
            throw new Error(result.error || '生成失败');
          }
        } catch (error) {
          console.error('💥 [Store] 生成歌名和结构失败:', error);
          console.error('💥 [Store] 错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
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
      updateCompleteLyrics: (lyrics) => set({ completeLyrics: lyrics }),
      setEditingLyrics: (editing) => set({ isEditingLyrics: editing }),
      setSelectedMusicStyle: (style) => set({ selectedMusicStyle: style }),
      generateFinalLyrics: async () => {
        const currentState = get();
        
        // 切换到生成状态
        set((state) => ({
          ...state,
          stage: 'generating',
        }));

        try {
          console.log('🎵 [Store] 开始生成最终歌词');
          console.log('📝 [Store] 第一轮答案:', JSON.stringify(currentState.round1Answers, null, 2));
          console.log('📝 [Store] 第二轮答案:', JSON.stringify(currentState.round2Answers, null, 2));
          console.log('📝 [Store] 选中的歌名:', currentState.selectedTitle);
          console.log('📝 [Store] 选中的版本:', currentState.selectedVersion);
          
          // 调用AI生成完整歌词
          const response = await fetch('/api/ai/generate-complete-lyrics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              round1Answers: currentState.round1Answers,
              round2Answers: currentState.round2Answers,
              selectedTitle: currentState.selectedTitle,
              selectedVersion: currentState.selectedVersion,
              songStructure: currentState.songStructure
            }),
          });

          console.log('📡 [Store] API响应状态:', response.status, response.statusText);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [Store] API请求失败:', {
              status: response.status,
              statusText: response.statusText,
              errorText: errorText
            });
            throw new Error(`生成完整歌词失败: ${response.status} ${errorText}`);
          }

          const result = await response.json();
          console.log('📊 [Store] API返回结果:', {
            success: result.success,
            hasData: !!result.data,
            error: result.error
          });
          
          if (result.success) {
            console.log('✅ [Store] 成功生成完整歌词，保存到状态');
            // 保存生成的完整歌词
            set((state) => ({
              ...state,
              completeLyrics: result.data.lyrics,
              finalTitle: result.data.title,
              stage: 'complete',
            }));
          } else {
            console.error('❌ [Store] AI生成失败:', result.error);
            throw new Error(result.error || '生成失败');
          }
        } catch (error) {
          console.error('💥 [Store] 生成完整歌词失败:', error);
          console.error('💥 [Store] 错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
          // 如果AI生成失败，回到总结页面
          set((state) => ({
            ...state,
            stage: 'summary',
          }));
        }
      },
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
          completeLyrics: null,
          finalTitle: null,
          isEditingLyrics: false,
          selectedMusicStyle: null,
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
