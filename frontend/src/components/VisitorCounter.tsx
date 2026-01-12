import { useState, useEffect, useRef } from 'react';
import { FaUsers } from 'react-icons/fa';
import { visitorsAPI } from '../services/api';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const VisitorCounter = () => {
    const [visitorCount, setVisitorCount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const cardRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    // 3D tilt effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseYSpring = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    // Track visit on component mount
    useEffect(() => {
        const trackVisit = async () => {
            try {
                await visitorsAPI.trackVisit();
                await fetchVisitorCount();
            } catch (error) {
                console.error('Error tracking visit:', error);
                await fetchVisitorCount();
            }
        };

        trackVisit();
    }, []);

    // Fetch visitor count
    const fetchVisitorCount = async () => {
        try {
            const response = await visitorsAPI.getCount();
            if (response.data.success) {
                setVisitorCount(response.data.data.count);
            }
        } catch (error) {
            console.error('Error fetching visitor count:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Poll for updates every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchVisitorCount();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Format number with commas
    const formatNumber = (num: number): string => {
        return num.toLocaleString('en-US');
    };

    // Split number into digits for 3D effect
    const renderDigits = (num: number) => {
        const digits = formatNumber(num).split('');
        return digits.map((digit, index) => (
            <motion.span
                key={`${digit}-${index}`}
                initial={{ opacity: 0, y: -20, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                    duration: 0.5,
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                }}
                className="inline-block"
                style={{
                    transformStyle: 'preserve-3d',
                }}
            >
                {digit === ',' ? (
                    <span className="mx-0.5">{digit}</span>
                ) : (
                    <motion.span
                        className="inline-block"
                        whileHover={{
                            scale: 1.2,
                            y: -5,
                            transition: { duration: 0.2 },
                        }}
                    >
                        {digit}
                    </motion.span>
                )}
            </motion.span>
        ));
    };

    return (
        <div
            className="w-full py-12 px-4 sm:px-6 lg:px-8 flex justify-center"
            style={{
                perspective: '1000px',
            }}
        >
            <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative w-full max-w-md"
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* Glow effect */}
                <motion.div
                    className="absolute -inset-4 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20 dark:opacity-30"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />

                {/* Main card */}
                <motion.div
                    className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/50"
                    style={{
                        transformStyle: 'preserve-3d',
                    }}
                >
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-full h-full rounded-3xl overflow-hidden pointer-events-none">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-400/20 to-transparent rounded-full blur-2xl" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-xl" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center space-y-6">
                        {/* Icon */}
                        <motion.div
                            className="relative"
                            style={{
                                transformStyle: 'preserve-3d',
                            }}
                        >
                            <div className="relative w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                >
                                    <FaUsers className="w-10 h-10 text-white" />
                                </motion.div>

                                {/* 3D depth effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                            </div>
                        </motion.div>

                        {/* Label */}
                        <motion.h3
                            className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            Total Visitors
                        </motion.h3>

                        {/* Count */}
                        <div className="text-center">
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 bg-primary-500 rounded-full animate-pulse" />
                                    <div className="w-4 h-4 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                    <div className="w-4 h-4 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                                </div>
                            ) : visitorCount !== null ? (
                                <motion.div
                                    key={visitorCount}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 200,
                                        damping: 15,
                                    }}
                                    className="text-5xl md:text-6xl font-bold"
                                    style={{
                                        transformStyle: 'preserve-3d',
                                    }}
                                >
                                    <span
                                        className="block font-extrabold"
                                        style={{
                                            color: theme === 'dark' ? 'rgb(147, 197, 253)' : 'rgb(37, 99, 235)', // blue-300 for dark, blue-600 for light
                                        }}
                                    >
                                        {renderDigits(visitorCount)}
                                    </span>
                                </motion.div>
                            ) : (
                                <span className="text-5xl md:text-6xl font-bold text-gray-700 dark:text-gray-300">N/A</span>
                            )}
                        </div>

                        {/* Subtitle */}
                        <motion.p
                            className="text-xs text-gray-600 dark:text-gray-400 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            Thank you for visiting! 🎉
                        </motion.p>
                    </div>

                    {/* 3D border effect */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-gradient-to-r from-primary-500/50 via-purple-500/50 to-pink-500/50 pointer-events-none" />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default VisitorCounter;
