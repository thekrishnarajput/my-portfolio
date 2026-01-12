import { useState, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface BowAndArrowProps {
    onRelease?: () => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const BowAndArrow = ({ onRelease, className = '', size = 'md' }: BowAndArrowProps) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [isReleased, setIsReleased] = useState(false);
    const [drawProgress, setDrawProgress] = useState(0);
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const bowControls = useAnimation();
    const arrowControls = useAnimation();
    const animationRef = useRef<number>();

    const sizeClasses = {
        sm: 'w-12 h-16',
        md: 'w-16 h-24 md:w-20 md:h-28',
        lg: 'w-24 h-36 md:w-32 md:h-48',
    };

    const handleClick = async () => {
        if (isDrawing || isReleased) return;

        setIsDrawing(true);
        setDrawProgress(0);

        // Animate bow drawing
        const drawDuration = 0.6;
        const startTime = Date.now();

        const animateDraw = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / (drawDuration * 1000), 1);

            // Easing function for smooth draw (ease-out)
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            setDrawProgress(easedProgress);

            // Animate bow flex (subtle forward lean)
            const bowFlex = easedProgress * 6; // Max 6 degrees
            bowControls.set({ rotateZ: -bowFlex, scale: 1 - easedProgress * 0.02 });

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animateDraw);
            } else {
                // Release arrow
                releaseArrow();
            }
        };

        animateDraw();
    };

    const releaseArrow = async () => {
        setIsDrawing(false);
        setIsReleased(true);

        // Quick release animation
        await Promise.all([
            // Bow returns to normal
            bowControls.start({
                rotateZ: 0,
                scale: 1,
                transition: {
                    duration: 0.2,
                    ease: [0.4, 0, 0.2, 1],
                },
            }),
            // Arrow shoots upward
            arrowControls.start({
                y: -600,
                rotate: -45,
                opacity: [1, 1, 0.8, 0],
                scale: [1, 1.1, 0.9, 0.5],
                transition: {
                    duration: 1.2,
                    ease: [0.25, 0.1, 0.25, 1],
                    times: [0, 0.2, 0.7, 1],
                },
            }),
        ]);

        // Callback if provided
        if (onRelease) {
            onRelease();
        }

        // Reset after animation
        setTimeout(() => {
            setIsReleased(false);
            setDrawProgress(0);
            arrowControls.set({ y: 0, rotate: 0, opacity: 1, scale: 1 });
        }, 1200);
    };

    const primaryColor = isDark ? '#0ea5e9' : '#0284c7';
    const secondaryColor = isDark ? '#60a5fa' : '#3b82f6';
    const accentColor = isDark ? '#fbbf24' : '#f59e0b';

    return (
        <div className={`relative ${sizeClasses[size]} ${className}`}>
            <motion.button
                onClick={handleClick}
                disabled={isDrawing || isReleased}
                className="relative w-full h-full bg-transparent border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-2"
                aria-label="Shoot arrow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                    scale: isDrawing ? 0.98 : 1,
                }}
            >
                {/* Bow */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={bowControls}
                    style={{ transformOrigin: 'center bottom' }}
                >
                    <svg
                        viewBox="0 0 120 180"
                        className="w-full h-full"
                        style={{
                            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                        }}
                    >
                        <defs>
                            {/* Bow Gradient */}
                            <linearGradient id="bowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={primaryColor} />
                                <stop offset="50%" stopColor={secondaryColor} />
                                <stop offset="100%" stopColor={primaryColor} />
                            </linearGradient>

                            {/* Bow Highlight */}
                            <linearGradient id="bowHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
                                <stop offset="50%" stopColor="rgba(255, 255, 255, 0.1)" />
                                <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                            </linearGradient>

                            {/* Arrow Shaft Gradient */}
                            <linearGradient id="arrowShaftGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#d97706" />
                                <stop offset="100%" stopColor="#92400e" />
                            </linearGradient>
                        </defs>

                        {/* Bow Upper Limb */}
                        <path
                            d="M60 160 Q50 100 40 60 Q45 30 50 20 Q55 15 60 20 Q65 15 70 20 Q75 30 80 60 Q70 100 60 160"
                            fill="url(#bowGradient)"
                            stroke={primaryColor}
                            strokeWidth="2"
                        />

                        {/* Bow Highlight */}
                        <path
                            d="M60 160 Q55 100 45 60 Q48 30 55 20 Q60 15 65 20 Q68 30 75 60 Q65 100 60 160"
                            fill="url(#bowHighlight)"
                            opacity="0.6"
                        />

                        {/* Bow Grip */}
                        <rect
                            x="55"
                            y="140"
                            width="10"
                            height="20"
                            rx="2"
                            fill={isDark ? '#1e40af' : '#1e3a8a'}
                        />

                        {/* Bowstring Anchor Points */}
                        <circle cx="50" cy="20" r="3" fill={primaryColor} />
                        <circle cx="70" cy="20" r="3" fill={primaryColor} />
                    </svg>
                </motion.div>

                {/* Bowstring */}
                <div
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none"
                    style={{ top: '11%', width: '20px', height: '100%' }}
                >
                    <svg viewBox="0 0 20 160" className="w-full h-full" preserveAspectRatio="none">
                        <motion.path
                            d={`M 10 0 Q ${10 + drawProgress * 8} ${30 + drawProgress * 15} 10 ${60 + drawProgress * 30}`}
                            stroke={isDark ? '#cbd5e1' : '#64748b'}
                            strokeWidth="2.5"
                            fill="none"
                            strokeLinecap="round"
                            style={{
                                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
                            }}
                        />
                        {/* String tension indicator */}
                        {isDrawing && drawProgress > 0.3 && (
                            <motion.circle
                                cx={10 + drawProgress * 8}
                                cy={30 + drawProgress * 15}
                                r="3"
                                fill={accentColor}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: [0, 1.2, 1],
                                    opacity: [0, 0.8, 0.6],
                                }}
                                transition={{
                                    duration: 0.2,
                                    repeat: Infinity,
                                }}
                            />
                        )}
                    </svg>
                </div>

                {/* Arrow */}
                <AnimatePresence>
                    {!isReleased && (
                        <motion.div
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2"
                            style={{ top: '50%' }}
                            animate={{
                                ...arrowControls,
                                y: isDrawing ? drawProgress * 30 : 0,
                            }}
                            initial={{ y: 0, rotate: 0, opacity: 1, scale: 1 }}
                        >
                            <svg
                                viewBox="0 0 100 200"
                                className="w-8 h-16 md:w-10 md:h-20"
                                style={{
                                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                                }}
                            >
                                {/* Arrow Shaft */}
                                <line
                                    x1="50"
                                    y1="180"
                                    x2="50"
                                    y2="40"
                                    stroke="url(#arrowShaftGradient)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                />

                                {/* Arrow Head */}
                                <path
                                    d="M50 40 L35 20 L50 25 L65 20 Z"
                                    fill={accentColor}
                                    stroke={isDark ? '#f59e0b' : '#d97706'}
                                    strokeWidth="1.5"
                                />

                                {/* Arrow Fletching */}
                                <path
                                    d="M50 180 L40 160 L45 165 L50 160 L55 165 L60 160 Z"
                                    fill={isDark ? '#ef4444' : '#dc2626'}
                                />
                                <path
                                    d="M50 180 L42 162 L48 168 L50 165 L52 168 L58 162 Z"
                                    fill={isDark ? '#f87171' : '#f87171'}
                                    opacity="0.8"
                                />
                            </svg>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Release Particles */}
                <AnimatePresence>
                    {isReleased && (
                        <>
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{
                                        opacity: 1,
                                        scale: 0,
                                        x: 0,
                                        y: 0,
                                    }}
                                    animate={{
                                        opacity: [1, 0.8, 0],
                                        scale: [0, 0.6, 1],
                                        x: (Math.random() - 0.5) * 40,
                                        y: -30 - Math.random() * 20,
                                    }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                        duration: 0.5 + Math.random() * 0.3,
                                        delay: i * 0.02,
                                        ease: 'easeOut',
                                    }}
                                    className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                                    style={{
                                        background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
                                        boxShadow: `0 0 6px ${accentColor}`,
                                    }}
                                />
                            ))}
                        </>
                    )}
                </AnimatePresence>

                {/* Draw Tension Indicator */}
                {isDrawing && (
                    <motion.div
                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-1 h-1 rounded-full"
                                    style={{
                                        background: drawProgress > i / 5 ? accentColor : 'rgba(156, 163, 175, 0.3)',
                                    }}
                                    animate={{
                                        scale: drawProgress > i / 5 ? [1, 1.3, 1] : 1,
                                    }}
                                    transition={{
                                        duration: 0.3,
                                        repeat: drawProgress > i / 5 ? Infinity : 0,
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.button>

            {/* Glow Effect */}
            <motion.div
                className="absolute inset-0 rounded-lg -z-10"
                animate={{
                    scale: isDrawing ? [1, 1.2, 1] : 1,
                    opacity: isDrawing ? [0.3, 0.5, 0.3] : 0.2,
                }}
                transition={{
                    duration: 0.6,
                    repeat: isDrawing ? Infinity : 0,
                }}
                style={{
                    background: `radial-gradient(circle, ${primaryColor}40 0%, transparent 70%)`,
                    filter: 'blur(8px)',
                }}
            />
        </div>
    );
};

export default BowAndArrow;
