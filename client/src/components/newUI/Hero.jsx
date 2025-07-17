import React from 'react';
import { motion } from 'framer-motion';
import { baseOriginal, baseWebp1024, baseWebp512 } from '../../assets/images.js';
import OptimizedImage from '../OptimizedImage.jsx';

const Hero = () => {
  const scrollToAuth = () => {
    const element = document.getElementById('auth');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="pt-24 sm:pt-28 pb-16 sm:pb-32 px-4 relative">
      <div className="container mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <motion.div 
          className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 bg-gradient-to-r from-stellar-blue via-stellar-orange to-stellar-green text-transparent bg-clip-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Connect. Code. Conquer.
          </motion.h1>
          <motion.p 
            className="text-eclipse-muted-light dark:text-space-muted text-base sm:text-lg mb-6 sm:mb-8 max-w-xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The ultimate social platform for developers to learn, share, and compete in the coding universe.
            Solve problems, showcase achievements, and rise through the ranks.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button 
              onClick={scrollToAuth}
              className="px-6 sm:px-8 py-3 bg-stellar-orange text-white rounded-full font-semibold hover:bg-stellar-orange/80 transition shadow-stellar-blue-glow text-center"
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(251, 146, 60, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              Join the Community
            </motion.button>
            <motion.button 
              onClick={() => {
                const element = document.getElementById('features');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 sm:px-8 py-3 border-2 border-eclipse-border dark:border-space-gray text-eclipse-text-light dark:text-space-text rounded-full font-semibold hover:border-stellar-orange hover:text-stellar-orange transition text-center"
              whileHover={{ scale: 1.05, borderColor: "rgb(251, 146, 60)" }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </motion.div>
          
          <motion.div 
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3 text-center lg:text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <p className="text-eclipse-muted-light dark:text-space-muted text-sm sm:text-base">Used by developers from:</p>
            <div className="flex">
              {['G', 'M', 'A', 'F'].map((letter, index) => (
                <motion.div
                  key={letter}
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold ${
                    index > 0 ? '-ml-1 sm:-ml-2' : ''
                  } ${
                    letter === 'G' ? 'bg-stellar-blue' :
                    letter === 'M' ? 'bg-stellar-orange' :
                    letter === 'A' ? 'bg-stellar-green' :
                    'bg-eclipse-border dark:bg-space-gray text-eclipse-text-light dark:text-space-text'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
                  whileHover={{ scale: 1.2 }}
                >
                  {letter}
                </motion.div>
              ))}
            </div>
            <p className="text-eclipse-muted-light dark:text-space-muted text-sm sm:text-base">and 1000+ companies</p>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="w-full lg:w-1/2 mt-8 lg:mt-0"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="absolute -top-2 sm:-top-4 -left-2 sm:-left-4 right-2 sm:right-4 bottom-2 sm:bottom-4 bg-gradient-to-r from-stellar-blue/20 via-stellar-orange/20 to-stellar-green/20 rounded-xl blur-xl"
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <OptimizedImage
              src={baseOriginal}
              webpSrc512={baseWebp512}
              webpSrc1024={baseWebp1024}
              alt="Developers coding in space-themed environment"
              className="relative w-full rounded-xl shadow-space-card border border-eclipse-border dark:border-space-gray"
              loading="eager"
            />
            <motion.div 
              className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-eclipse-surface/50 dark:from-space-dark/50 via-transparent to-transparent opacity-50 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
            
            {/* Floating badges/stats */}
            <motion.div 
              className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-stellar-blue text-white px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-stellar-blue-glow"
              initial={{ opacity: 0, scale: 0, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              1000+ Challenges
            </motion.div>
            <motion.div 
              className="absolute -bottom-1 -left-2 sm:-bottom-2 sm:-left-4 bg-stellar-green text-white px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-stellar-green-glow"
              initial={{ opacity: 0, scale: 0, rotate: 10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              whileHover={{ scale: 1.1, rotate: -5 }}
            >
              Live Contests
            </motion.div>
            <motion.div 
              className="absolute top-1/3 -left-3 sm:-left-6 bg-stellar-orange text-white px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-stellar-orange-glow"
              initial={{ opacity: 0, scale: 0, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              whileHover={{ scale: 1.1, x: -5 }}
            >
              Social Coding
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;