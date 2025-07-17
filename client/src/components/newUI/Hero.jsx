import React from 'react';
import heroImage from '../../assets/base.png';

const Hero = () => {
  const scrollToAuth = () => {
    const element = document.getElementById('auth');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="pt-20 pb-32 px-4 bg-eclipse-light/50 dark:bg-space-void/50">
      <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-1/2 flex flex-col items-start">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-stellar-blue via-stellar-orange to-stellar-green text-transparent bg-clip-text">
            Connect. Code. Conquer.
          </h1>
          <p className="text-eclipse-muted-light dark:text-space-muted text-lg mb-8 max-w-xl leading-relaxed">
            The ultimate social platform for developers to learn, share, and compete in the coding universe.
            Solve problems, showcase achievements, and rise through the ranks.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={scrollToAuth}
              className="px-8 py-3 bg-stellar-blue text-white rounded-full font-semibold hover:bg-stellar-blue/80 transition shadow-stellar-blue-glow"
            >
              Join the Community
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('features');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3 border-2 border-eclipse-border dark:border-space-gray text-eclipse-text-light dark:text-space-text rounded-full font-semibold hover:border-stellar-orange hover:text-stellar-orange transition"
            >
              Learn More
            </button>
          </div>
          
          <div className="mt-10 flex items-center gap-3">
            <p className="text-eclipse-muted-light dark:text-space-muted">Used by developers from:</p>
            <div className="flex">
              <div className="w-8 h-8 rounded-full bg-stellar-blue flex items-center justify-center text-white text-sm font-bold">G</div>
              <div className="w-8 h-8 rounded-full bg-stellar-orange flex items-center justify-center text-white text-sm font-bold -ml-2">M</div>
              <div className="w-8 h-8 rounded-full bg-stellar-green flex items-center justify-center text-white text-sm font-bold -ml-2">A</div>
              <div className="w-8 h-8 rounded-full bg-eclipse-border dark:bg-space-gray flex items-center justify-center text-eclipse-text-light dark:text-space-text text-sm font-bold -ml-2">F</div>
            </div>
            <p className="text-eclipse-muted-light dark:text-space-muted">and 1000+ companies</p>
          </div>
        </div>
        
        <div className="lg:w-1/2">
          <div className="relative">
            <div className="absolute -top-4 -left-4 right-4 bottom-4 bg-gradient-to-r from-stellar-blue/20 via-stellar-orange/20 to-stellar-green/20 rounded-xl blur-xl"></div>
            <img 
              src={heroImage || 'https://via.placeholder.com/600x400?text=Eclipser'} 
              alt="Developers coding" 
              className="relative rounded-xl shadow-space-card border border-eclipse-border dark:border-space-gray"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-eclipse-surface/50 dark:from-space-dark/50 via-transparent to-transparent opacity-50 rounded-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;