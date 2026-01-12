import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BowAndArrow from './BowAndArrow';

const BowScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollPosition > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRelease = () => {
    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 50 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-[100]"
        >
          <BowAndArrow onRelease={handleRelease} size="md" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BowScrollToTop;
