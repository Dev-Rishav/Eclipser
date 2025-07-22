import  { useState, useEffect, Suspense, lazy } from 'react';
import Hero from '../components/newUI/Hero';
import SpaceBackground from '../components/newUI/SpaceBackground';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import ThemeSwitcher from '../components/ThemeSwitcher';
import Navbar from '../components/newUI/Navbar';

// Lazy load heavier components
const Features = lazy(() => import('../components/newUI/Features'));
const HowItWorks = lazy(() => import('../components/newUI/HowItWorks'));
const Contests = lazy(() => import('../components/newUI/Contests'));
const Testimonials = lazy(() => import('../components/newUI/Testimonials'));
const AuthSection = lazy(() => import('../components/newUI/AuthSection'));

// Loading component for lazy loaded sections
const SectionLoader = () => {
  // Check current theme for conditional animations
  const isDarkMode = document.documentElement.classList.contains('dark');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shouldAnimate = isDarkMode && !prefersReducedMotion;

  return (
    <div className="flex items-center justify-center py-20">
      <motion.div
        className="w-8 h-8 border-2 border-stellar-blue border-t-transparent rounded-full"
        animate={shouldAnimate ? { rotate: 360 } : {}}
        transition={shouldAnimate ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
      />
    </div>
  );
};

function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check if user prefers reduced motion for performance
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shouldAnimate = isDarkMode && !prefersReducedMotion;

  // Monitor theme changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // Initial check
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Handle navbar background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };  return (
    <div className="min-h-screen text-eclipse-text-light dark:text-space-text relative">
      {/* Conditional Background Rendering */}
      {isDarkMode ? (
        // Dark mode: Space background with animations
        <div className="hidden md:block">
        <SpaceBackground />
        </div>
      ) : (
        // Light mode: Clean white background with subtle animations
        <div className="fixed inset-0 bg-white z-0">
          {/* Subtle animated background elements for light mode */}
          <div className="absolute inset-0">
            {/* Floating geometric shapes */}
            {shouldAnimate && Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-stellar-blue/5 to-stellar-purple/5 blur-xl"
                style={{
                  left: `${20 + i * 30}%`,
                  top: `${10 + i * 20}%`,
                }}
                animate={{
                  x: [0, 50, -30, 0],
                  y: [0, -40, 30, 0],
                  scale: [1, 1.2, 0.8, 1]
                }}
                transition={{
                  duration: 20 + i * 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
            
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-stellar-blue/2 via-transparent to-stellar-purple/2" />
            
            {/* Light particles */}
            {shouldAnimate && Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-2 h-2 bg-stellar-blue/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.2, 0.6, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Landing Page Navbar */}
      {/* <motion.nav 
        initial={shouldAnimate ? { y: -50, opacity: 0 } : { y: 0, opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        transition={shouldAnimate ? { duration: 0.5 } : {}}
        className={`fixed top-0 w-full z-50 flex items-center justify-between p-4 border-b transition-all duration-300 ${
          isScrolled 
            ? 'border-eclipse-border dark:border-space-gray bg-eclipse-surface/98 dark:bg-space-dark/98 backdrop-blur-xl shadow-lg' 
            : 'border-eclipse-border/50 dark:border-space-gray/50 bg-eclipse-surface/95 dark:bg-space-dark/95 backdrop-blur-lg'
        }`}
      >
        <div className="flex items-center">
          <div className="w-10 h-10 bg-stellar-blue rounded-full flex items-center justify-center shadow-stellar-blue-glow">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="ml-2 text-xl font-bold text-stellar-blue">ECLIPSER</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex space-x-6">
            <button 
              onClick={() => scrollToSection('features')}
              className="text-eclipse-muted-light dark:text-space-muted hover:text-stellar-blue transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="text-eclipse-muted-light dark:text-space-muted hover:text-stellar-orange transition-colors"
            >
              How it Works
            </button>
            <button 
              onClick={() => scrollToSection('contests')}
              className="text-eclipse-muted-light dark:text-space-muted hover:text-stellar-green transition-colors"
            >
              Contests
            </button>
            <button 
              onClick={() => scrollToSection('auth')}
              className="text-eclipse-muted-light dark:text-space-muted hover:text-stellar-purple transition-colors"
            >
              Join Us
            </button>
          </nav>
          
          <ThemeSwitcher />
          
          <div className="flex space-x-3">
            <motion.button
              whileHover={shouldAnimate ? { scale: 1.05 } : {}}
              whileTap={shouldAnimate ? { scale: 0.95 } : {}}
              onClick={() => scrollToSection('auth')}
              className="px-4 py-2 text-eclipse-text-light dark:text-space-text border border-eclipse-border dark:border-space-gray rounded-lg hover:border-stellar-blue hover:text-stellar-blue transition-all duration-300"
            >
              Login
            </motion.button>
            <motion.button
              whileHover={shouldAnimate ? { scale: 1.05 } : {}}
              whileTap={shouldAnimate ? { scale: 0.95 } : {}}
              onClick={() => scrollToSection('auth')}
              className="px-4 py-2 bg-stellar-blue text-white rounded-lg hover:bg-stellar-blue/80 shadow-stellar-blue-glow transition-all duration-300"
            >
              Sign Up
            </motion.button>
          </div>
        </div>
      </motion.nav> */}
      <Navbar />

      {/* Main content container with proper z-indexing */}
      <div className="relative z-10 pt-20">
        <Hero />
        
        <Suspense fallback={<SectionLoader />}>
          <div id="features">
            <Features />
          </div>
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <div id="how-it-works">
            <HowItWorks />
          </div>
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <div id="contests">
            <Contests />
          </div>
        </Suspense>
        
        {/* <Suspense fallback={<SectionLoader />}> */}
          {/* <Testimonials /> */}
        {/* </Suspense> */}
        
        {/* Integrated Auth Section */}
        <Suspense fallback={<SectionLoader />}>
          <AuthSection />
        </Suspense>
        
        <Footer />
      </div>
    </div>
  );
}

export default LandingPage;