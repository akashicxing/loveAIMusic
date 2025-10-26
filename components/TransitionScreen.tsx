'use client';

import { motion } from 'framer-motion';
import { Heart, Sparkles, ChevronRight } from 'lucide-react';
import SongStructureDisplay from './SongStructureDisplay';

interface SongStructure {
  songTitles: string[];
  versionA: {
    structure: string;
    examples: string[];
  };
  versionB: {
    structure: string;
    examples: string[];
  };
}

interface TransitionScreenProps {
  onContinue: () => void;
  songStructure?: SongStructure | null;
  selectedTitle?: string;
  selectedVersion?: 'A' | 'B';
  onSelectTitle?: (title: string) => void;
  onSelectVersion?: (version: 'A' | 'B') => void;
}

export default function TransitionScreen({ 
  onContinue, 
  songStructure, 
  selectedTitle, 
  selectedVersion, 
  onSelectTitle, 
  onSelectVersion 
}: TransitionScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div className="text-center space-y-12 max-w-2xl">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center gap-6"
        >
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            <Heart className="w-24 h-24 text-pink-400 fill-pink-400" />
          </motion.div>
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            <Sparkles className="w-24 h-24 text-purple-400" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-gradient">
            第一轮完成！
          </h1>

          <p className="text-2xl md:text-3xl text-pink-200">
            你们的故事真美好
          </p>

          {songStructure ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="max-w-6xl mx-auto"
            >
              <SongStructureDisplay
                structure={songStructure}
                onSelectTitle={onSelectTitle || (() => {})}
                onSelectVersion={onSelectVersion || (() => {})}
                selectedTitle={selectedTitle || songStructure.songTitles[0] || ''}
                selectedVersion={selectedVersion || 'A'}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="glass-card rounded-2xl p-8 mx-auto max-w-md"
            >
              <p className="text-lg text-white/80 leading-relaxed">
                我们已经了解了你们爱情的轮廓
                <br />
                接下来，让我们收集更多细节
                <br />
                让这首歌更加独特
              </p>
            </motion.div>
          )}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onClick={onContinue}
          className="group px-12 py-5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white text-xl font-semibold shadow-2xl glow-pink hover:shadow-3xl transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="flex items-center gap-3">
            继续下一轮
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-pink-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
