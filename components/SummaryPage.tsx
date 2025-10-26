'use client';

import { motion } from 'framer-motion';
import { Heart, CreditCard as Edit2, Music } from 'lucide-react';
import { Question, QuestionRound, FormAnswers } from '@/types/questions';

interface SummaryPageProps {
  round1: QuestionRound;
  round2: QuestionRound;
  round1Answers: FormAnswers;
  round2Answers: FormAnswers;
  onEdit: (round: number, questionIndex: number) => void;
  onGenerate: () => void;
}

export default function SummaryPage({
  round1,
  round2,
  round1Answers,
  round2Answers,
  onEdit,
  onGenerate,
}: SummaryPageProps) {
  const formatAnswer = (question: Question, value: any) => {
    if (!value) return '未填写';

    if (Array.isArray(value)) {
      if (value.length === 0) return '未填写';
      return value.join('、');
    }

    if (question.type === 'select' || question.type === 'radio') {
      const option = question.options?.find((opt) => opt.value === value);
      return option?.label || value;
    }

    return String(value);
  };

  const renderRound = (
    round: QuestionRound,
    answers: FormAnswers,
    roundNumber: number
  ) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: roundNumber * 0.2 }}
      className="glass-card rounded-3xl p-8 space-y-6"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{round.title}</h2>
          <p className="text-pink-200 text-sm mt-1">{round.description}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full border border-pink-400/30">
          <span className="text-pink-300 text-sm font-medium">第{roundNumber}轮</span>
        </div>
      </div>

      <div className="space-y-4">
        {round.questions.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: roundNumber * 0.2 + index * 0.05 }}
            className="group p-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-white/70 text-sm">{question.label}</label>
                <p className="text-white text-lg font-medium">
                  {formatAnswer(question, answers[question.id])}
                </p>
              </div>

              <button
                onClick={() => onEdit(roundNumber, index)}
                className="opacity-0 group-hover:opacity-100 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-all"
              >
                <Edit2 className="w-4 h-4" />
                编辑
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center gap-3">
            <Heart className="w-12 h-12 text-pink-400 fill-pink-400" />
            <Music className="w-12 h-12 text-purple-400" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gradient">
            确认你们的故事
          </h1>

          <p className="text-lg text-pink-200">
            请检查以下信息，确认无误后即可开始生成专属情歌
          </p>
        </motion.div>

        {renderRound(round1, round1Answers, 1)}
        {renderRound(round2, round2Answers, 2)}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-4 pt-8"
        >
          <motion.button
            onClick={onGenerate}
            className="px-12 py-5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white text-xl font-semibold shadow-2xl glow-pink hover:shadow-3xl transition-all flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            确认生成情歌
            <Music className="w-6 h-6" />
          </motion.button>

          <p className="text-sm text-white/50 text-center">
            点击任意答案旁的"编辑"按钮可以修改内容
          </p>
        </motion.div>
      </div>
    </div>
  );
}
