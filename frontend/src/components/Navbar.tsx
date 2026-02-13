import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHomepageConfig } from '../hooks/useHomepageConfig';
import { HiMenu, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import DarkModeToggle from './DarkModeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { config: homepageConfig } = useHomepageConfig();
  const location = useLocation();
  const navigate = useNavigate();

  // Get logo from config or use default
  const logoUrl = homepageConfig?.branding?.logo || '/logo.png';

  useEffect(() => {
    const handleScroll = () => {
      try {
        setScrolled(window.scrollY > 20);

        // Only detect active section on home page
        if (location.pathname !== '/') {
          setActiveSection('');
          return;
        }

        // Detect active section based on scroll position
        const sections = ['home', 'about', 'projects', 'skills', 'contact'];
        const scrollPosition = window.scrollY + 100;

        for (let i = sections.length - 1; i >= 0; i--) {
          const section = document.getElementById(sections[i]);
          if (section && section.offsetTop <= scrollPosition) {
            setActiveSection(sections[i]);
            break;
          }
        }
      } catch (error) {
        console.error('Error in scroll handler:', error);
      }
    };

    // Delay initial check to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      handleScroll();
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  // Reset active section when route changes
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
    }
  }, [location]);

  // Handle pending scroll after navigation
  useEffect(() => {
    if (pendingScroll && location.pathname === '/') {
      // Wait for DOM to be ready
      const timeoutId = setTimeout(() => {
        const element = document.getElementById(pendingScroll);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setPendingScroll(null);
        }
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname, pendingScroll]);

  const navLinks = [
    { name: 'Home', href: '/#home', id: 'home' },
    { name: 'About', href: '/#about', id: 'about' },
    { name: 'Projects', href: '/#projects', id: 'projects' },
    { name: 'Skills', href: '/#skills', id: 'skills' },
    { name: 'Contact', href: '/#contact', id: 'contact' },
  ];

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith('/#')) {
      const id = href.substring(2);

      // If we're not on the home page, navigate to home first and set pending scroll
      if (location.pathname !== '/') {
        setPendingScroll(id);
        navigate('/');
      } else {
        // We're already on home page, just scroll to section
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-800/50'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo with animation */}
          <Link to="/" className="flex items-center flex-shrink-0 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <img
                src={logoUrl}
                alt="Logo"
                className="h-14 w-32 sm:h-16 sm:w-40 md:h-20 md:w-52 lg:h-24 lg:w-64 xl:h-28 xl:w-72 object-contain transition-opacity group-hover:opacity-90"
                onError={(e) => {
                  // Fallback to default logo if configured logo fails to load
                  if (logoUrl !== '/logo.png') {
                    e.currentTarget.src = '/logo.png';
                  }
                }}
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link, index) => {
              const isActive = activeSection === link.id;
              return (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
                  className="relative px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-300 group"
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId={`desktopActive-${link.id}`}
                      className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-primary-600/10 dark:from-primary-400/20 dark:to-primary-500/20 rounded-lg border border-primary-500/20 dark:border-primary-400/30"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Hover effect */}
                  <motion.div
                    className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                  />

                  <span className={`relative z-10 transition-colors duration-300 ${isActive
                    ? 'text-primary-600 dark:text-primary-400 font-semibold'
                    : 'group-hover:text-primary-600 dark:group-hover:text-primary-400'
                    }`}>
                    {link.name}
                  </span>

                  {/* Underline animation */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isActive ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              );
            })}

            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                <Link
                  to="/admin"
                  className="relative px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-300 group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.05 }}
                  />
                  <span className="relative z-10 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    Admin
                  </span>
                </Link>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.3, type: 'spring' }}
            >
              <DarkModeToggle />
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <DarkModeToggle />
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HiX className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HiMenu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 shadow-lg"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, index) => {
                const isActive = activeSection === link.id;
                return (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    className={`block px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-300 relative overflow-hidden ${isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 dark:bg-primary-400"
                        layoutId={`mobileActive-${link.id}`}
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.a>
                );
              })}
              {isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.05, duration: 0.2 }}
                >
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Admin
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;

