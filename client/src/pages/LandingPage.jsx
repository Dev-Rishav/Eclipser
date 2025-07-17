import React, { useState, useEffect, Suspense, lazy } from 'react';
import Hero from '../components/newUI/Hero';
import SpaceBackground from '../components/newUI/SpaceBackground';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import ThemeSwitcher from '../components/ThemeSwitcher';

// Lazy load heavier components
const Features = lazy(() => import('../components/newUI/Features'));
const HowItWorks = lazy(() => import('../components/newUI/HowItWorks'));
const Contests = lazy(() => import('../components/newUI/Contests'));
const Testimonials = lazy(() => import('../components/newUI/Testimonials'));
const AuthSection = lazy(() => import('../components/newUI/AuthSection'));

// Loading component for lazy loaded sections
const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <motion.div
      className="w-8 h-8 border-2 border-stellar-blue border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

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
  };

  return (
    <div className="min-h-screen text-eclipse-text-light dark:text-space-text relative">
      {/* Optimized Space Background */}
      <SpaceBackground />
      
      {/* Landing Page Navbar */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection('auth')}
              className="px-4 py-2 text-eclipse-text-light dark:text-space-text border border-eclipse-border dark:border-space-gray rounded-lg hover:border-stellar-blue hover:text-stellar-blue transition-all duration-300"
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection('auth')}
              className="px-4 py-2 bg-stellar-blue text-white rounded-lg hover:bg-stellar-blue/80 shadow-stellar-blue-glow transition-all duration-300"
            >
              Sign Up
            </motion.button>
          </div>
        </div>
      </motion.nav>

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
        
        <Suspense fallback={<SectionLoader />}>
          <Testimonials />
        </Suspense>
        
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