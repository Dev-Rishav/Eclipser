import React, { useState, useEffect } from 'react';
import Hero from '../components/newUI/Hero';
import Features from '../components/newUI/Features';
import HowItWorks from '../components/newUI/HowItWorks';
import Contests from '../components/newUI/Contests';
import Testimonials from '../components/newUI/Testimonials';
import AuthSection from '../components/newUI/AuthSection';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import ThemeSwitcher from '../components/ThemeSwitcher';

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
    <div className="min-h-screen bg-eclipse-light dark:bg-space-void text-eclipse-text-light dark:text-space-text">
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

      {/* Enhanced background animation with space theme */}
      <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-eclipse-light via-eclipse-surface to-eclipse-border dark:from-space-void dark:via-space-dark dark:to-space-darker"></div>
        <div className="stars absolute top-0 left-0 w-full h-full opacity-30"></div>
        <div className="twinkling absolute top-0 left-0 w-full h-full opacity-20"></div>
        
        {/* Floating particles */}
        <div className="particles">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 20,
                opacity: 0 
              }}
              animate={{ 
                y: -20,
                opacity: [0, 1, 1, 0],
                x: Math.random() * window.innerWidth + (Math.random() - 0.5) * 200
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear"
              }}
              style={{
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 10 + 's'
              }}
            />
          ))}
        </div>
        
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-stellar-blue/20 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-2/3 right-1/3 w-48 h-48 bg-gradient-to-br from-stellar-orange/20 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 40, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/2 w-56 h-56 bg-gradient-to-br from-stellar-green/20 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 40, 0],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>
      
      <div className="relative z-10 pt-20">
        <Hero />
        <div id="features">
          <Features />
        </div>
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <div id="contests">
          <Contests />
        </div>
        <Testimonials />
        
        {/* Integrated Auth Section */}
        <AuthSection />
        
        <Footer />
      </div>
    </div>
  );
}

export default LandingPage;