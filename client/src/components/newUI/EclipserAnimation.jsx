import { motion } from  "framer-motion";

const EclipserAnimation = () => {

      // Animated background elements
  const floatingStars = Array.from({ length: 20 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-2 h-2 bg-stellar-blue rounded-full z-0"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        opacity: [0.4, 1, 0.4],
        scale: [1, 2, 1],
        rotate: [0, 360],
      }}
      transition={{
        duration: 2 + Math.random() * 3,
        repeat: Infinity,
        delay: Math.random() * 2,
      }}
    />
  ));

  const planets = [
    { size: 'w-20 h-20', color: 'bg-gradient-to-br from-stellar-purple/50 to-stellar-blue/50', position: 'top-20 left-20', delay: 0 },
    { size: 'w-16 h-16', color: 'bg-gradient-to-br from-stellar-orange/40 to-stellar-green/40', position: 'top-40 right-32', delay: 1 },
    { size: 'w-12 h-12', color: 'bg-gradient-to-br from-stellar-green/50 to-stellar-blue/50', position: 'bottom-32 left-40', delay: 2 },
    { size: 'w-14 h-14', color: 'bg-gradient-to-br from-stellar-orange/40 to-stellar-purple/40', position: 'bottom-20 right-20', delay: 0.5 },
  ];




  return (
    <>
        {/* Animated Background Stars - Fixed Z-index */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {floatingStars}
        
        {/* Add some shooting stars for visibility test */}
        {Array.from({ length: 3 }, (_, i) => (
          <motion.div
            key={`shooting-${i}`}
            className="absolute w-1 h-8 bg-gradient-to-t from-stellar-blue to-transparent rounded-full"
            style={{
              left: `${20 + i * 30}%`,
              top: `${10 + i * 20}%`,
            }}
            animate={{
              x: [0, 200],
              y: [0, 100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 3,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
      
      {/* Floating Planets - Fixed Z-index */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {planets.map((planet, index) => (
          <motion.div
            key={index}
            className={`absolute ${planet.size} ${planet.color} rounded-full ${planet.position}`}
            animate={{
              y: [-10, 10, -10],
              rotate: [0, 360],
            }}
            transition={{
              duration: 8 + index * 2,
              repeat: Infinity,
              delay: planet.delay,
            }}
          />
        ))}
      </div>

      {/* Animated Particles - Fixed Z-index */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {Array.from({ length: 15 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-stellar-blue rounded-full shadow-lg shadow-stellar-blue/50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -120],
              opacity: [0, 0.8, 0],
              scale: [1, 1.5, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
        
        {/* Add some larger glowing orbs for visibility */}
        {Array.from({ length: 5 }, (_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-3 h-3 bg-stellar-purple rounded-full shadow-lg shadow-stellar-purple/50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Ambient cosmic glow - Fixed Z-index */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-stellar-blue/30 rounded-full blur-3xl"
          animate={{
            opacity: [0.4, 0.7, 0.4],
            scale: [1, 1.3, 1],
            x: [-20, 20, -20],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-stellar-purple/30 rounded-full blur-3xl"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
            x: [20, -20, 20],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            delay: 2,
          }}
        />
        
        {/* Additional smaller glows */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-40 h-40 bg-stellar-orange/25 rounded-full blur-2xl"
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [0.8, 1.4, 0.8],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            delay: 4,
          }}
        />
      </div>
    </>
  );
};

export default EclipserAnimation;
