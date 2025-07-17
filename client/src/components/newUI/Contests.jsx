import { useRef } from 'react';
import { FaMeteor, FaClock, FaTrophy, FaUsers } from 'react-icons/fa';
import { motion, useInView } from 'framer-motion';
import { baseOriginal, baseWebp1024, baseWebp512 } from '../../assets/images.js';
import OptimizedImage from '../OptimizedImage.jsx';

const Contests = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });

  return (
    <section id="contests" className="py-20 bg-eclipse-surface/30 dark:bg-space-dark/30" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-eclipse-text-light dark:text-space-text">Coding Contests</h2>
          <motion.div 
            className="w-20 h-1 bg-gradient-to-r from-stellar-blue via-stellar-orange to-stellar-green mx-auto"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </motion.div>
        
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              <motion.div 
                className="absolute -top-4 -left-4 right-4 bottom-4 bg-gradient-to-r from-stellar-blue/20 via-stellar-orange/20 to-stellar-green/20 rounded-xl blur-xl"
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
                alt="Coding Contest in space environment"
                className="relative rounded-xl shadow-space-card border border-eclipse-border dark:border-space-gray w-full"
              />
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-stellar-blue">Weekly Orbit Challenges</h3>
            <p className="text-eclipse-muted-light dark:text-space-muted mb-6 leading-relaxed">
              Every weekend, we host coding contests with challenges of varying difficulty levels. 
              Compete with developers worldwide, solve problems, and earn points to climb our global leaderboard.
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                { icon: FaMeteor, color: "text-stellar-orange", text: "Three difficulty levels: Asteroid, Planetary, and Galactic" },
                { icon: FaClock, color: "text-stellar-blue", text: "Contests last 2-3 hours with real-time rankings" },
                { icon: FaTrophy, color: "text-stellar-green", text: "Win badges, certificates, and exclusive access to advanced features" },
                { icon: FaUsers, color: "text-stellar-orange", text: "Form teams for special quarterly team challenges" }
              ].map((item, index) => (
                <motion.li 
                  key={index}
                  className="flex items-start"
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                >
                  <item.icon className={`${item.color} mt-1 mr-4 flex-shrink-0`} />
                  <span className="text-eclipse-text-light dark:text-space-text">{item.text}</span>
                </motion.li>
              ))}
            </ul>
            
            <motion.button 
              className="px-6 py-3 bg-stellar-blue text-white rounded-full font-semibold hover:bg-stellar-blue/80 transition shadow-stellar-blue-glow"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              View Upcoming Contests
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contests;
