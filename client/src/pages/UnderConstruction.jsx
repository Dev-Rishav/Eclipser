import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const UnderConstruction = () => {
  const navigate = useNavigate();

  const floatingStars = Array.from({ length: 20 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-1 h-1 bg-stellar-blue rounded-full"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        opacity: [0.3, 1, 0.3],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: 2 + Math.random() * 3,
        repeat: Infinity,
        delay: Math.random() * 2,
      }}
    />
  ));

  const planets = [
    { size: 'w-32 h-32', color: 'bg-gradient-to-br from-stellar-purple to-stellar-blue', position: 'top-20 left-20', delay: 0 },
    { size: 'w-24 h-24', color: 'bg-gradient-to-br from-stellar-orange to-stellar-green', position: 'top-40 right-32', delay: 1 },
    { size: 'w-16 h-16', color: 'bg-gradient-to-br from-stellar-green to-stellar-blue', position: 'bottom-32 left-40', delay: 2 },
    { size: 'w-20 h-20', color: 'bg-gradient-to-br from-stellar-orange to-stellar-purple', position: 'bottom-20 right-20', delay: 0.5 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-void via-space-dark to-eclipse-light dark:from-space-void dark:via-space-darker dark:to-space-dark relative overflow-hidden">
      {/* Animated Background Stars */}
      {floatingStars}
      
      {/* Floating Planets */}
      {planets.map((planet, index) => (
        <motion.div
          key={index}
          className={`absolute ${planet.size} ${planet.color} rounded-full opacity-20 ${planet.position}`}
          animate={{
            y: [-20, 20, -20],
            rotate: [0, 360],
          }}
          transition={{
            duration: 8 + index * 2,
            repeat: Infinity,
            delay: planet.delay,
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Central Portal/Wormhole Effect */}
        <motion.div
          className="relative mb-12"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          <div className="w-64 h-64 relative">
            {/* Outer Ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-stellar-blue/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Middle Ring */}
            <motion.div
              className="absolute inset-4 rounded-full border-4 border-stellar-purple/50"
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Inner Ring */}
            <motion.div
              className="absolute inset-8 rounded-full border-4 border-stellar-orange/70"
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Core */}
            <motion.div
              className="absolute inset-16 rounded-full bg-gradient-to-br from-stellar-blue via-stellar-purple to-stellar-orange shadow-2xl"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(59, 130, 246, 0.5)',
                  '0 0 40px rgba(168, 85, 247, 0.7)',
                  '0 0 20px rgba(59, 130, 246, 0.5)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                </svg>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Title Section */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-stellar-blue via-stellar-purple to-stellar-orange bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ backgroundSize: '200% 200%' }}
          >
            UNKNOWN
          </motion.h1>
          <motion.h2
            className="text-4xl md:text-6xl font-bold mb-6 text-space-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7, 1] }}
            transition={{ duration: 2, delay: 1 }}
          >
            DIMENSION
          </motion.h2>
          <motion.div
            className="h-1 w-32 mx-auto bg-gradient-to-r from-stellar-blue to-stellar-purple rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 128 }}
            transition={{ duration: 1.5, delay: 1.5 }}
          />
        </motion.div>

        {/* Description */}
        <motion.div
          className="text-center mb-12 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
        >
          <p className="text-xl md:text-2xl text-space-muted mb-4">
            🚀 Exploring uncharted territories of the digital cosmos
          </p>
          <p className="text-lg text-space-text/80">
            Our space engineers are currently constructing this section of the galaxy. 
            Amazing features are being forged in the stellar foundries!
          </p>
        </motion.div>

        {/* Progress Indicators */}
        <motion.div
          className="mb-12 space-y-4 w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.5 }}
        >
          {[
            { label: 'Quantum Algorithms', progress: 85 },
            { label: 'Stellar Navigation', progress: 70 },
            { label: 'Cosmic Interface', progress: 60 },
            { label: 'Warp Drive Integration', progress: 45 },
          ].map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-space-text text-sm">
                <span>{item.label}</span>
                <span>{item.progress}%</span>
              </div>
              <div className="h-2 bg-space-darker rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-stellar-blue to-stellar-purple rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 2, delay: 3 + index * 0.2 }}
                />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 3.5 }}
        >
          <motion.button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gradient-to-r from-stellar-blue to-stellar-purple text-white font-semibold rounded-full shadow-stellar-blue-glow hover:shadow-stellar-blue-glow-lg transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            🏠 Return to Home Base
          </motion.button>
          
          <motion.button
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-eclipse-surface/20 dark:bg-space-dark/40 backdrop-blur-lg border border-space-gray text-space-text font-semibold rounded-full hover:bg-space-dark/60 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            ↩️ Previous Dimension
          </motion.button>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 4 }}
        >
          <p className="text-space-muted text-sm">
            Expected completion: <span className="text-stellar-orange">When the stars align</span> ✨
          </p>
          <p className="text-space-text/60 text-xs mt-2">
            &ldquo;The universe is not only stranger than we imagine, it is stranger than we can imagine.&rdquo; - J.B.S. Haldane
          </p>
        </motion.div>
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px bg-stellar-blue rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-10, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default UnderConstruction;
