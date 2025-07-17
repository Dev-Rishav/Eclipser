import React from 'react';
import { FaMeteor, FaClock, FaTrophy, FaUsers } from 'react-icons/fa';
import { baseOriginal, baseWebp1024, baseWebp512 } from '../../assets/images.js';
import OptimizedImage from '../OptimizedImage.jsx';

const Contests = () => {
  return (
    <section id="contests" className="py-20 bg-eclipse-surface/30 dark:bg-space-dark/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-eclipse-text-light dark:text-space-text">Coding Contests</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-stellar-blue via-stellar-orange to-stellar-green mx-auto"></div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2">
            <div className="relative">
              <div className="absolute -top-4 -left-4 right-4 bottom-4 bg-gradient-to-r from-stellar-blue/20 via-stellar-orange/20 to-stellar-green/20 rounded-xl blur-xl"></div>
              <OptimizedImage
                src={baseOriginal}
                webpSrc512={baseWebp512}
                webpSrc1024={baseWebp1024}
                alt="Coding Contest in space environment"
                className="relative rounded-xl shadow-space-card border border-eclipse-border dark:border-space-gray w-full"
              />
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-stellar-blue">Weekly Orbit Challenges</h3>
            <p className="text-eclipse-muted-light dark:text-space-muted mb-6 leading-relaxed">
              Every weekend, we host coding contests with challenges of varying difficulty levels. 
              Compete with developers worldwide, solve problems, and earn points to climb our global leaderboard.
            </p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <FaMeteor className="text-stellar-orange mt-1 mr-4 flex-shrink-0" />
                <span className="text-eclipse-text-light dark:text-space-text">Three difficulty levels: Asteroid, Planetary, and Galactic</span>
              </li>
              <li className="flex items-start">
                <FaClock className="text-stellar-blue mt-1 mr-4 flex-shrink-0" />
                <span className="text-eclipse-text-light dark:text-space-text">Contests last 2-3 hours with real-time rankings</span>
              </li>
              <li className="flex items-start">
                <FaTrophy className="text-stellar-green mt-1 mr-4 flex-shrink-0" />
                <span className="text-eclipse-text-light dark:text-space-text">Win badges, certificates, and exclusive access to advanced features</span>
              </li>
              <li className="flex items-start">
                <FaUsers className="text-stellar-orange mt-1 mr-4 flex-shrink-0" />
                <span className="text-eclipse-text-light dark:text-space-text">Form teams for special quarterly team challenges</span>
              </li>
            </ul>
            
            <button className="px-6 py-3 bg-stellar-blue text-white rounded-full font-semibold hover:bg-stellar-blue/80 transition shadow-stellar-blue-glow">
              View Upcoming Contests
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contests;