'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Music, Check } from 'lucide-react';

interface MusicStyle {
  id: string;
  name: string;
  description: string;
  mood: string;
  tags: string[];
  tempo: string;
  sunoPromptTemplate: string;
  vocalSuggestions: string[];
}

interface MusicStyleSelectorProps {
  onSelect: (style: MusicStyle) => void;
  selectedStyle?: string | null;
}

export default function MusicStyleSelector({ onSelect, selectedStyle }: MusicStyleSelectorProps) {
  const [styles, setStyles] = useState<MusicStyle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStyles = async () => {
      try {
        const response = await fetch('/api/music-styles');
        if (response.ok) {
          const data = await response.json();
          setStyles(data.styles || []);
        }
      } catch (error) {
        console.error('加载音乐风格失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStyles();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        <span className="ml-3 text-pink-200">加载音乐风格中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">选择音乐风格</h2>
        <p className="text-pink-200">为你的情歌选择最合适的音乐风格</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {styles.map((style, index) => (
          <motion.div
            key={style.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
              selectedStyle === style.id
                ? 'border-pink-400 bg-pink-500/20 shadow-lg shadow-pink-500/25'
                : 'border-white/20 bg-white/10 hover:border-pink-300 hover:bg-white/15'
            }`}
            onClick={() => onSelect(style)}
          >
            {selectedStyle === style.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">{style.name}</h3>
                <p className="text-pink-200 text-sm mb-3">{style.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-pink-300 bg-pink-500/20 px-2 py-1 rounded-full">
                      {style.mood}
                    </span>
                    <span className="text-xs text-pink-300 bg-pink-500/20 px-2 py-1 rounded-full">
                      {style.tempo}
                    </span>
                  </div>
                  
                  <div className="text-xs text-pink-300">
                    风格标签: {style.tags.join('、')}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedStyle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-pink-200 mb-4">
            已选择: <span className="text-pink-300 font-semibold">
              {styles.find(s => s.id === selectedStyle)?.name}
            </span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
