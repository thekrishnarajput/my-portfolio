import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { HiSun, HiMoon } from 'react-icons/hi';

const DarkModeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 overflow-hidden"
      aria-label="Toggle dark mode"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        boxShadow: isDark
          ? '0 4px 15px rgba(102, 126, 234, 0.4)'
          : '0 4px 15px rgba(245, 87, 108, 0.4)',
      }}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          background: isDark
            ? 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)'
            : 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Toggle circle */}
      <motion.div
        className="relative w-6 h-6 rounded-full bg-white shadow-xl flex items-center justify-center overflow-hidden"
        animate={{
          x: isDark ? 24 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        {/* Sun icon */}
        <motion.div
          initial={false}
          animate={{
            rotate: isDark ? 180 : 0,
            scale: isDark ? 0 : 1,
            opacity: isDark ? 0 : 1,
          }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <HiSun className="w-4 h-4 text-yellow-500" />
        </motion.div>

        {/* Moon icon */}
        <motion.div
          initial={false}
          animate={{
            rotate: isDark ? 0 : -180,
            scale: isDark ? 1 : 0,
            opacity: isDark ? 1 : 0,
          }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <HiMoon className="w-4 h-4 text-indigo-600" />
        </motion.div>

        {/* Glow effect inside the circle */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            background: isDark
              ? 'radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(245, 87, 108, 0.3) 0%, transparent 70%)',
          }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>

      {/* Stars effect for dark mode */}
      {isDark && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{
                opacity: 0,
                scale: 0,
                x: Math.random() * 56,
                y: Math.random() * 32,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
            />
          ))}
        </>
      )}
    </motion.button>
  );
};

export default DarkModeToggle;
