'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Heart, Chrome as Home, Music2, Sparkles, Library, Info, LogIn, User } from 'lucide-react';
import Logo from './Logo';

const menuItems = [
  { name: '首页', href: '/', label: 'Home', icon: Home },
  { name: '风格展示', href: '#styles', label: 'Styles', icon: Music2 },
  { name: '创作工具', href: '/create', label: 'Create', icon: Sparkles },
  { name: '我的作品', href: '/my-works', label: 'My Works', icon: Library },
  { name: '关于我们', href: '/about', label: 'About', icon: Info },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    if (href.startsWith('#')) {
      e.preventDefault();

      if (pathname !== '/') {
        window.location.href = '/' + href;
      } else {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
    setIsOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass-card border-b border-white/10 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Logo size="md" showText={true} />

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {menuItems.map((item, index) => {
              const isActive = item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href) && item.href !== '/';

              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    if (item.href.startsWith('#')) {
                      handleNavClick(item.href, e);
                    }
                  }}
                  className="relative group"
                >
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-4 py-2.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'text-white'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <div className="relative z-10 flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>

                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-pink-500/20 rounded-xl border border-white/10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />

                    {isActive && (
                      <>
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-pink-500/30 rounded-xl border border-pink-400/50"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                        <motion.div
                          className="absolute inset-0 blur-lg bg-gradient-to-br from-pink-500/40 via-purple-500/40 to-pink-500/40 rounded-xl"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      </>
                    )}
                  </motion.div>

                  {!isActive && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"
                      whileHover={{ width: '60%', x: '-50%' }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              );
            })}
            
            {/* 登录按钮 */}
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                登录
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative p-2.5 rounded-xl glass-card border border-white/10 hover:border-pink-400/50 transition-all"
            aria-label="Toggle menu"
          >
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isOpen ? (
                <X className="w-5 h-5 text-pink-400" />
              ) : (
                <Menu className="w-5 h-5 text-pink-400" />
              )}
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-white/10 glass-card overflow-hidden"
          >
            <div className="px-4 py-6 space-y-2">
              {menuItems.map((item, index) => {
                const isActive = item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href) && item.href !== '/';

                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        if (item.href.startsWith('#')) {
                          handleNavClick(item.href, e);
                        }
                      }}
                      className="block"
                    >
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        className={`relative px-4 py-4 rounded-xl transition-all overflow-hidden ${
                          isActive
                            ? 'text-white'
                            : 'text-white/80'
                        }`}
                      >
                        <div className="relative z-10 flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            isActive
                              ? 'bg-gradient-to-br from-pink-500/40 to-purple-500/40'
                              : 'bg-white/10'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 flex items-center justify-between">
                            <span className="font-semibold">{item.name}</span>
                            <span className="text-xs text-white/50 font-light">{item.label}</span>
                          </div>
                        </div>

                        {isActive && (
                          <>
                            <motion.div
                              layoutId="activeMobileNav"
                              className="absolute inset-0 bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-pink-500/30 border-2 border-pink-400/50 rounded-xl"
                              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                            <motion.div
                              className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-pink-400 to-purple-400 rounded-l-full"
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                            />
                          </>
                        )}

                        {!isActive && (
                          <motion.div
                            className="absolute inset-0 bg-white/5 rounded-xl"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}

              {/* 移动端登录按钮 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: menuItems.length * 0.1 }}
                className="pt-4 mt-4 border-t border-white/10"
              >
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    登录账户
                  </motion.button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (menuItems.length + 1) * 0.1 }}
                className="pt-4 mt-4 border-t border-white/10"
              >
                <div className="flex items-center justify-center gap-2 text-pink-200/60 text-xs">
                  <Heart className="w-3 h-3 fill-current" />
                  <span>让爱发声，用心创作</span>
                  <Heart className="w-3 h-3 fill-current" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
