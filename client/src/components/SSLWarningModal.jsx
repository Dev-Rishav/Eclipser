import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShieldAlt, FaExternalLinkAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import PropTypes from 'prop-types';

const SSLWarningModal = ({ isOpen, onClose, backendUrl }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleBackendUrlClick = () => {
    window.open(backendUrl, '_blank');
  };

  const handleAlreadyDone = () => {
    localStorage.setItem('ssl-certificate-accepted', 'true');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="bg-white dark:bg-space-dark rounded-2xl border-2 border-stellar-orange/30 shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-stellar-orange/10 via-stellar-blue/10 to-stellar-purple/10 p-6 border-b border-eclipse-border dark:border-space-gray">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-stellar-orange to-stellar-blue rounded-full flex items-center justify-center shadow-stellar-orange-glow">
                  <FaShieldAlt className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-eclipse-text-light dark:text-space-text">
                    SSL Certificate Setup Required
                  </h2>
                  <p className="text-sm text-eclipse-muted-light dark:text-space-muted">
                    One-time browser configuration needed
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Main Message */}
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-stellar-orange mt-1 flex-shrink-0" />
                <div className="text-eclipse-text-light dark:text-space-text">
                  <p className="font-medium mb-2">
                    Our backend uses a custom SSL certificate for enhanced security.
                  </p>
                  <p className="text-sm text-eclipse-muted-light dark:text-space-muted">
                    Your browser needs to trust this certificate before you can access Eclipser&apos;s features.
                  </p>
                </div>
              </div>

              {/* Backend URL Section */}
              <div className="bg-eclipse-surface/50 dark:bg-space-darker/50 rounded-lg p-4 border border-eclipse-border dark:border-space-gray">
                <h3 className="font-semibold text-eclipse-text-light dark:text-space-text mb-3 flex items-center gap-2">
                  <FaExternalLinkAlt className="text-stellar-blue" />
                  Step 1: Allow Certificate
                </h3>
                <p className="text-sm text-eclipse-muted-light dark:text-space-muted mb-3">
                  Click the button below to open the backend URL and accept the SSL certificate:
                </p>
                <button
                  onClick={handleBackendUrlClick}
                  className="w-full p-3 bg-gradient-to-r from-stellar-blue to-stellar-purple text-white rounded-lg font-medium hover:shadow-stellar-blue-glow transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FaExternalLinkAlt />
                  Open Backend URL
                  <span className="text-xs opacity-80">({backendUrl})</span>
                </button>
              </div>

              {/* Instructions */}
              <motion.div
                className="bg-eclipse-surface/30 dark:bg-space-darker/30 rounded-lg border border-eclipse-border dark:border-space-gray"
              >
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full p-4 text-left flex items-center justify-between text-eclipse-text-light dark:text-space-text hover:bg-eclipse-surface/50 dark:hover:bg-space-darker/50 transition-colors rounded-lg"
                >
                  <span className="font-medium">How to accept the certificate</span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ▼
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 text-sm text-eclipse-muted-light dark:text-space-muted">
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 bg-stellar-blue rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                          <p>When the new tab opens, you&apos;ll see a security warning</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 bg-stellar-orange rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                          <p>Click &quot;Advanced&quot; or &quot;Show Advanced&quot; options</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 bg-stellar-green rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                          <p>Click &quot;Proceed to [URL] (unsafe)&quot; or &quot;Accept Risk and Continue&quot;</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 bg-stellar-purple rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                          <p>Close that tab and return here to continue</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAlreadyDone}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-stellar-green to-stellar-blue text-white rounded-lg font-semibold hover:shadow-stellar-green-glow transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FaCheckCircle />
                  I&apos;ve Already Done This
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border-2 border-eclipse-border dark:border-space-gray text-eclipse-text-light dark:text-space-text rounded-lg font-semibold hover:bg-eclipse-surface dark:hover:bg-space-darker transition-all duration-300"
                >
                  Skip for Now
                </button>
              </div>

              {/* Additional Info */}
              <div className="text-xs text-eclipse-muted-light dark:text-space-muted text-center space-y-1">
                <p>This is a one-time setup. Your browser will remember this choice.</p>
                <p className="text-stellar-blue">🔒 This ensures secure communication with our servers</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

SSLWarningModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  backendUrl: PropTypes.string.isRequired,
};

export default SSLWarningModal;
