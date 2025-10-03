'use client';

import { motion } from 'framer-motion';
import { Heart, Music, Sparkles, Users, Mail, MessageCircle, Github, Twitter, Instagram } from 'lucide-react';
import RomanticBackground from '@/components/RomanticBackground';
import Image from 'next/image';

const teamMembers = [
  {
    name: '张小爱',
    role: 'AI 音乐算法工程师',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: '专注于AI音乐生成技术，让每一首歌都充满情感',
    heart: '用技术传递爱意'
  },
  {
    name: '李浪漫',
    role: '产品设计师',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: '相信每段爱情都值得被记录成一首歌',
    heart: '为爱情设计美好'
  },
  {
    name: '王心声',
    role: '音乐制作人',
    avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: '15年音乐制作经验，擅长情歌创作',
    heart: '用音乐诉说爱意'
  },
  {
    name: '刘诗韵',
    role: '内容策划师',
    avatar: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: '收集了上千个爱情故事，每个都动人心弦',
    heart: '用故事触动人心'
  }
];

const stats = [
  { label: '情侣用户', value: '50,000+', icon: Heart },
  { label: '创作歌曲', value: '100,000+', icon: Music },
  { label: '爱情故事', value: '200,000+', icon: Sparkles },
  { label: '幸福时刻', value: '∞', icon: Users },
];

const socialLinks = [
  { name: 'WeChat', icon: MessageCircle, qrCode: 'https://images.pexels.com/photos/7319337/pexels-photo-7319337.jpeg?auto=compress&cs=tinysrgb&w=400', handle: '@为爱而歌官方' },
  { name: 'Weibo', icon: Twitter, qrCode: 'https://images.pexels.com/photos/7319337/pexels-photo-7319337.jpeg?auto=compress&cs=tinysrgb&w=400', handle: '@为爱而歌AI' },
  { name: 'Instagram', icon: Instagram, qrCode: 'https://images.pexels.com/photos/7319337/pexels-photo-7319337.jpeg?auto=compress&cs=tinysrgb&w=400', handle: '@lovesongsai' },
  { name: 'GitHub', icon: Github, qrCode: 'https://images.pexels.com/photos/7319337/pexels-photo-7319337.jpeg?auto=compress&cs=tinysrgb&w=400', handle: '@lovesongs-ai' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen relative">
      <RomanticBackground />

      <div className="relative z-10 pt-20 sm:pt-24 pb-12 sm:pb-20 px-4">
        <div className="max-w-7xl mx-auto space-y-16 sm:space-y-24">

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 sm:space-y-8"
          >
            <div className="flex items-center justify-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-pink-400 fill-pink-400" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Music className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400" />
              </motion.div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gradient leading-tight">
              关于我们
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-pink-200 max-w-3xl mx-auto leading-relaxed">
              我们相信，每一段爱情都值得被谱写成一首独一无二的歌曲
            </p>

            <div className="h-1 w-24 sm:w-32 mx-auto bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-full" />
          </motion.div>

          {/* Story Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-6 sm:p-8 md:p-12 space-y-6 sm:space-y-8"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-pink-400" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">我们的故事</h2>
            </div>

            <div className="space-y-4 sm:space-y-6 text-white/80 text-sm sm:text-base md:text-lg leading-relaxed">
              <p>
                2023年的情人节，我们的创始团队在讨论如何让爱情变得更有仪式感。那一晚，我们听了很多经典情歌，突然意识到——为什么不能让每一对情侣都拥有属于自己的专属情歌呢？
              </p>

              <p>
                于是，"为爱而歌"诞生了。我们汇聚了AI工程师、音乐制作人、诗人和设计师，用科技的力量让爱情有了声音。
              </p>

              <p>
                我们深知，每段爱情都是独特的。那些美好的初遇、温暖的陪伴、感动的瞬间，都应该被记录、被传唱。通过AI技术，我们将你们的故事化作优美的歌词，配上动人的旋律，创作出只属于你们的爱情之歌。
              </p>

              <p className="text-pink-200 font-semibold text-base sm:text-lg md:text-xl italic pt-4 border-t border-white/10">
                "在这个快节奏的时代，我们希望用一首歌的时间，让爱情慢下来，让感动被铭记。"
              </p>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center space-y-3 sm:space-y-4"
              >
                <stat.icon className="w-8 h-8 sm:w-10 sm:h-10 text-pink-400 mx-auto" />
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient">{stat.value}</div>
                <div className="text-sm sm:text-base text-white/70">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Team Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8 sm:space-y-12"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient">核心团队</h2>
              <p className="text-base sm:text-lg text-pink-200/80">一群热爱音乐、相信爱情的创作者</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 text-center"
                >
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full blur-lg opacity-50" />
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="relative z-10 w-full h-full rounded-full object-cover border-4 border-white/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white">{member.name}</h3>
                    <p className="text-xs sm:text-sm text-pink-300">{member.role}</p>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed">{member.bio}</p>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <div className="flex items-center justify-center gap-2 text-pink-200/80 text-xs">
                      <Heart className="w-3 h-3 fill-current" />
                      <span>{member.heart}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact & QR Codes Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8 sm:space-y-12"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient">联系我们</h2>
              <p className="text-base sm:text-lg text-pink-200/80">关注我们，获取更多爱情创作灵感</p>
            </div>

            {/* Social Media Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {socialLinks.map((social, index) => (
                <motion.div
                  key={social.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <social.icon className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
                    <h3 className="text-lg sm:text-xl font-bold text-white">{social.name}</h3>
                  </div>

                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl blur-xl" />
                    <img
                      src={social.qrCode}
                      alt={`${social.name} QR Code`}
                      className="relative z-10 w-full h-full rounded-2xl object-cover border-2 border-white/20 bg-white p-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-pink-200">{social.handle}</p>
                    <p className="text-[10px] sm:text-xs text-white/50">扫码关注我们</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Email Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center space-y-4"
            >
              <div className="flex items-center justify-center gap-3">
                <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-pink-400" />
                <h3 className="text-xl sm:text-2xl font-bold text-white">邮件联系</h3>
              </div>

              <p className="text-white/70 text-sm sm:text-base">
                商务合作、媒体采访、意见反馈
              </p>

              <a
                href="mailto:contact@lovesongs.ai"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white font-semibold hover:shadow-xl transition-all text-sm sm:text-base"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                contact@lovesongs.ai
              </a>
            </motion.div>
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-8 sm:p-12 text-center space-y-6"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-pink-400 fill-pink-400" />
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
              <Music className="w-8 h-8 sm:w-10 sm:h-10 text-pink-400" />
            </div>

            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient leading-tight">
              让每一份爱都有专属的旋律
            </h3>

            <p className="text-base sm:text-lg md:text-xl text-pink-200/90 max-w-3xl mx-auto leading-relaxed">
              无论是初恋的甜蜜、热恋的激情，还是陪伴的温暖，我们都希望用音乐为你记录这些珍贵时刻。因为爱值得被歌颂，而你们的故事值得被传唱。
            </p>

            <div className="flex items-center justify-center gap-2 text-pink-200/60 text-sm pt-6">
              <Heart className="w-4 h-4 fill-current" />
              <span>为爱而歌团队</span>
              <Heart className="w-4 h-4 fill-current" />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
