'use client';

import { useState, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '@/types/questions';
import { X } from 'lucide-react';

interface QuestionFormProps {
  question: Question;
  value: string | string[] | number | undefined;
  onChange: (value: string | string[] | number) => void;
  error?: string;
}

export default function QuestionForm({ question, value, onChange, error }: QuestionFormProps) {
  const [chipInput, setChipInput] = useState('');

  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            maxLength={question.maxLength}
            className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-pink-400 transition-all backdrop-blur-sm text-lg"
          />
        );

      case 'textarea':
        return (
          <div className="relative">
            <textarea
              value={(value as string) || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={question.placeholder}
              maxLength={question.maxLength}
              rows={6}
              className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-pink-400 transition-all backdrop-blur-sm text-lg resize-none"
            />
            {question.maxLength && (
              <div className="absolute bottom-3 right-4 text-sm text-white/50">
                {((value as string) || '').length} / {question.maxLength}
              </div>
            )}
          </div>
        );

      case 'select':
        return (
          <select
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white focus:outline-none focus:border-pink-400 transition-all backdrop-blur-sm text-lg appearance-none cursor-pointer"
          >
            <option value="" className="bg-purple-900">
              请选择...
            </option>
            {question.options?.map((option) => (
              <option key={option.value} value={option.value} className="bg-purple-900">
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <motion.label
                key={option.value}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  value === option.value
                    ? 'bg-pink-500/20 border-pink-400 glow-pink'
                    : 'bg-white/5 border-white/20 hover:border-white/40'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-5 h-5 text-pink-500 focus:ring-pink-400"
                />
                <span className="text-white text-lg">{option.label}</span>
              </motion.label>
            ))}
          </div>
        );

      case 'checkbox':
        const checkedValues = (value as string[]) || [];
        return (
          <div className="space-y-3">
            {question.options?.map((option) => {
              const isChecked = checkedValues.includes(option.value);
              const isDisabled =
                !isChecked &&
                question.maxSelect &&
                checkedValues.length >= question.maxSelect;

              return (
                <motion.label
                  key={option.value}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-purple-500/20 border-purple-400 glow-purple'
                      : isDisabled
                      ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                      : 'bg-white/5 border-white/20 hover:border-white/40'
                  }`}
                  whileHover={!isDisabled ? { scale: 1.02 } : {}}
                  whileTap={!isDisabled ? { scale: 0.98 } : {}}
                >
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={isChecked}
                    disabled={!!isDisabled}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...checkedValues, option.value]);
                      } else {
                        onChange(checkedValues.filter((v) => v !== option.value));
                      }
                    }}
                    className="w-5 h-5 text-purple-500 focus:ring-purple-400 rounded"
                  />
                  <span className="text-white text-lg">{option.label}</span>
                </motion.label>
              );
            })}
            {question.maxSelect && (
              <p className="text-sm text-pink-200 mt-2">
                最多选择 {question.maxSelect} 项 (已选 {checkedValues.length})
              </p>
            )}
          </div>
        );

      case 'chips':
        const chips = (value as string[]) || [];

        const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter' && chipInput.trim()) {
            e.preventDefault();
            if (question.maxItems && chips.length >= question.maxItems) {
              return;
            }
            if (
              question.maxLengthPerItem &&
              chipInput.trim().length > question.maxLengthPerItem
            ) {
              return;
            }
            if (!chips.includes(chipInput.trim())) {
              onChange([...chips, chipInput.trim()]);
              setChipInput('');
            }
          }
        };

        const removeChip = (chipToRemove: string) => {
          onChange(chips.filter((chip) => chip !== chipToRemove));
        };

        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 min-h-[60px] p-4 bg-white/5 rounded-2xl border-2 border-white/20">
              <AnimatePresence>
                {chips.map((chip) => (
                  <motion.span
                    key={chip}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white text-sm"
                  >
                    {chip}
                    <button
                      type="button"
                      onClick={() => removeChip(chip)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chipInput}
                onChange={(e) => setChipInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={question.placeholder}
                maxLength={question.maxLengthPerItem}
                disabled={question.maxItems ? chips.length >= question.maxItems : false}
                className="flex-1 px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-pink-400 transition-all backdrop-blur-sm text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => {
                  if (chipInput.trim()) {
                    if (question.maxItems && chips.length >= question.maxItems) {
                      return;
                    }
                    if (
                      question.maxLengthPerItem &&
                      chipInput.trim().length > question.maxLengthPerItem
                    ) {
                      return;
                    }
                    if (!chips.includes(chipInput.trim())) {
                      onChange([...chips, chipInput.trim()]);
                      setChipInput('');
                    }
                  }
                }}
                disabled={!chipInput.trim() || (question.maxItems ? chips.length >= question.maxItems : false)}
                className="px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl font-medium hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加
              </button>
            </div>

            <div className="flex justify-between text-sm text-pink-200">
              <span>
                {question.minItems && `最少 ${question.minItems} 个`}
                {question.minItems && question.maxItems && ' • '}
                {question.maxItems && `最多 ${question.maxItems} 个`}
                <span className="ml-2 text-white/60">（输入后按回车或点击添加按钮）</span>
              </span>
              <span>已添加 {chips.length} 个</span>
            </div>
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={(value as number) || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={question.placeholder}
            min={question.min}
            max={question.max}
            className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-pink-400 transition-all backdrop-blur-sm text-lg"
          />
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <label className="block space-y-3">
        <div className="flex items-start justify-between">
          <span className="text-2xl font-semibold text-white flex items-center gap-2">
            {question.label}
            {question.required && <span className="text-pink-400">*</span>}
          </span>
        </div>

        <div className="mt-4">{renderInput()}</div>
      </label>

      {error && (
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-red-400 text-sm flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-lg"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
