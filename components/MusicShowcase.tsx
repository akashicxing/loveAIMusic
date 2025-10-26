'use client';

import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Eye, X, Music2, Sparkles, Heart } from 'lucide-react';
import Link from 'next/link';

const AudioContext = createContext<{
  currentlyPlaying: string | null;
  setCurrentlyPlaying: (id: string | null) => void;
}>({
  currentlyPlaying: null,
  setCurrentlyPlaying: () => {},
});

interface MusicStyle {
  id: string;
  name: string;
  englishName: string;
  description: string;
  tags: string[];
  mood: string;
  tempo: string;
  difficulty: string;
  previewAudio: string;
  lyrics: {
    title: string;
    structure?: Array<{
      section: string;
      sectionEn: string;
      content: string;
    }>;
    adaptedFor?: string;
    note?: string;
  };
  vocalSuggestions: string[];
}

interface CustomAudioPlayerProps {
  src: string;
  styleId: string;
}

function CustomAudioPlayer({ src, styleId }: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentlyPlaying, setCurrentlyPlaying } = useContext(AudioContext);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentlyPlaying !== styleId && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  }, [currentlyPlaying, styleId, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentlyPlaying(null);
      setCurrentTime(0);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [setCurrentlyPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(styleId);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-3">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-3">
        <motion.button
          onClick={togglePlay}
          disabled={isLoading}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isLoading ? 1 : 1.1 }}
          whileTap={{ scale: isLoading ? 1 : 0.95 }}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            />
          ) : isPlaying ? (
            <Pause className="w-4 h-4" fill="currentColor" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
          )}
        </motion.button>

        <div className="flex-1 space-y-1.5">
          <div
            className="h-1.5 bg-white/20 rounded-full cursor-pointer overflow-hidden backdrop-blur-sm"
            onClick={handleSeek}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-pink-400 to-purple-400"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-white/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-white/60 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value);
              setVolume(newVolume);
              setIsMuted(newVolume === 0);
            }}
            className="w-16 h-1 accent-pink-400 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

interface LyricsModalProps {
  show: boolean;
  lyrics: MusicStyle['lyrics'];
  onClose: () => void;
}

function LyricsModal({ show, lyrics, onClose }: LyricsModalProps) {
  const isInstrumental = (section: string) => {
    return ['前奏', '间奏', '结尾', 'Intro', 'Interlude', 'Ending'].some(s =>
      section.includes(s)
    );
  };

  const isChorus = (section: string) => {
    return section.includes('副歌') || section.includes('Chorus');
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed inset-0 flex items-center justify-center z-50 px-4 py-8 pointer-events-none"
          >
            <div
              className="glass-card rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl glow-pink pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <Music2 className="w-6 h-6 text-pink-400" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">{lyrics.title}</h2>
                    {lyrics.adaptedFor && (
                      <p className="text-sm text-pink-200 mt-1">{lyrics.adaptedFor}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[calc(85vh-100px)] p-8 space-y-6">
                {lyrics.structure ? (
                  lyrics.structure.map((section, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`space-y-2 ${
                        isChorus(section.section) ? 'bg-gradient-to-r from-pink-500/10 to-purple-500/10 p-4 rounded-xl border-l-4 border-pink-400' : ''
                      }`}
                    >
                      <div className="flex items-baseline gap-3">
                        <h3 className="text-lg font-bold text-gradient">
                          {section.section}
                        </h3>
                        <span className="text-xs text-white/40 italic">
                          {section.sectionEn}
                        </span>
                      </div>

                      <p className={`text-white/90 text-base leading-loose whitespace-pre-line pl-4 ${
                        isInstrumental(section.section) ? 'italic text-white/60' : ''
                      }`}>
                        {section.content}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center space-y-4 py-12">
                    <Music2 className="w-16 h-16 text-pink-400/50 mx-auto" />
                    <p className="text-white/70 text-lg">{lyrics.note}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface MusicStyleCardProps {
  style: MusicStyle;
  index: number;
}

function MusicStyleCard({ style, index }: MusicStyleCardProps) {
  const [showLyrics, setShowLyrics] = useState(false);
  const { currentlyPlaying } = useContext(AudioContext);
  const isPlaying = currentlyPlaying === style.id;

  const difficultyConfig = {
    简单: { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', label: '简单' },
    中等: { color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', label: '中等' },
    困难: { color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', label: '困难' },
  };

  const difficulty = difficultyConfig[style.difficulty as keyof typeof difficultyConfig];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: index * 0.08, duration: 0.5 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className={`glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3 sm:space-y-4 transition-all duration-300 border ${
          isPlaying
            ? 'border-pink-400 glow-pink shadow-2xl'
            : 'border-white/10 hover:border-pink-400/50'
        }`}
      >
        <div className="space-y-3 sm:space-y-4">
          {/* Header with title and difficulty */}
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="flex-1 space-y-1">
              <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
                {style.name}
              </h3>
              <p className="text-pink-200/80 text-xs sm:text-sm font-medium">
                {style.englishName}
              </p>
            </div>

            <span
              className={`flex-shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold border-2 backdrop-blur-sm ${difficulty.color}`}
            >
              {difficulty.label}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {style.tags.map((tag, idx) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400/30 rounded-full text-xs text-pink-100 backdrop-blur-sm font-medium shadow-sm"
              >
                {tag}
              </motion.span>
            ))}
          </div>

          {/* Description */}
          <p className="text-white/80 text-xs sm:text-sm leading-relaxed font-light">
            {style.description}
          </p>

          {/* Mood and Tempo */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
            <div className="space-y-1 sm:space-y-1.5">
              <p className="text-[9px] sm:text-[10px] text-white/50 uppercase tracking-wider font-bold">情绪氛围</p>
              <p className="text-xs sm:text-sm font-bold text-pink-200">{style.mood}</p>
            </div>
            <div className="space-y-1 sm:space-y-1.5">
              <p className="text-[9px] sm:text-[10px] text-white/50 uppercase tracking-wider font-bold">节奏速度</p>
              <p className="text-xs sm:text-sm font-bold text-purple-200">{style.tempo}</p>
            </div>
          </div>

          {/* Vocal Suggestions */}
          <div className="space-y-2">
            <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wider font-bold">推荐演唱风格</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {style.vocalSuggestions.map((vocal) => (
                <span
                  key={vocal}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-br from-white/15 to-white/5 rounded-lg text-[10px] sm:text-xs text-white/80 border border-white/20 backdrop-blur-sm font-medium hover:bg-white/20 transition-colors"
                >
                  {vocal}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 space-y-2 sm:space-y-3">
          <CustomAudioPlayer src={style.previewAudio} styleId={style.id} />

          <motion.button
            onClick={() => setShowLyrics(true)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-pink-400/50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            查看完整歌词
          </motion.button>
        </div>
      </motion.div>

      <LyricsModal
        show={showLyrics}
        lyrics={style.lyrics}
        onClose={() => setShowLyrics(false)}
      />
    </>
  );
}

export default function MusicShowcase() {
  const [styles, setStyles] = useState<MusicStyle[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/music-styles')
      .then((res) => res.json())
      .then((data) => {
        const stylesWithLyrics = data.styles.map((style: any) => ({
          ...style,
          lyrics: {
            title: data.lyrics.title,
            structure: data.lyrics.structure,
            adaptedFor: style.name,
          },
        }));
        setStyles(stylesWithLyrics);
      })
      .catch((error) => {
        console.error('Failed to load music styles:', error);
      });
  }, []);

  if (styles.length === 0) {
    return null;
  }

  return (
    <AudioContext.Provider value={{ currentlyPlaying, setCurrentlyPlaying }}>
      <section id="styles" className="py-12 sm:py-16 md:py-24 px-4 scroll-mt-16">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 md:space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 sm:space-y-6 max-w-3xl mx-auto px-4"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              >
                <Music2 className="w-8 sm:w-10 h-8 sm:h-10 text-pink-400" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-8 sm:w-10 h-8 sm:h-10 text-purple-400" />
              </motion.div>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient leading-tight">
              🎵 八种风格，八种心动
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-pink-200/90 leading-relaxed">
              探索不同音乐风格的爱情表达，找到最适合你们的旋律
            </p>

            <div className="h-1 w-24 sm:w-32 mx-auto bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {styles.map((style, index) => (
              <MusicStyleCard key={style.id} style={style} index={index} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center pt-8"
          >
            <Link href="/create">
              <motion.button
                className="group relative px-12 py-5 text-xl font-semibold text-white rounded-full overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative flex items-center gap-3">
                  开始创作我们的歌
                  <Heart className="w-5 h-5 group-hover:fill-current transition-all" />
                </span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </AudioContext.Provider>
  );
}
