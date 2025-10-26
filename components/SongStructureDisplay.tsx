'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, Edit3, Music, FileText, Sparkles } from 'lucide-react';

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

interface SongStructureDisplayProps {
  structure: SongStructure;
  onSelectTitle: (title: string) => void;
  onSelectVersion: (version: 'A' | 'B') => void;
  selectedTitle: string;
  selectedVersion: 'A' | 'B';
}

export default function SongStructureDisplay({
  structure,
  onSelectTitle,
  onSelectVersion,
  selectedTitle,
  selectedVersion,
}: SongStructureDisplayProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [customTitle, setCustomTitle] = useState(selectedTitle);

  const handleTitleEdit = () => {
    if (editingTitle && customTitle.trim()) {
      onSelectTitle(customTitle.trim());
    }
    setEditingTitle(!editingTitle);
  };

  return (
    <div className="space-y-6 p-6">
      {/* 歌名选择区域 */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-300">
            <Music className="w-5 h-5" />
            歌名备选
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 当前选中的歌名 */}
          <div className="flex items-center gap-3">
            {editingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="输入自定义歌名"
                />
                <Button
                  size="sm"
                  onClick={handleTitleEdit}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                  已选择
                </Badge>
                <span className="text-xl font-medium text-white">{selectedTitle}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleTitleEdit}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* 歌名备选列表 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {structure.songTitles.map((title, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectTitle(title)}
                className={`p-3 rounded-lg text-sm transition-all ${
                  selectedTitle === title
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {title}
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 版本选择区域 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Version A */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-300">
              <FileText className="w-5 h-5" />
              Version A（故事型）
              {selectedVersion === 'A' && (
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                  已选择
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => onSelectVersion('A')}
              className={`w-full ${
                selectedVersion === 'A'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                  : 'bg-white/10 hover:bg-white/20'
              } text-white`}
            >
              {selectedVersion === 'A' ? '已选择此版本' : '选择此版本'}
            </Button>
            
            <div className="space-y-3">
              <h4 className="text-white/80 font-medium">结构设计：</h4>
              <p className="text-white/60 text-sm leading-relaxed">
                {structure.versionA.structure}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-white/80 font-medium">主歌画面举例：</h4>
              {structure.versionA.examples.map((example, index) => (
                <div key={index} className="bg-white/5 p-3 rounded-lg">
                  <p className="text-white/80 text-sm leading-relaxed">
                    {example}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Version B */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-300">
              <Sparkles className="w-5 h-5" />
              Version B（情感型）
              {selectedVersion === 'B' && (
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                  已选择
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => onSelectVersion('B')}
              className={`w-full ${
                selectedVersion === 'B'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                  : 'bg-white/10 hover:bg-white/20'
              } text-white`}
            >
              {selectedVersion === 'B' ? '已选择此版本' : '选择此版本'}
            </Button>
            
            <div className="space-y-3">
              <h4 className="text-white/80 font-medium">结构设计：</h4>
              <p className="text-white/60 text-sm leading-relaxed">
                {structure.versionB.structure}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-white/80 font-medium">主歌画面举例：</h4>
              {structure.versionB.examples.map((example, index) => (
                <div key={index} className="bg-white/5 p-3 rounded-lg">
                  <p className="text-white/80 text-sm leading-relaxed">
                    {example}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
