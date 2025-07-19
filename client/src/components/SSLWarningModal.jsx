import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShieldAlt, FaExternalLinkAlt, FaCheckCircle, FaExclamationTriangle, FaSpinner, FaCopy, FaCode } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { generateBackendCORSConfig, getCORSDebugInfo } from '../utils/deploymentHelper.js';

const SSLWarningModal = ({ isOpen, onClose, backendUrl }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState(null);
  const [showBackendConfig, setShowBackendConfig] = useState(false);

  const corsDebugInfo = getCORSDebugInfo();
  const backendConfig = generateBackendCORSConfig();

  const handleBackendUrlClick = () => {
    window.open(backendUrl, '_blank');
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionTestResult(null);

    try {
      // Try to make a simple request to the backend
      const response = await fetch(`${backendUrl}/api/health`, {
        method: 'GET',
        mode: 'cors',
      });

      if (response.ok) {
        setConnectionTestResult('success');
        // If connection works, mark SSL as accepted
        localStorage.setItem('ssl-certificate-accepted', 'true');
        setTimeout(() => onClose(), 2000);
      } else {
        setConnectionTestResult('failed');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionTestResult('failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleAlreadyDone = () => {
    localStorage.setItem('ssl-certificate-accepted', 'true');
    onClose();
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
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
                    Backend connection blocked by browser security
                  </p>
                  <p className="text-sm text-eclipse-muted-light dark:text-space-muted mb-2">
                    Our backend uses a custom SSL certificate for enhanced security. Your browser is blocking requests due to CORS policy until you trust this certificate.
                  </p>
                  
                  {/* Vercel-specific warning */}
                  {window.location.hostname.includes('vercel.app') && (
                    <div className="text-xs bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-blue-700 dark:text-blue-300 mb-2">
                      <strong>🚀 Vercel Deployment Detected:</strong> If the SSL certificate acceptance doesn&apos;t resolve the issue, the backend CORS configuration may need your Vercel URL added.
                    </div>
                  )}
                  
                  <div className="text-xs bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-300">
                    <strong>Error:</strong> Cross-Origin Request Blocked - CORS request did not succeed
                  </div>
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
                          <p>When the new tab opens, you&apos;ll see a security warning like &quot;Your connection is not private&quot;</p>
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
                          <p>You should see a JSON response or API data, confirming the connection works</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 bg-stellar-blue rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
                          <p>Close that tab and return here to continue using Eclipser</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Backend Configuration Section - Show if Vercel deployment detected */}
              {corsDebugInfo.isOriginMismatchLikely && (
                <motion.div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <button
                    onClick={() => setShowBackendConfig(!showBackendConfig)}
                    className="w-full p-4 text-left flex items-center justify-between text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors rounded-lg"
                  >
                    <span className="font-medium flex items-center gap-2">
                      <FaCode />
                      Backend CORS Configuration Needed
                    </span>
                    <motion.div
                      animate={{ rotate: showBackendConfig ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      ▼
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {showBackendConfig && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3 text-sm">
                          <p className="text-blue-600 dark:text-blue-400">
                            Your Vercel deployment origin (<strong>{corsDebugInfo.frontendOrigin}</strong>) needs to be added to the backend CORS configuration.
                          </p>
                          
                          <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 font-mono text-xs">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-600 dark:text-gray-400">Backend .env file:</span>
                              <button
                                onClick={() => copyToClipboard(backendConfig.envVars)}
                                className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 flex items-center gap-1"
                              >
                                <FaCopy size={10} />
                                Copy
                              </button>
                            </div>
                            <pre className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                              {backendConfig.envVars}
                            </pre>
                          </div>
                          
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            After updating your backend configuration, restart your EC2 server and try the connection test above.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

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
                  onClick={testConnection}
                  disabled={isTestingConnection}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-stellar-orange to-stellar-purple text-white rounded-lg font-semibold hover:shadow-stellar-orange-glow transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTestingConnection ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      🔧
                      Test Connection
                    </>
                  )}
                </button>
              </div>

              {/* Connection Test Result */}
              {connectionTestResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-center p-3 rounded-lg ${
                    connectionTestResult === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                  }`}
                >
                  {connectionTestResult === 'success' ? (
                    <div className="flex items-center justify-center gap-2">
                      <FaCheckCircle />
                      <span>✅ Connection successful! Closing modal...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <FaExclamationTriangle />
                      <span>❌ Connection failed. Please follow the manual steps above.</span>
                    </div>
                  )}
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
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
