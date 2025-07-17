import React from 'react';
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
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 bg-gradient-to-r from-stellar-blue via-stellar-orange to-stellar-green text-transparent bg-clip-text">
            Connect. Code. Conquer.
          </h1>
          <p className="text-eclipse-muted-light dark:text-space-muted text-base sm:text-lg mb-6 sm:mb-8 max-w-xl leading-relaxed">
            The ultimate social platform for developers to learn, share, and compete in the coding universe.
            Solve problems, showcase achievements, and rise through the ranks.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <button 
              onClick={scrollToAuth}
              className="px-6 sm:px-8 py-3 bg-stellar-orange text-white rounded-full font-semibold hover:bg-stellar-orange/80 transition shadow-stellar-blue-glow text-center"
            >
              Join the Community
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('features');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 sm:px-8 py-3 border-2 border-eclipse-border dark:border-space-gray text-eclipse-text-light dark:text-space-text rounded-full font-semibold hover:border-stellar-orange hover:text-stellar-orange transition text-center"
            >
              Learn More
            </button>
          </div>
          
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3 text-center lg:text-left">
            <p className="text-eclipse-muted-light dark:text-space-muted text-sm sm:text-base">Used by developers from:</p>
            <div className="flex">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-stellar-blue flex items-center justify-center text-white text-xs sm:text-sm font-bold">G</div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-stellar-orange flex items-center justify-center text-white text-xs sm:text-sm font-bold -ml-1 sm:-ml-2">M</div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-stellar-green flex items-center justify-center text-white text-xs sm:text-sm font-bold -ml-1 sm:-ml-2">A</div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-eclipse-border dark:bg-space-gray flex items-center justify-center text-eclipse-text-light dark:text-space-text text-xs sm:text-sm font-bold -ml-1 sm:-ml-2">F</div>
            </div>
            <p className="text-eclipse-muted-light dark:text-space-muted text-sm sm:text-base">and 1000+ companies</p>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
          <div className="relative">
            <div className="absolute -top-2 sm:-top-4 -left-2 sm:-left-4 right-2 sm:right-4 bottom-2 sm:bottom-4 bg-gradient-to-r from-stellar-blue/20 via-stellar-orange/20 to-stellar-green/20 rounded-xl blur-xl"></div>
            <OptimizedImage
              src={baseOriginal}
              webpSrc512={baseWebp512}
              webpSrc1024={baseWebp1024}
              alt="Developers coding in space-themed environment"
              className="relative w-full rounded-xl shadow-space-card border border-eclipse-border dark:border-space-gray"
              loading="eager"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-eclipse-surface/50 dark:from-space-dark/50 via-transparent to-transparent opacity-50 rounded-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;