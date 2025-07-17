
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const Testimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });

  const testimonials = [
    {
      content: "Eclipser has transformed the way I learn and grow as a developer. The community is incredibly supportive, and the contests have sharpened my problem-solving skills.",
      author: "Sarah Johnson",
      role: "Senior Frontend Developer",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg"
    },
    {
      content: "I've found solutions to problems I've been stuck on for days within minutes of posting on Eclipser. The platform's space theme also makes coding feel like an adventure!",
      author: "Michael Torres",
      role: "Backend Engineer",
      avatar: "https://randomuser.me/api/portraits/men/43.jpg"
    }
  ];

  return (
    <section id="testimonials" className="py-20 relative" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-eclipse-text-light dark:text-space-text">Developers Love Eclipser</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-stellar-blue via-stellar-orange to-stellar-green mx-auto"></div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -5 }}
              className="bg-eclipse-surface dark:bg-space-dark p-8 rounded-xl border border-eclipse-border dark:border-space-gray hover:border-stellar-blue/50 transition-all duration-300 hover:shadow-space-card"
            >
              <p className="text-eclipse-muted-light dark:text-space-muted italic mb-6 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
              <div className="flex items-center">
                <motion.img 
                  src={testimonial.avatar} 
                  alt={testimonial.author} 
                  className="w-12 h-12 rounded-full mr-4 border-2 border-stellar-blue"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                />
                <div>
                  <h4 className="font-semibold text-eclipse-text-light dark:text-space-text">{testimonial.author}</h4>
                  <p className="text-eclipse-muted-light dark:text-space-muted text-sm">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-eclipse-muted-light dark:text-space-muted mb-8">Join thousands of developers who are already part of our community</p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { number: "15K+", label: "Active Users", color: "stellar-blue" },
              { number: "250+", label: "Weekly Contests", color: "stellar-orange" },
              { number: "5M+", label: "Questions Answered", color: "stellar-green" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-eclipse-surface dark:bg-space-dark px-6 py-3 rounded-lg flex items-center border border-eclipse-border dark:border-space-gray shadow-space-card"
              >
                <span className={`text-3xl font-bold mr-2 text-${stat.color}`}>{stat.number}</span>
                <span className="text-eclipse-muted-light dark:text-space-muted">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;