'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, Play, Pause, Volume2, VolumeX, Heart, Clock, Music, Download, Share2 } from 'lucide-react';
import RomanticBackground from '@/components/RomanticBackground';

interface LyricsSection {
  section: string;
  sectionEn: string;
  content: string;
}

interface Work {
  id: string;
  title: string;
  styleName: string;
  styleEnglishName: string;
  mood: string;
  tempo: string;
  difficulty: string;
  tags: string[];
  audioUrl: string;
  lyrics: LyricsSection[];
  theme: string;
  keywords: string[];
  createdAt: string;
}

export default function MyWorksPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      const response = await fetch('/api/music-styles');
      const data = await response.json();

      const work: Work = {
        id: 'work_1',
        title: data.lyrics.title,
        styleName: data.styles[0].name,
        styleEnglishName: data.styles[0].englishName,
        mood: data.lyrics.mood,
        tempo: data.styles[0].tempo,
        difficulty: data.styles[0].difficulty,
        tags: data.lyrics.keywords,
        audioUrl: data.styles[0].previewAudio,
        lyrics: data.lyrics.structure,
        theme: data.lyrics.theme,
        keywords: data.lyrics.keywords,
        createdAt: data.metadata.lastUpdated,
      };

      setWorks([work]);
      setSelectedWork(work);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load works:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [selectedWork]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const newMuted = !isMuted;
    audio.muted = newMuted;
    setIsMuted(newMuted);
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RomanticBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 relative z-10"
        >
          <Heart className="w-12 h-12 text-pink-400 animate-pulse fill-pink-400 mx-auto" />
          <p className="text-xl text-white">加载中...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <RomanticBackground />

      <div className="relative z-10 pt-20 sm:pt-24 pb-12 sm:pb-20 px-4">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2 sm:space-y-4"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient">我的作品</h1>
            <p className="text-base sm:text-xl text-pink-200">你创作的专属情歌都在这里</p>
          </motion.div>

          {selectedWork && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">{selectedWork.title}</h2>
                      <p className="text-base sm:text-lg md:text-xl text-pink-300">{selectedWork.styleName}</p>
                      <p className="text-xs sm:text-sm text-white/60">{selectedWork.styleEnglishName}</p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 sm:p-3 rounded-full glass-card hover:bg-white/20 transition-colors"
                        title="分享"
                      >
                        <Share2 className="w-4 sm:w-5 h-4 sm:h-5 text-pink-400" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 sm:p-3 rounded-full glass-card hover:bg-white/20 transition-colors"
                        title="下载"
                      >
                        <Download className="w-4 sm:w-5 h-4 sm:h-5 text-pink-400" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {selectedWork.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-200 border border-pink-400/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                    <div className="glass-card rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 space-y-0.5 sm:space-y-1">
                      <p className="text-white/60 text-xs sm:text-sm">情绪氛围</p>
                      <p className="text-white font-medium text-sm sm:text-base">{selectedWork.mood}</p>
                    </div>
                    <div className="glass-card rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 space-y-0.5 sm:space-y-1">
                      <p className="text-white/60 text-xs sm:text-sm">节奏速度</p>
                      <p className="text-white font-medium text-sm sm:text-base">{selectedWork.tempo}</p>
                    </div>
                    <div className="glass-card rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 space-y-0.5 sm:space-y-1">
                      <p className="text-white/60 text-xs sm:text-sm">难度等级</p>
                      <p className="text-white font-medium text-sm sm:text-base">{selectedWork.difficulty}</p>
                    </div>
                    <div className="glass-card rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 space-y-0.5 sm:space-y-1">
                      <p className="text-white/60 text-xs sm:text-sm">创作日期</p>
                      <p className="text-white font-medium text-sm sm:text-base">{selectedWork.createdAt}</p>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-xs sm:text-sm">{formatTime(currentTime)}</span>
                      <span className="text-white/60 text-xs sm:text-sm">{formatTime(duration)}</span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 sm:h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 sm:[&::-webkit-slider-thumb]:w-4 sm:[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-pink-500 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:cursor-pointer"
                    />

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
                      <motion.button
                        onClick={togglePlay}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-5 sm:w-6 h-5 sm:h-6 fill-current" />
                            <span className="text-sm sm:text-base">暂停</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-5 sm:w-6 h-5 sm:h-6 fill-current" />
                            <span className="text-sm sm:text-base">播放</span>
                          </>
                        )}
                      </motion.button>

                      <div className="flex items-center justify-center gap-2 sm:gap-3">
                        <motion.button
                          onClick={toggleMute}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          {isMuted ? (
                            <VolumeX className="w-5 h-5 text-white/60" />
                          ) : (
                            <Volume2 className="w-5 h-5 text-white/60" />
                          )}
                        </motion.button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-24 h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white/60 [&::-webkit-slider-thumb]:cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <audio ref={audioRef} src={selectedWork.audioUrl} preload="metadata" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-h-[600px] sm:max-h-[700px] md:max-h-[800px] overflow-y-auto custom-scrollbar">
                  <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-white/10">
                    <Music className="w-5 sm:w-6 h-5 sm:h-6 text-pink-400" />
                    <h3 className="text-xl sm:text-2xl font-bold text-white">歌词</h3>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {selectedWork.lyrics.map((section, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-2 sm:space-y-3"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-pink-500/30 to-purple-500/30 border border-pink-400/30">
                            <span className="text-xs sm:text-sm font-medium text-pink-200">
                              {section.section}
                            </span>
                          </div>
                          <span className="text-[10px] sm:text-xs text-white/40">{section.sectionEn}</span>
                        </div>
                        <p className="text-sm sm:text-base text-white/90 leading-relaxed whitespace-pre-line pl-3 sm:pl-4 border-l-2 border-pink-400/30">
                          {section.content}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(236, 72, 153, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(236, 72, 153, 0.5);
        }
      `}</style>
    </div>
  );
}
