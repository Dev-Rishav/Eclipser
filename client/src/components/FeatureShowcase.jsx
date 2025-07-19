import { useState, createElement } from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaTag, FaUser, FaCog } from 'react-icons/fa';

const FeatureShowcase = () => {
  const [activeDemo, setActiveDemo] = useState('personalization');

  const demos = {
    personalization: {
      title: 'Smart Personalization',
      icon: FaRocket,
      color: 'stellar-blue',
      description: 'Feed automatically adapts based on your subscriptions',
      features: [
        'Personalized posts shown first',
        'General feed as fallback',
        'Real-time feed type detection',
        'Smart topic recommendations'
      ]
    },
    topics: {
      title: 'Dynamic Topic Management',
      icon: FaTag,
      color: 'stellar-orange',
      description: 'Expandable topics card with aerospace styling',
      features: [
        'Active topics with pulsing indicators',
        'Expandable discovery section',
        'One-click subscribe/unsubscribe',
        'Custom scrollbars for large lists'
      ]
    },
    ux: {
      title: 'Enhanced User Experience',
      icon: FaUser,
      color: 'stellar-green',
      description: 'Smooth animations and intuitive interactions',
      features: [
        'Staggered loading animations',
        'Hover effects and scaling',
        'Mission-control aerospace theme',
        'Responsive height adjustments'
      ]
    },
    backend: {
      title: 'Optimized Backend Integration',
      icon: FaCog,
      color: 'stellar-purple',
      description: 'Efficient post fetching and Redis caching',
      features: [
        'Tag-based post filtering',
        'Smart pagination system',
        'Redis caching optimization',
        'Remaining posts API'
      ]
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-eclipse-surface dark:bg-space-darker rounded-xl border border-stellar-blue/30 shadow-stellar-blue-glow">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-eclipse-text-light dark:text-space-text mb-2">
          🚀 Personalized Feed System
        </h2>
        <p className="text-eclipse-muted-light dark:text-space-muted">
          Complete topic-based personalization with aerospace-themed UI
        </p>
      </div>

      {/* Demo Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
        {Object.entries(demos).map(([key, demo]) => (
          <button
            key={key}
            onClick={() => setActiveDemo(key)}
            className={`p-4 rounded-lg border transition-all hover:scale-105 ${
              activeDemo === key
                ? `border-${demo.color}/50 bg-${demo.color}/10 shadow-${demo.color}-glow`
                : 'border-eclipse-border dark:border-space-gray hover:border-stellar-blue/30'
            }`}
          >
            <demo.icon className={`mx-auto mb-2 text-xl text-${demo.color}`} />
            <div className="text-sm font-semibold text-eclipse-text-light dark:text-space-text">
              {demo.title.split(' ')[0]}
            </div>
          </button>
        ))}
      </div>

      {/* Active Demo Display */}
      <motion.div
        key={activeDemo}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`bg-${demos[activeDemo].color}/5 border border-${demos[activeDemo].color}/20 rounded-lg p-6`}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 bg-gradient-to-r from-${demos[activeDemo].color} to-stellar-blue rounded-full flex items-center justify-center shadow-${demos[activeDemo].color}-glow`}>
            {demos[activeDemo].icon && createElement(demos[activeDemo].icon, { className: "text-white text-xl" })}
          </div>
          <div>
            <h3 className="text-xl font-bold text-eclipse-text-light dark:text-space-text">
              {demos[activeDemo].title}
            </h3>
            <p className="text-eclipse-muted-light dark:text-space-muted text-sm">
              {demos[activeDemo].description}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {demos[activeDemo].features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-eclipse-surface/30 dark:bg-space-darker/30 rounded-lg"
            >
              <div className={`w-2 h-2 bg-${demos[activeDemo].color} rounded-full animate-pulse`}></div>
              <span className="text-eclipse-text-light dark:text-space-text text-sm">
                {feature}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-${demos[activeDemo].color}/10 rounded-full border border-${demos[activeDemo].color}/20`}>
            <div className={`w-2 h-2 bg-${demos[activeDemo].color} rounded-full animate-pulse`}></div>
            <span className="text-eclipse-text-light dark:text-space-text text-sm font-medium">
              {activeDemo === 'personalization' && 'Feed adapts to your interests'}
              {activeDemo === 'topics' && 'Topics expand dynamically'}
              {activeDemo === 'ux' && 'Smooth aerospace animations'}
              {activeDemo === 'backend' && 'Efficient data retrieval'}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 text-center text-eclipse-muted-light dark:text-space-muted text-xs">
        🎯 Complete personalization system with topic-based content filtering and aerospace-themed UI
      </div>
    </div>
  );
};

export default FeatureShowcase;
