import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const SpaceBackground = () => {
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Memoize star positions for performance - reduce count for mobile
  const stars = useMemo(() => {
    const count = windowSize.width < 480 ? 20 : windowSize.width < 768 ? 35 : 60;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: windowSize.width < 480 ? Math.random() * 2 + 1 : Math.random() * 3 + 1.5,
      opacity: windowSize.width < 480 ? Math.random() * 0.7 + 0.5 : Math.random() * 0.9 + 0.6,
      duration: Math.random() * 4 + 3
    }));
  }, [windowSize.width]);

  // Memoize planet positions for performance
  const planets = useMemo(() => {
    const count = windowSize.width < 480 ? 2 : 3;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: windowSize.width < 480 ? Math.random() * 40 + 25 : Math.random() * 60 + 40,
      color: ['stellar-blue', 'stellar-orange', 'stellar-green'][i],
      duration: 15 + i * 5
    }));
  }, [windowSize.width]);

  // Floating cosmic dust particles
  const cosmicDust = useMemo(() => {
    const count = windowSize.width < 480 ? 8 : windowSize.width < 768 ? 15 : 25;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: windowSize.width < 480 ? Math.random() * 1.5 + 0.5 : Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      duration: Math.random() * 8 + 10
    }));
  }, [windowSize.width]);

  // Pulsing energy orbs
  const energyOrbs = useMemo(() => {
    const count = windowSize.width < 480 ? 2 : windowSize.width < 768 ? 3 : 4;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      size: windowSize.width < 480 ? Math.random() * 30 + 15 : Math.random() * 40 + 20,
      color: ['blue', 'purple', 'orange', 'green'][i],
      duration: Math.random() * 6 + 8
    }));
  }, [windowSize.width]);

  // Reduce motion for low-end devices
  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Eclipse animation component
  const EclipseAnimation = React.memo(() => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0.6 }}
        animate={{ 
          scale: prefersReducedMotion() ? 1 : [0.8, 1.3, 0.8],
          opacity: prefersReducedMotion() ? 0.8 : [0.6, 1, 0.6]
        }}
        transition={{
          duration: prefersReducedMotion() ? 0 : 8,
          repeat: prefersReducedMotion() ? 0 : Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Sun */}
        <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-stellar-orange/60 to-stellar-orange/30 rounded-full blur-sm shadow-2xl shadow-stellar-orange/40" />
        
        {/* Moon causing eclipse */}
        <motion.div
          className="absolute top-2 left-2 w-28 h-28 sm:w-40 sm:h-40 bg-gradient-to-br from-space-dark via-eclipse-800/80 to-eclipse-600 rounded-full border-2 border-stellar-blue/30"
          initial={{ x: -100, y: -100 }}
          animate={{ 
            x: prefersReducedMotion() ? 0 : [-100, 20, 100],
            y: prefersReducedMotion() ? 0 : [-100, 0, 100]
          }}
          transition={{
            duration: prefersReducedMotion() ? 0 : 12,
            repeat: prefersReducedMotion() ? 0 : Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Eclipse corona effect */}
        <motion.div
          className="absolute inset-0 w-36 h-36 sm:w-52 sm:h-52 border-4 border-stellar-orange/50 rounded-full shadow-lg shadow-stellar-orange/30"
          animate={{ 
            scale: prefersReducedMotion() ? 1 : [1, 1.2, 1],
            rotate: prefersReducedMotion() ? 0 : 360
          }}
          transition={{
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" }
          }}
        />
        
        {/* Additional glow rings */}
        <motion.div
          className="absolute inset-0 w-40 h-40 sm:w-60 sm:h-60 border-2 border-stellar-blue/30 rounded-full"
          animate={{ 
            scale: prefersReducedMotion() ? 1 : [1, 1.3, 1],
            rotate: prefersReducedMotion() ? 0 : -360
          }}
          transition={{
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 25, repeat: Infinity, ease: "linear" }
          }}
        />
      </motion.div>
    </div>
  ));
  EclipseAnimation.displayName = 'EclipseAnimation';

  // Cosmic dust particles animation
  const CosmicDust = React.memo(() => (
    <div className="absolute inset-0 overflow-hidden">
      {cosmicDust.map((dust) => (
        <motion.div
          key={dust.id}
          className="absolute bg-white/60 rounded-full"
          style={{
            left: `${dust.x}%`,
            top: `${dust.y}%`,
            width: `${dust.size}px`,
            height: `${dust.size}px`,
            opacity: dust.opacity,
          }}
          animate={{
            y: prefersReducedMotion() ? 0 : [0, -20, 0],
            x: prefersReducedMotion() ? 0 : [0, 10, -5, 0],
            opacity: prefersReducedMotion() ? dust.opacity : [dust.opacity * 0.3, dust.opacity, dust.opacity * 0.3],
          }}
          transition={{
            duration: dust.duration,
            repeat: prefersReducedMotion() ? 0 : Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  ));
  CosmicDust.displayName = 'CosmicDust';

  // Energy orbs animation
  const EnergyOrbs = React.memo(() => (
    <div className="absolute inset-0 overflow-hidden">
      {energyOrbs.map((orb) => (
        <motion.div
          key={orb.id}
          className={`absolute rounded-full bg-${orb.color}-400/20 blur-xl`}
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
          }}
          animate={{
            scale: prefersReducedMotion() ? 1 : [1, 1.5, 1],
            opacity: prefersReducedMotion() ? 0.3 : [0.1, 0.4, 0.1],
            rotate: prefersReducedMotion() ? 0 : [0, 180, 360],
          }}
          transition={{
            duration: orb.duration,
            repeat: prefersReducedMotion() ? 0 : Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  ));
  EnergyOrbs.displayName = 'EnergyOrbs';

  // Aurora-like waves animation
  const AuroraWaves = React.memo(() => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Wave 1 */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-green-400/10 to-transparent"
        style={{
          clipPath: 'polygon(0% 20%, 100% 30%, 100% 40%, 0% 35%)'
        }}
        animate={{
          x: prefersReducedMotion() ? 0 : [-100, 100, -100],
          opacity: prefersReducedMotion() ? 0.1 : [0, 0.3, 0]
        }}
        transition={{
          duration: 20,
          repeat: prefersReducedMotion() ? 0 : Infinity,
          ease: "easeInOut"
        }}
      />
      {/* Wave 2 */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-400/8 to-transparent"
        style={{
          clipPath: 'polygon(0% 60%, 100% 50%, 100% 70%, 0% 75%)'
        }}
        animate={{
          x: prefersReducedMotion() ? 0 : [100, -100, 100],
          opacity: prefersReducedMotion() ? 0.08 : [0, 0.25, 0]
        }}
        transition={{
          duration: 25,
          repeat: prefersReducedMotion() ? 0 : Infinity,
          ease: "easeInOut",
          delay: 5
        }}
      />
      {/* Wave 3 */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-purple-400/6 to-transparent"
        style={{
          clipPath: 'polygon(0% 80%, 100% 85%, 100% 95%, 0% 90%)'
        }}
        animate={{
          x: prefersReducedMotion() ? 0 : [-50, 150, -50],
          opacity: prefersReducedMotion() ? 0.06 : [0, 0.2, 0]
        }}
        transition={{
          duration: 30,
          repeat: prefersReducedMotion() ? 0 : Infinity,
          ease: "easeInOut",
          delay: 10
        }}
      />
    </div>
  ));
  AuroraWaves.displayName = 'AuroraWaves';

  // Floating geometric shapes - simplified for mobile
  const FloatingGeometry = React.memo(() => {
    const shapes = useMemo(() => {
      const count = windowSize.width < 480 ? 3 : windowSize.width < 768 ? 4 : 6;
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 90 + 5,
        y: Math.random() * 90 + 5,
        size: windowSize.width < 480 ? Math.random() * 15 + 8 : Math.random() * 20 + 10,
        shape: ['triangle', 'square', 'diamond'][i % 3],
        duration: Math.random() * 8 + 12
      }));
    }, []);

    if (!isClient) return null;

    return (
      <div className="absolute inset-0 overflow-hidden">
        {shapes.map((shape) => (
          <motion.div
            key={shape.id}
            className={`absolute border border-stellar-blue/30 ${
              shape.shape === 'square' ? 'rounded-none' :
              shape.shape === 'diamond' ? 'rotate-45 rounded-none' :
              'rounded-none'
            }`}
            style={{
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              width: `${shape.size}px`,
              height: `${shape.size}px`,
              background: shape.shape === 'triangle' ? 
                'linear-gradient(45deg, transparent 50%, rgba(59,130,246,0.1) 50%)' :
                'rgba(59,130,246,0.05)',
              clipPath: shape.shape === 'triangle' ? 
                'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
              boxShadow: '0 0 10px rgba(59,130,246,0.3)'
            }}
            animate={{
              rotate: prefersReducedMotion() ? 0 : [0, 360],
              scale: prefersReducedMotion() ? 1 : [1, 1.1, 1],
              opacity: prefersReducedMotion() ? 0.4 : [0.2, 0.5, 0.2],
              y: prefersReducedMotion() ? 0 : [0, -20, 0]
            }}
            transition={{
              duration: shape.duration,
              repeat: prefersReducedMotion() ? 0 : Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  });
  FloatingGeometry.displayName = 'FloatingGeometry';

  // Optimized star field with accent colors
  const StarField = React.memo(() => (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star, index) => {
        const colors = ['rgb(255,255,255)', 'rgb(59,130,246)', 'rgb(251,146,60)', 'rgb(34,197,94)', 'rgb(168,85,247)'];
        const color = colors[index % colors.length];
        
        return (
          <motion.div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: color,
              boxShadow: `0 0 ${star.size * 3}px ${color}80, 0 0 ${star.size * 6}px ${color}40`,
              opacity: star.opacity,
            }}
            animate={{ 
              opacity: prefersReducedMotion() ? star.opacity : [star.opacity * 0.4, star.opacity, star.opacity * 0.4],
              scale: prefersReducedMotion() ? 1 : [1, 1.4, 1]
            }}
            transition={{
              duration: star.duration,
              repeat: prefersReducedMotion() ? 0 : Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        );
      })}
    </div>
  ));
  StarField.displayName = 'StarField';

  // Floating planets
  const FloatingPlanets = React.memo(() => (
    <div className="absolute inset-0 overflow-hidden">
      {planets.map((planet) => (
        <motion.div
          key={planet.id}
          className={`absolute rounded-full opacity-60 bg-gradient-to-br from-${planet.color}/60 to-${planet.color}/30 blur-lg shadow-2xl`}
          style={{
            left: `${planet.x}%`,
            top: `${planet.y}%`,
            width: `${planet.size}px`,
            height: `${planet.size}px`,
            boxShadow: `0 0 ${planet.size}px rgba(147, 197, 253, 0.4)`,
          }}
          animate={{
            x: prefersReducedMotion() ? 0 : [0, 50, -30, 0],
            y: prefersReducedMotion() ? 0 : [0, -40, 30, 0],
            scale: prefersReducedMotion() ? 1 : [1, 1.2, 0.9, 1]
          }}
          transition={{
            duration: planet.duration,
            repeat: prefersReducedMotion() ? 0 : Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  ));
  FloatingPlanets.displayName = 'FloatingPlanets';

  // Shooting stars (reduced for mobile)
  const ShootingStars = React.memo(() => {
    const shootingStars = useMemo(() => 
      Array.from({ length: windowSize.width < 768 ? 2 : 4 }, (_, i) => ({ id: i })),
      []
    );

    if (!isClient) return null;

    return (
      <div className="absolute inset-0 overflow-hidden">
        {shootingStars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              boxShadow: '0 0 12px 2px rgba(255,255,255,0.8), 0 0 24px 4px rgba(147,197,253,0.6)',
            }}
            initial={{
              x: -10,
              y: Math.random() * windowSize.height,
              opacity: 0
            }}
            animate={{
              x: windowSize.width + 10,
              y: Math.random() * windowSize.height + 150,
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: prefersReducedMotion() ? 0 : 3,
              repeat: prefersReducedMotion() ? 0 : Infinity,
              delay: Math.random() * 6,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    );
  });
  ShootingStars.displayName = 'ShootingStars';

  // Nebula clouds (enhanced visibility)
  const NebulaClouds = React.memo(() => (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-stellar-blue/30 via-stellar-purple/20 to-transparent rounded-full blur-2xl opacity-80"
        animate={{
          scale: prefersReducedMotion() ? 1 : [1, 1.3, 1],
          x: prefersReducedMotion() ? 0 : [0, 40, 0],
          y: prefersReducedMotion() ? 0 : [0, -30, 0]
        }}
        transition={{
          duration: 12,
          repeat: prefersReducedMotion() ? 0 : Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-48 h-48 sm:w-80 sm:h-80 bg-gradient-to-br from-stellar-orange/25 via-stellar-green/15 to-transparent rounded-full blur-2xl opacity-70"
        animate={{
          scale: prefersReducedMotion() ? 1 : [1, 1.2, 1],
          x: prefersReducedMotion() ? 0 : [0, -35, 0],
          y: prefersReducedMotion() ? 0 : [0, 20, 0]
        }}
        transition={{
          duration: 15,
          repeat: prefersReducedMotion() ? 0 : Infinity,
          ease: "easeInOut",
          delay: 3
        }}
      />
      {/* Additional nebula for more depth */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-gradient-to-br from-stellar-purple/15 via-stellar-blue/10 to-stellar-orange/8 rounded-full blur-3xl opacity-60"
        animate={{
          scale: prefersReducedMotion() ? 1 : [1, 1.1, 1],
          rotate: prefersReducedMotion() ? 0 : [0, 180, 360]
        }}
        transition={{
          duration: 25,
          repeat: prefersReducedMotion() ? 0 : Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  ));
  NebulaClouds.displayName = 'NebulaClouds';

  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none overflow-hidden">
      {/* Enhanced base gradient background - more vibrant */}
      <div className="absolute inset-0 bg-gradient-to-br from-eclipse-light/80 via-eclipse-surface/60 to-eclipse-border/40 dark:from-space-void/90 dark:via-space-dark/70 dark:to-space-darker/50" />
      
      {/* Additional gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-stellar-blue/10 via-transparent to-stellar-orange/10" />
      
      {/* Only render animations if client-side and motion is allowed */}
      {isClient && (
        <>
          <AuroraWaves />
          <CosmicDust />
          <EnergyOrbs />
          <FloatingGeometry />
          <NebulaClouds />
          <StarField />
          <FloatingPlanets />
          <EclipseAnimation />
          <ShootingStars />
        </>
      )}
      
      {/* Reduced overlay for better visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-eclipse-light/10 dark:to-space-void/10" />
    </div>
  );
};

export default React.memo(SpaceBackground);
