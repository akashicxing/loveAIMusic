'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Heart, Sparkles } from 'lucide-react';
import RomanticBackground from '@/components/RomanticBackground';
import ProgressBar from '@/components/ProgressBar';
import QuestionForm from '@/components/QuestionForm';
import TransitionScreen from '@/components/TransitionScreen';
import SummaryPage from '@/components/SummaryPage';
import DraftRecoveryDialog from '@/components/DraftRecoveryDialog';
import { useFormStore } from '@/store/formStore';
import { QuestionRound, Question } from '@/types/questions';
import { useToast } from '@/hooks/use-toast';

export default function CreatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    currentStep,
    currentRound,
    stage,
    answers,
    round1Answers,
    round2Answers,
    lastSaved,
    hasDraft,
    setAnswer,
    nextStep,
    prevStep,
    setCurrentStep,
    setCurrentRound,
    setStage,
    completeRound1,
    completeRound2,
    resetForm,
    clearDraft,
    goToQuestion,
  } = useFormStore();

  const [round1Data, setRound1Data] = useState<QuestionRound | null>(null);
  const [round2Data, setRound2Data] = useState<QuestionRound | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    if (!initialCheckDone && round1Data && hasDraft && lastSaved) {
      setShowDraftDialog(true);
      setInitialCheckDone(true);
    } else if (!initialCheckDone && round1Data) {
      setInitialCheckDone(true);
    }
  }, [round1Data, hasDraft, lastSaved, initialCheckDone]);

  useEffect(() => {
    if (lastSaved && stage !== 'summary' && stage !== 'complete') {
      toast({
        title: '草稿已保存 ✓',
        duration: 2000,
      });
    }
  }, [lastSaved]);

  const loadQuestions = async () => {
    try {
      const [round1Response, round2Response] = await Promise.all([
        fetch('/api/questions/round1'),
        fetch('/api/questions/round2'),
      ]);

      const round1 = await round1Response.json();
      const round2 = await round2Response.json();

      setRound1Data(round1);
      setRound2Data(round2);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast({
        title: '加载失败',
        description: '无法加载问题，请刷新页面重试',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleContinueDraft = () => {
    setShowDraftDialog(false);
  };

  const handleStartFresh = () => {
    resetForm();
    setShowDraftDialog(false);
    toast({
      title: '已清空草稿',
      description: '开始全新创作',
    });
  };

  if (loading || !round1Data || !round2Data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RomanticBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 relative z-10"
        >
          <div className="flex justify-center gap-3">
            <Heart className="w-12 h-12 text-pink-400 animate-pulse fill-pink-400" />
            <Sparkles className="w-12 h-12 text-purple-400 animate-pulse" />
          </div>
          <p className="text-xl text-white">加载中...</p>
        </motion.div>
      </div>
    );
  }

  if (stage === 'transition') {
    return (
      <div className="relative">
        <RomanticBackground />
        <div className="relative z-10">
          <TransitionScreen onContinue={() => {
            setCurrentRound(2);
            setCurrentStep(0);
            setStage('round2');
          }} />
        </div>
      </div>
    );
  }

  if (stage === 'summary') {
    return (
      <div className="relative">
        <RomanticBackground />
        <div className="relative z-10">
          <SummaryPage
            round1={round1Data}
            round2={round2Data}
            round1Answers={round1Answers}
            round2Answers={round2Answers}
            onEdit={goToQuestion}
            onGenerate={() => {
              setStage('complete');
              clearDraft();
              toast({
                title: '开始生成情歌 🎵',
                description: '正在为你创作专属旋律...',
              });
              console.log('Generation Data:', {
                round1: round1Answers,
                round2: round2Answers,
              });
            }}
          />
        </div>
      </div>
    );
  }

  if (stage === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RomanticBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 relative z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Heart className="w-24 h-24 text-pink-400 fill-pink-400 mx-auto" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gradient">正在生成你们的专属情歌...</h1>
          <p className="text-lg text-pink-200">请稍候</p>
        </motion.div>
      </div>
    );
  }

  const currentRoundData = currentRound === 1 ? round1Data : round2Data;
  const currentQuestion = currentRoundData.questions[currentStep];
  const isLastStep = currentStep === currentRoundData.questions.length - 1;
  const totalQuestions = round1Data.questions.length + round2Data.questions.length;
  const currentOverallStep =
    currentRound === 1
      ? currentStep
      : round1Data.questions.length + currentStep;

  const validateQuestion = (question: Question, value: any): string | null => {
    if (question.required) {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return '此项为必填项';
      }
    }

    if (question.type === 'chips' && Array.isArray(value)) {
      if (question.minItems && value.length < question.minItems) {
        return `至少需要 ${question.minItems} 个项目`;
      }
      if (question.maxItems && value.length > question.maxItems) {
        return `最多只能 ${question.maxItems} 个项目`;
      }
    }

    if (question.type === 'checkbox' && Array.isArray(value)) {
      if (question.maxSelect && value.length > question.maxSelect) {
        return `最多只能选择 ${question.maxSelect} 项`;
      }
    }

    if (question.type === 'number' && typeof value === 'number') {
      if (question.min !== undefined && value < question.min) {
        return `最小值为 ${question.min}`;
      }
      if (question.max !== undefined && value > question.max) {
        return `最大值为 ${question.max}`;
      }
    }

    return null;
  };

  const handleNext = () => {
    const error = validateQuestion(currentQuestion, answers[currentQuestion.id]);

    if (error) {
      setErrors({ [currentQuestion.id]: error });
      return;
    }

    setErrors({});

    const isLastStepInRound = currentStep === currentRoundData.questions.length - 1;

    if (isLastStepInRound) {
      if (currentRound === 1) {
        completeRound1();
      } else {
        completeRound2();
      }
    } else {
      nextStep();
    }
  };

  const handlePrev = () => {
    setErrors({});

    if (currentStep === 0 && currentRound === 2) {
      setCurrentRound(1);
      setStage('round1');
      if (round1Data) {
        setCurrentStep(round1Data.questions.length - 1);
      }
    } else {
      prevStep();
    }
  };

  const handleAnswerChange = (value: string | string[] | number) => {
    setAnswer(currentQuestion.id, value);
    if (errors[currentQuestion.id]) {
      setErrors({});
    }
  };

  return (
    <div className="min-h-screen">
      <RomanticBackground />

      <DraftRecoveryDialog
        show={showDraftDialog}
        lastSaved={lastSaved || Date.now()}
        onContinue={handleContinueDraft}
        onStartFresh={handleStartFresh}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl"
        >
          <div className="glass-card rounded-3xl p-8 md:p-12 space-y-8">
            <div className="text-center space-y-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full border border-pink-400/30"
              >
                <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                <span className="text-pink-200 text-sm font-medium">
                  第{currentRound}轮 · {currentRoundData.title}
                </span>
              </motion.div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                问题 {currentStep + 1}/{currentRoundData.questions.length}
              </h1>
              <p className="text-pink-200">{currentRoundData.description}</p>
            </div>

            <ProgressBar
              currentStep={currentOverallStep}
              totalSteps={totalQuestions}
            />

            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                <QuestionForm
                  key={currentQuestion.id}
                  question={currentQuestion}
                  value={answers[currentQuestion.id]}
                  onChange={handleAnswerChange}
                  error={errors[currentQuestion.id]}
                />
              </AnimatePresence>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-white/10">
              <motion.button
                onClick={handlePrev}
                disabled={currentStep === 0 && currentRound === 1}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
                whileHover={{
                  scale: currentStep === 0 && currentRound === 1 ? 1 : 1.05,
                }}
                whileTap={{
                  scale: currentStep === 0 && currentRound === 1 ? 1 : 0.95,
                }}
              >
                <ChevronLeft className="w-5 h-5" />
                上一步
              </motion.button>

              <motion.button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:shadow-lg transition-all glow-pink"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLastStep && currentRound === 2 ? '完成' : '下一步'}
                {!(isLastStep && currentRound === 2) && (
                  <ChevronRight className="w-5 h-5" />
                )}
                {isLastStep && currentRound === 2 && (
                  <Heart className="w-5 h-5 fill-current" />
                )}
              </motion.button>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-white/50 text-sm">你的答案会自动保存</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
