import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const RocketScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const rocketControls = useAnimation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollPosition > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = async () => {
    if (isLaunching) return;

    setIsLaunching(true);

    // Animate rocket launch
    await rocketControls.start({
      y: -500,
      rotate: -45,
      scale: 0.8,
      transition: {
        duration: 1.2,
        ease: [0.4, 0, 0.2, 1],
      },
    });

    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    // Reset after animation
    setTimeout(() => {
      setIsLaunching(false);
      rocketControls.set({ y: 0, rotate: 0, scale: 1 });
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0, y: 50 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{ opacity: 0, scale: 0, y: 50 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] p-0 bg-transparent border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full group"
          aria-label="Scroll to top"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          disabled={isLaunching}
        >
          <div className="relative">
            {/* Rocket Container */}
            <motion.div
              className="relative w-16 h-20 md:w-20 md:h-24"
              animate={rocketControls}
              initial={{ y: 0, rotate: 0, scale: 1 }}
            >
              {/* Idle Floating Animation */}
              {!isLaunching && (
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="relative w-full h-full"
                >
                  {/* Rocket SVG - Enhanced Design */}
                  <svg
                    viewBox="0 0 120 150"
                    className="w-full h-full"
                    style={{
                      filter: 'drop-shadow(0 8px 20px rgba(0, 0, 0, 0.4))',
                    }}
                  >
                    <defs>
                      {/* Rocket Body Gradient */}
                      <linearGradient id="rocketBodyGradient" x1="60" y1="0" x2="60" y2="150">
                        <stop offset="0%" stopColor={isDark ? '#60a5fa' : '#3b82f6'} />
                        <stop offset="25%" stopColor={isDark ? '#3b82f6' : '#2563eb'} />
                        <stop offset="50%" stopColor={isDark ? '#0ea5e9' : '#0284c7'} />
                        <stop offset="75%" stopColor={isDark ? '#0284c7' : '#0369a1'} />
                        <stop offset="100%" stopColor={isDark ? '#0369a1' : '#075985'} />
                      </linearGradient>

                      {/* Highlight Gradient */}
                      <linearGradient id="rocketHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
                        <stop offset="50%" stopColor="rgba(255, 255, 255, 0.15)" />
                        <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                      </linearGradient>

                      {/* Window Gradient */}
                      <radialGradient id="windowGradient" cx="50%" cy="50%">
                        <stop offset="0%" stopColor={isDark ? '#93c5fd' : '#60a5fa'} />
                        <stop offset="60%" stopColor={isDark ? '#3b82f6' : '#2563eb'} />
                        <stop offset="100%" stopColor={isDark ? '#1e40af' : '#1e3a8a'} />
                      </radialGradient>

                      {/* Fin Gradient */}
                      <linearGradient id="finGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={isDark ? '#075985' : '#0c4a6e'} />
                        <stop offset="100%" stopColor={isDark ? '#0c4a6e' : '#075985'} />
                      </linearGradient>

                      {/* Tech Pattern Gradient */}
                      <linearGradient id="techPatternGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={isDark ? '#93c5fd' : '#60a5fa'} stopOpacity="0.8" />
                        <stop offset="100%" stopColor={isDark ? '#60a5fa' : '#3b82f6'} stopOpacity="0.6" />
                      </linearGradient>
                    </defs>

                    {/* Rocket Body */}
                    <path
                      d="M60 20 L72 130 L60 145 L48 130 Z"
                      fill="url(#rocketBodyGradient)"
                      className="transition-colors duration-300"
                    />

                    {/* Body Highlight */}
                    <path
                      d="M60 20 L66 130 L60 145 L54 130 Z"
                      fill="url(#rocketHighlight)"
                      opacity="0.7"
                    />

                    {/* Rocket Window Frame */}
                    <circle
                      cx="60"
                      cy="55"
                      r="14"
                      fill="none"
                      stroke={isDark ? '#1e40af' : '#1e3a8a'}
                      strokeWidth="2.5"
                    />

                    {/* Rocket Window */}
                    <circle
                      cx="60"
                      cy="55"
                      r="11"
                      fill="url(#windowGradient)"
                    />

                    {/* Window Reflection */}
                    <ellipse
                      cx="58"
                      cy="53"
                      rx="5"
                      ry="6"
                      fill="rgba(255, 255, 255, 0.5)"
                    />

                    {/* Tech Pattern Lines on Body */}
                    <rect x="56" y="75" width="8" height="2" fill="url(#techPatternGradient)" rx="1" />
                    <rect x="56" y="80" width="8" height="2" fill="url(#techPatternGradient)" rx="1" />
                    <rect x="56" y="85" width="6" height="2" fill="url(#techPatternGradient)" rx="1" />
                    <rect x="56" y="90" width="8" height="2" fill="url(#techPatternGradient)" rx="1" />

                    {/* Rocket Fins - Left */}
                    <path
                      d="M48 130 L32 148 L42 153 L48 145 Z"
                      fill="url(#finGradient)"
                    />
                    <path
                      d="M48 130 L40 140 L48 145 Z"
                      fill="rgba(0, 0, 0, 0.25)"
                    />

                    {/* Rocket Fins - Right */}
                    <path
                      d="M72 130 L88 148 L78 153 L72 145 Z"
                      fill="url(#finGradient)"
                    />
                    <path
                      d="M72 130 L80 140 L72 145 Z"
                      fill="rgba(0, 0, 0, 0.25)"
                    />

                    {/* Rocket Tip/Nose Cone */}
                    <path
                      d="M60 20 L54 10 L60 0 L66 10 Z"
                      fill={isDark ? '#fbbf24' : '#f59e0b'}
                    />
                    <path
                      d="M60 20 L57 12 L60 6 L63 12 Z"
                      fill={isDark ? '#fcd34d' : '#fbbf24'}
                    />

                    {/* Tech Accent Lines */}
                    <line x1="52" y1="30" x2="68" y2="30" stroke={isDark ? '#93c5fd' : '#60a5fa'} strokeWidth="1.5" opacity="0.6" />
                    <line x1="52" y1="35" x2="68" y2="35" stroke={isDark ? '#93c5fd' : '#60a5fa'} strokeWidth="1.5" opacity="0.6" />
                  </svg>
                </motion.div>
              )}

              {/* Launching Rocket (no floating) */}
              {isLaunching && (
                <div className="relative w-full h-full">
                  <svg
                    viewBox="0 0 120 150"
                    className="w-full h-full"
                    style={{
                      filter: 'drop-shadow(0 8px 20px rgba(0, 0, 0, 0.4))',
                    }}
                  >
                    <defs>
                      <linearGradient id="rocketBodyGradientLaunch" x1="60" y1="0" x2="60" y2="150">
                        <stop offset="0%" stopColor={isDark ? '#60a5fa' : '#3b82f6'} />
                        <stop offset="50%" stopColor={isDark ? '#0ea5e9' : '#0284c7'} />
                        <stop offset="100%" stopColor={isDark ? '#0284c7' : '#0369a1'} />
                      </linearGradient>
                      <linearGradient id="rocketHighlightLaunch" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
                        <stop offset="50%" stopColor="rgba(255, 255, 255, 0.15)" />
                        <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                      </linearGradient>
                      <radialGradient id="windowGradientLaunch" cx="50%" cy="50%">
                        <stop offset="0%" stopColor={isDark ? '#93c5fd' : '#60a5fa'} />
                        <stop offset="100%" stopColor={isDark ? '#1e40af' : '#1e3a8a'} />
                      </radialGradient>
                      <linearGradient id="finGradientLaunch" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={isDark ? '#075985' : '#0c4a6e'} />
                        <stop offset="100%" stopColor={isDark ? '#0c4a6e' : '#075985'} />
                      </linearGradient>
                    </defs>

                    <path d="M60 20 L72 130 L60 145 L48 130 Z" fill="url(#rocketBodyGradientLaunch)" />
                    <path d="M60 20 L66 130 L60 145 L54 130 Z" fill="url(#rocketHighlightLaunch)" opacity="0.7" />
                    <circle cx="60" cy="55" r="14" fill="none" stroke={isDark ? '#1e40af' : '#1e3a8a'} strokeWidth="2.5" />
                    <circle cx="60" cy="55" r="11" fill="url(#windowGradientLaunch)" />
                    <ellipse cx="58" cy="53" rx="5" ry="6" fill="rgba(255, 255, 255, 0.5)" />
                    <path d="M48 130 L32 148 L42 153 L48 145 Z" fill="url(#finGradientLaunch)" />
                    <path d="M48 130 L40 140 L48 145 Z" fill="rgba(0, 0, 0, 0.25)" />
                    <path d="M72 130 L88 148 L78 153 L72 145 Z" fill="url(#finGradientLaunch)" />
                    <path d="M72 130 L80 140 L72 145 Z" fill="rgba(0, 0, 0, 0.25)" />
                    <path d="M60 20 L54 10 L60 0 L66 10 Z" fill={isDark ? '#fbbf24' : '#f59e0b'} />
                    <path d="M60 20 L57 12 L60 6 L63 12 Z" fill={isDark ? '#fcd34d' : '#fbbf24'} />
                  </svg>
                </div>
              )}

              {/* Fire and Thrust Effects */}
              <AnimatePresence>
                {isLaunching && (
                  <>
                    {/* Main Fire - Multi-layer */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.2 }}
                      animate={{
                        opacity: [0, 1, 1, 0.9, 0],
                        scale: [0.2, 1.4, 1.8, 2, 0.3],
                        y: [0, 30, 60, 90, 120],
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 1.2,
                        ease: [0.4, 0, 0.2, 1],
                        times: [0, 0.15, 0.4, 0.7, 1],
                      }}
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
                      style={{ originY: 0 }}
                    >
                      <svg viewBox="0 0 90 110" className="w-20 h-24 md:w-24 md:h-28">
                        {/* Outer Fire */}
                        <path
                          d="M45 0 Q28 28 20 50 Q28 75 45 110 Q62 75 70 50 Q62 28 45 0"
                          fill="url(#fireGradientOuter)"
                          opacity="0.98"
                        />
                        {/* Middle Fire */}
                        <path
                          d="M45 5 Q35 28 28 50 Q35 72 45 95 Q55 72 62 50 Q55 28 45 5"
                          fill="url(#fireGradientMiddle)"
                          opacity="0.95"
                        />
                        {/* Inner Fire */}
                        <path
                          d="M45 10 Q38 30 33 50 Q38 70 45 85 Q52 70 57 50 Q52 30 45 10"
                          fill="url(#fireGradientInner)"
                          opacity="0.9"
                        />
                        {/* Core Fire */}
                        <ellipse cx="45" cy="65" rx="12" ry="30" fill="url(#coreFireGradient)" />

                        <defs>
                          <linearGradient id="fireGradientOuter" x1="45" y1="0" x2="45" y2="110">
                            <stop offset="0%" stopColor="#fef3c7" stopOpacity="1" />
                            <stop offset="25%" stopColor="#fbbf24" stopOpacity="1" />
                            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.98" />
                            <stop offset="75%" stopColor="#ea580c" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.85" />
                          </linearGradient>
                          <linearGradient id="fireGradientMiddle" x1="45" y1="5" x2="45" y2="95">
                            <stop offset="0%" stopColor="#fcd34d" stopOpacity="1" />
                            <stop offset="40%" stopColor="#f59e0b" stopOpacity="1" />
                            <stop offset="100%" stopColor="#ea580c" stopOpacity="0.95" />
                          </linearGradient>
                          <linearGradient id="fireGradientInner" x1="45" y1="10" x2="45" y2="85">
                            <stop offset="0%" stopColor="#fef3c7" stopOpacity="1" />
                            <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.98" />
                          </linearGradient>
                          <linearGradient id="coreFireGradient" x1="45" y1="35" x2="45" y2="95">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                            <stop offset="50%" stopColor="#fef3c7" stopOpacity="1" />
                            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.95" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </motion.div>

                    {/* Enhanced Particle Effects */}
                    {[...Array(15)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                        animate={{
                          opacity: [1, 0.95, 0.7, 0.4, 0],
                          scale: [0, 0.7, 1.1, 1.3, 0.5],
                          x: (Math.random() - 0.5) * 70,
                          y: 50 + Math.random() * 60,
                        }}
                        transition={{
                          duration: 0.9 + Math.random() * 0.7,
                          delay: i * 0.02,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        className="absolute bottom-0 left-1/2 w-3 h-3 rounded-full"
                        style={{
                          background: `radial-gradient(circle, hsl(${20 + Math.random() * 40}, 100%, ${55 + Math.random() * 20}%) 0%, transparent 70%)`,
                          boxShadow: `0 0 10px hsl(${20 + Math.random() * 40}, 100%, 70%), 0 0 5px hsl(${20 + Math.random() * 40}, 100%, 75%)`,
                        }}
                      />
                    ))}

                    {/* Enhanced Smoke Trail - Multiple Puffs */}
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={`smoke-${i}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 0.6, 0.5, 0.3, 0],
                          scale: [0, 1.2, 2, 2.8, 3.5],
                          y: [0, 20, 40, 65, 90],
                          x: (i - 1.5) * 10,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 1.3,
                          delay: i * 0.08,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
                      >
                        <svg viewBox="0 0 60 60" className="w-14 h-14">
                          <ellipse cx="30" cy="30" rx="25" ry="25" fill="rgba(156, 163, 175, 0.6)" opacity="0.7" />
                          <ellipse cx="30" cy="30" rx="15" ry="15" fill="rgba(209, 213, 219, 0.5)" opacity="0.6" />
                        </svg>
                      </motion.div>
                    ))}
                  </>
                )}
              </AnimatePresence>

              {/* Idle Fire Glow */}
              {!isLaunching && (
                <motion.div
                  animate={{
                    opacity: [0.5, 0.7, 0.5],
                    scale: [0.95, 1.15, 0.95],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(251, 191, 36, 0.7) 0%, rgba(245, 158, 11, 0.5) 50%, transparent 70%)',
                    filter: 'blur(8px)',
                  }}
                />
              )}
            </motion.div>

            {/* Enhanced Glow Effects */}
            <motion.div
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 rounded-full -z-10"
              style={{
                background: `radial-gradient(circle, ${isDark ? 'rgba(14, 165, 233, 0.5)' : 'rgba(2, 132, 199, 0.5)'} 0%, transparent 70%)`,
                filter: 'blur(14px)',
              }}
            />

            <motion.div
              animate={{
                scale: [1, 1.6, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
              className="absolute inset-0 rounded-full -z-10"
              style={{
                background: `radial-gradient(circle, ${isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(99, 102, 241, 0.4)'} 0%, transparent 70%)`,
                filter: 'blur(18px)',
              }}
            />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default RocketScrollToTop;
