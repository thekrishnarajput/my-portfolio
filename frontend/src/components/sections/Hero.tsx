import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';
import { useTheme } from '../../contexts/ThemeContext';
import Typewriter from '../Typewriter';
import * as THREE from 'three';

// Code Matrix Rain Effect
function CodeMatrix({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '01{}[]()<>;:,.=+-*/&|!@#$%^~`';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    const draw = () => {
      ctx.fillStyle = isDark ? 'rgba(17, 24, 39, 0.05)' : 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = isDark ? '#0ea5e9' : '#0284c7';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const animate = () => {
      draw();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 opacity-30"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

// Floating Code Snippets
function FloatingCodeSnippets() {
  const snippets = [
    'const code = "clean";',
    'function build() { return awesome; }',
    'interface Engineer { skills: string[]; }',
    'export default Portfolio;',
    '<Component />',
    'npm install creativity',
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {snippets.map((snippet, index) => (
        <motion.div
          key={index}
          className="absolute font-mono text-xs md:text-sm px-3 py-1.5 rounded-lg bg-primary-500/10 dark:bg-primary-400/10 border border-primary-500/20 dark:border-primary-400/20 backdrop-blur-sm"
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 50,
            opacity: 0,
          }}
          animate={{
            y: -100,
            opacity: [0, 1, 1, 0],
            x: Math.random() * window.innerWidth,
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            delay: index * 2,
            ease: 'linear',
          }}
        >
          <span className="text-primary-600 dark:text-primary-400">{snippet}</span>
        </motion.div>
      ))}
    </div>
  );
}

// Circuit/Network Flow Lines
function CircuitLines() {
  const lines = Array.from({ length: 8 }, (_, i) => i);

  return (
    <svg className="absolute inset-0 w-full h-full opacity-20 dark:opacity-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {lines.map((_, i) => {
        const startX = (i * 12.5) % 100;
        const startY = (i * 15) % 100;
        const endX = ((i * 12.5 + 30) % 100);
        const endY = ((i * 15 + 40) % 100);

        return (
          <motion.path
            key={i}
            d={`M ${startX}% ${startY}% Q ${(startX + endX) / 2}% ${(startY + endY) / 2}% ${endX}% ${endY}%`}
            stroke="url(#circuitGradient)"
            strokeWidth="1.5"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.5, 0.5, 0] }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </svg>
  );
}

// Digital Grid Pattern
function DigitalGrid({ isDark }: { isDark: boolean }) {
  return (
    <div
      className="absolute inset-0 opacity-10 dark:opacity-5"
      style={{
        backgroundImage: `
          linear-gradient(${isDark ? 'rgba(14, 165, 233, 0.1)' : 'rgba(2, 132, 199, 0.1)'} 1px, transparent 1px),
          linear-gradient(90deg, ${isDark ? 'rgba(14, 165, 233, 0.1)' : 'rgba(2, 132, 199, 0.1)'} 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}
    />
  );
}

// 3D Code Particles
function CodeParticles() {
  const particles = useRef<THREE.Points>(null);

  useEffect(() => {
    if (!particles.current) return;

    const positions = new Float32Array(1500 * 3);
    const colors = new Float32Array(1500 * 3);

    for (let i = 0; i < 1500; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      // Color gradient from blue to purple
      const color = new THREE.Color();
      color.setHSL(0.55 + Math.random() * 0.1, 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particles.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }, []);

  useEffect(() => {
    if (!particles.current) return;

    const animate = () => {
      if (particles.current) {
        particles.current.rotation.y += 0.001;
        particles.current.rotation.x += 0.0005;
      }
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <points ref={particles}>
      <bufferGeometry />
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Animated Code Brackets
function CodeBrackets() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
      <motion.div
        className="text-9xl md:text-[12rem] font-mono text-primary-500 dark:text-primary-400"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {'{ }'}
      </motion.div>
    </div>
  );
}

interface HeroProps {
  config?: {
    enabled?: boolean;
    badge?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    primaryButton?: {
      text: string;
      href: string;
      target?: '_self' | '_blank';
    };
    secondaryButton?: {
      text: string;
      href: string;
      target?: '_self' | '_blank';
    };
    socialLinks?: {
      github?: string;
      linkedin?: string;
      email?: string;
    };
    showScrollIndicator?: boolean;
  };
}

const Hero = ({ config }: HeroProps) => {
  // Fallback to default values if config is not provided
  const badge = config?.badge || '<SoftwareEngineer />';
  const title = config?.title || 'Mukesh Karn';
  const subtitle = config?.subtitle || '(Krishna)';
  const description = config?.description || 'Full-stack developer specializing in modern web technologies, building scalable applications with clean code and best practices.';
  const showScrollIndicator = config?.showScrollIndicator !== false;
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 20);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 20);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section
      id="home"
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
    >
      {/* Background Layers */}
      <DigitalGrid isDark={isDark} />
      <CodeMatrix isDark={isDark} />
      <CircuitLines />
      <FloatingCodeSnippets />
      <CodeBrackets />

      {/* 3D Code Particles */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={0.6} />
          <CodeParticles />
        </Canvas>
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        style={{
          x: springX,
          y: springY,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          {/* Code-style badge */}
          {badge && (
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 dark:bg-primary-400/10 border border-primary-500/20 dark:border-primary-400/20 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="text-xs md:text-sm font-mono text-primary-600 dark:text-primary-400">
                {badge}
              </span>
            </motion.div>
          )}

          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 dark:from-primary-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              <Typewriter
                text={title}
                speed={100}
                showCursor={true}
              />
            </span>
          </motion.h1>

          {subtitle && (
            <motion.p
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-medium"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {subtitle}
            </motion.p>
          )}

          <motion.h2
            className="text-2xl md:text-4xl lg:text-5xl font-semibold text-gray-800 dark:text-gray-200"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <span className="font-mono text-primary-600 dark:text-primary-400">{'const'}</span>{' '}
            <span className="text-gray-800 dark:text-gray-200">Software Engineer</span>
            <span className="font-mono text-primary-600 dark:text-primary-400"> = </span>
            <span className="text-primary-600 dark:text-primary-400">true</span>
            <span className="font-mono text-primary-600 dark:text-primary-400">;</span>
          </motion.h2>

          {description && (
            <motion.p
              className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {description}
            </motion.p>
          )}

          {/* CTA Buttons */}
          {(config?.primaryButton || config?.secondaryButton || config?.socialLinks?.github) && (
            <motion.div
              className="flex flex-wrap justify-center gap-4 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1 }}
            >
              {config?.primaryButton && (
                <motion.a
                  href={config.primaryButton.href}
                  target={config.primaryButton.target || '_self'}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {config.primaryButton.text}
                </motion.a>
              )}
              {config?.secondaryButton && (
                <motion.a
                  href={config.secondaryButton.href}
                  target={config.secondaryButton.target || '_self'}
                  className="px-6 py-3 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-2 border-primary-600 dark:border-primary-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {config.secondaryButton.text}
                </motion.a>
              )}
              {config?.socialLinks?.github && (
                <motion.a
                  href={config.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors font-medium flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaGithub /> GitHub
                </motion.a>
              )}
            </motion.div>
          )}

          {/* Social Links */}
          {(config?.socialLinks?.github || config?.socialLinks?.linkedin) && (
            <motion.div
              className="flex justify-center gap-6 mt-8"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              {config.socialLinks.github && (
                <motion.a
                  href={config.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  aria-label="GitHub"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaGithub className="w-6 h-6" />
                </motion.a>
              )}
              {config.socialLinks.linkedin && (
                <motion.a
                  href={config.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  aria-label="LinkedIn"
                  whileHover={{ scale: 1.2, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaLinkedin className="w-6 h-6" />
                </motion.a>
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-primary-500 dark:border-primary-400 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-primary-500 dark:bg-primary-400 rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default Hero;
