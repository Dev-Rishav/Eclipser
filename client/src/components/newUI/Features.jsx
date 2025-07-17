import React from 'react';
import { FaQuestionCircle, FaComments, FaTrophy, FaCode } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Features = () => {
  const features = [
    {
      icon: <FaQuestionCircle className="text-4xl text-stellar-blue" />,
      title: 'Ask & Answer',
      description: 'Post your coding queries and get solutions from experienced developers around the globe.',
      color: 'stellar-blue'
    },
    {
      icon: <FaComments className="text-4xl text-stellar-orange" />,
      title: 'Discuss & Grow',
      description: 'Engage in meaningful discussions about technologies, methodologies, and industry trends.',
      color: 'stellar-orange'
    },
    {
      icon: <FaTrophy className="text-4xl text-stellar-green" />,
      title: 'Share Achievements',
      description: 'Showcase your projects, certifications, and milestones to build your developer portfolio.',
      color: 'stellar-green'
    },
    {
      icon: <FaCode className="text-4xl text-stellar-blue" />,
      title: 'Compete & Win',
      description: 'Test your skills in weekly coding contests and climb the global leaderboard.',
      color: 'stellar-blue'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="features" className="py-20 bg-eclipse-surface/30 dark:bg-space-dark/30">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-eclipse-text-light dark:text-space-text">Why Join Eclipser?</h2>
          <motion.div 
            className="w-20 h-1 bg-gradient-to-r from-stellar-blue via-stellar-orange to-stellar-green mx-auto"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          />
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`bg-eclipse-surface dark:bg-space-dark p-8 rounded-xl border border-eclipse-border dark:border-space-gray hover:border-${feature.color}/50 transition-all duration-300 hover:shadow-space-card shadow-space-card`}
            >
              <motion.div 
                className="mb-5"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-semibold mb-3 text-eclipse-text-light dark:text-space-text">{feature.title}</h3>
              <p className="text-eclipse-muted-light dark:text-space-muted">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;