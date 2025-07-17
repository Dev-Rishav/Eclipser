import React, { useState, useEffect } from 'react';
import { FaGoogle, FaRocket, FaCode, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../../Redux/actions/authActions';
import toast from 'react-hot-toast';

const AuthSection = ({ onLogin }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, isAuthenticated, loading } = useSelector(state => state.auth);
  
  const [activeTab, setActiveTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Check if user prefers reduced motion for performance
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Check current theme - disable animations in light mode for better performance
  const isDarkMode = document.documentElement.classList.contains('dark');
  const shouldAnimate = isDarkMode && !prefersReducedMotion;

  // Handle authentication success
  useEffect(() => {
    if (isAuthenticated && onLogin) {
      onLogin(navigate);
    }
  }, [isAuthenticated, navigate, onLogin]);

  // Handle authentication errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      dispatch(loginUser({
        email: loginEmail,
        password: loginPassword
      }));
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      await dispatch(registerUser({
        username: signupName,
        email: signupEmail,
        password: signupPassword
      }));
      
      // Switch to login tab after successful registration
      setActiveTab('login');
      setLoginEmail(signupEmail); // Pre-fill email for convenience
      
      // Clear signup form
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  const handleGoogleAuth = () => {
    console.log('Google authentication attempted');
    // Add Google OAuth logic here
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: shouldAnimate ? 0.4 : 0.1,
        staggerChildren: shouldAnimate ? 0.1 : 0
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: shouldAnimate ? 0.3 : 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: shouldAnimate ? 0.4 : 0.1 }
    }
  };

  return (
    <section id="auth" className="py-8 sm:py-12 lg:py-20 px-4 relative">
      {/* Subtle blended background that complements SpaceBackground */}
      <div className="absolute inset-0 bg-gradient-to-br from-eclipse-surface/20 via-transparent to-eclipse-border/10 dark:from-space-darker/30 dark:via-transparent dark:to-space-dark/20 backdrop-blur-sm"></div>
      
      {/* Additional subtle overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-eclipse-light/5 via-transparent to-transparent dark:from-space-void/10 dark:via-transparent dark:to-transparent"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          variants={shouldAnimate ? containerVariants : {}}
          initial={shouldAnimate ? "hidden" : false}
          whileInView={shouldAnimate ? "visible" : {}}
          viewport={shouldAnimate ? { once: true, amount: 0.3 } : {}}
          className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center"
        >
          {/* Left Side - Marketing Content */}
          <motion.div 
            variants={shouldAnimate ? itemVariants : {}} 
            className="space-y-6 sm:space-y-8 text-center lg:text-left order-2 lg:order-1"
          >
            <div className="space-y-4 sm:space-y-6">
              <motion.h2 
                variants={shouldAnimate ? itemVariants : {}}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold"
              >
                <span className="bg-gradient-to-r from-stellar-blue via-stellar-purple to-stellar-blue bg-clip-text text-transparent">
                  Join the Eclipse
                </span>
                <br />
                <span className="text-space-text-primary dark:text-space-text-primary-dark">
                  Community
                </span>
              </motion.h2>
              
              <motion.p 
                variants={shouldAnimate ? itemVariants : {}}
                className="text-base sm:text-lg text-space-text-secondary dark:text-space-text-secondary-dark leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                Connect with thousands of developers, participate in coding contests, 
                and accelerate your programming journey in our vibrant community.
              </motion.p>
            </div>

            {/* Feature highlights */}
            <motion.div 
              variants={shouldAnimate ? itemVariants : {}} 
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
            >
              <motion.div 
                whileHover={shouldAnimate ? { scale: 1.05, y: -5 } : {}}
                whileTap={{ scale: 0.98 }}
                className="text-center p-4 rounded-xl bg-space-card-dark/30 dark:bg-space-card-light/20 backdrop-blur-sm border border-eclipse-600/20 dark:border-eclipse-400/20 cursor-pointer"
              >
                <FaRocket className="w-8 h-8 text-stellar-blue mx-auto mb-3" />
                <h3 className="font-semibold text-space-text-primary dark:text-space-text-primary-dark">Fast Setup</h3>
                <p className="text-sm text-space-text-muted dark:text-space-text-muted-dark">Get started in seconds</p>
              </motion.div>
              
              <motion.div 
                whileHover={shouldAnimate ? { scale: 1.05, y: -5 } : {}}
                whileTap={{ scale: 0.98 }}
                className="text-center p-4 rounded-xl bg-space-card-dark/30 dark:bg-space-card-light/20 backdrop-blur-sm border border-eclipse-600/20 dark:border-eclipse-400/20 cursor-pointer"
              >
                <FaCode className="w-8 h-8 text-stellar-orange mx-auto mb-3" />
                <h3 className="font-semibold text-space-text-primary dark:text-space-text-primary-dark">Code Together</h3>
                <p className="text-sm text-space-text-muted dark:text-space-text-muted-dark">Collaborative coding</p>
              </motion.div>
              
              <motion.div 
                whileHover={shouldAnimate ? { scale: 1.05, y: -5 } : {}}
                whileTap={{ scale: 0.98 }}
                className="text-center p-4 rounded-xl bg-space-card-dark/30 dark:bg-space-card-light/20 backdrop-blur-sm border border-eclipse-600/20 dark:border-eclipse-400/20 cursor-pointer"
              >
                <FaUsers className="w-8 h-8 text-stellar-green mx-auto mb-3" />
                <h3 className="font-semibold text-space-text-primary dark:text-space-text-primary-dark">Global Network</h3>
                <p className="text-sm text-space-text-muted dark:text-space-text-muted-dark">Connect worldwide</p>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={shouldAnimate ? itemVariants : {}}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-eclipse-600/30 dark:border-eclipse-400/30"
            >
              <div className="text-center">
                <motion.div 
                  initial={shouldAnimate ? { scale: 0 } : { scale: 1 }}
                  whileInView={shouldAnimate ? { scale: 1 } : { scale: 1 }}
                  transition={shouldAnimate ? { delay: 0.5, duration: 0.8, type: "spring" } : {}}
                  className="text-3xl font-bold text-stellar-blue"
                >
                  10K+
                </motion.div>
                <p className="text-space-text-muted dark:text-space-text-muted-dark">Developers</p>
              </div>
              <div className="text-center">
                <motion.div 
                  initial={shouldAnimate ? { scale: 0 } : { scale: 1 }}
                  whileInView={shouldAnimate ? { scale: 1 } : { scale: 1 }}
                  transition={shouldAnimate ? { delay: 0.7, duration: 0.8, type: "spring" } : {}}
                  className="text-3xl font-bold text-stellar-orange"
                >
                  500+
                </motion.div>
                <p className="text-space-text-muted dark:text-space-text-muted-dark">Contests</p>
              </div>
              <div className="text-center">
                <motion.div 
                  initial={shouldAnimate ? { scale: 0 } : { scale: 1 }}
                  whileInView={shouldAnimate ? { scale: 1 } : { scale: 1 }}
                  transition={shouldAnimate ? { delay: 0.9, duration: 0.8, type: "spring" } : {}}
                  className="text-3xl font-bold text-stellar-green"
                >
                  50K+
                </motion.div>
                <p className="text-space-text-muted dark:text-space-text-muted-dark">Solutions</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div 
            variants={shouldAnimate ? cardVariants : {}} 
            className="w-full max-w-md mx-auto order-1 lg:order-2"
          >
            <div className="bg-space-card-dark/80 dark:bg-space-card-light/80 backdrop-blur-md rounded-2xl shadow-2xl border border-eclipse-600/50 dark:border-eclipse-400/50 overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex border-b border-eclipse-600/50 dark:border-eclipse-400/50">
                <button 
                  className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 font-medium transition-all duration-300 text-sm sm:text-base ${
                    activeTab === 'login' 
                      ? 'text-stellar-blue border-b-2 border-stellar-blue bg-eclipse-800/20 dark:bg-eclipse-200/20' 
                      : 'text-space-text-muted hover:text-space-text-primary dark:text-space-text-muted-dark dark:hover:text-space-text-primary-dark hover:bg-eclipse-800/10 dark:hover:bg-eclipse-200/10'
                  }`}
                  onClick={() => setActiveTab('login')}
                >
                  Login
                </button>
                <button 
                  className={`flex-1 py-4 px-6 font-medium transition-all duration-300 ${
                    activeTab === 'signup' 
                      ? 'text-stellar-blue border-b-2 border-stellar-blue bg-eclipse-800/20 dark:bg-eclipse-200/20' 
                      : 'text-space-text-muted hover:text-space-text-primary dark:text-space-text-muted-dark dark:hover:text-space-text-primary-dark hover:bg-eclipse-800/10 dark:hover:bg-eclipse-200/10'
                  }`}
                  onClick={() => setActiveTab('signup')}
                >
                  Sign Up
                </button>
              </div>

              <div className="p-8">
                <motion.div
                  key={activeTab}
                  initial={shouldAnimate ? { opacity: 0 } : { opacity: 1 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: shouldAnimate ? 0.2 : 0 }}
                >
                  {activeTab === 'login' && (
                    <div>
                      <h2 className="text-2xl font-bold text-center mb-6 text-stellar-blue">
                        Welcome Back
                      </h2>
                      
                      <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-space-text-secondary dark:text-space-text-secondary-dark mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-space-darker border border-eclipse-border dark:border-space-gray rounded-lg text-eclipse-text-dark dark:text-space-text focus:ring-2 focus:ring-stellar-blue focus:border-stellar-blue transition-all duration-300 placeholder:text-eclipse-muted dark:placeholder:text-space-muted"
                            placeholder="Enter your email"
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label htmlFor="password" className="block text-sm font-medium text-space-text-secondary dark:text-space-text-secondary-dark">
                              Password
                            </label>
                            <a href="#" className="text-xs text-stellar-blue hover:text-stellar-orange transition-colors">
                              Forgot password?
                            </a>
                          </div>
                          <input
                            type="password"
                            id="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-space-darker border border-eclipse-border dark:border-space-gray rounded-lg text-eclipse-text-dark dark:text-space-text focus:ring-2 focus:ring-stellar-blue focus:border-stellar-blue transition-all duration-300 placeholder:text-eclipse-muted dark:placeholder:text-space-muted"
                            placeholder="Enter your password"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 bg-gradient-to-r from-stellar-blue to-stellar-purple text-white rounded-lg font-medium hover:from-stellar-purple hover:to-stellar-blue transition-all duration-300 shadow-lg hover:shadow-stellar-blue/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                        >
                          {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                      </form>

                      <div className="mt-6">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-eclipse-600 dark:border-eclipse-400"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white dark:bg-space-darker text-space-text-muted dark:text-space-text-muted-dark">
                              Or continue with
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handleGoogleAuth}
                          className="mt-4 w-full flex items-center justify-center px-4 py-3 border border-eclipse-border dark:border-space-gray rounded-lg text-eclipse-text-dark dark:text-space-text bg-white dark:bg-space-darker hover:bg-eclipse-surface dark:hover:bg-space-dark transition-all duration-300 hover:scale-105"
                        >
                          <FaGoogle className="w-5 h-5 text-stellar-orange mr-2" />
                          Continue with Google
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'signup' && (
                    <div>
                      <h2 className="text-2xl font-bold text-center mb-6 text-stellar-blue">
                        Create Account
                      </h2>
                      
                      <form onSubmit={handleSignup} className="space-y-6">
                        <motion.div
                          initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: shouldAnimate ? 0.1 : 0 }}
                        >
                          <label htmlFor="name" className="block text-sm font-medium text-space-text-secondary dark:text-space-text-secondary-dark mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-space-darker border border-eclipse-border dark:border-space-gray rounded-lg text-eclipse-text-dark dark:text-space-text focus:ring-2 focus:ring-stellar-blue focus:border-stellar-blue transition-all duration-300 placeholder:text-eclipse-muted dark:placeholder:text-space-muted"
                            placeholder="Enter your full name"
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: shouldAnimate ? 0.2 : 0 }}
                        >
                          <label htmlFor="signup-email" className="block text-sm font-medium text-space-text-secondary dark:text-space-text-secondary-dark mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            id="signup-email"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-space-darker border border-eclipse-border dark:border-space-gray rounded-lg text-eclipse-text-dark dark:text-space-text focus:ring-2 focus:ring-stellar-blue focus:border-stellar-blue transition-all duration-300 placeholder:text-eclipse-muted dark:placeholder:text-space-muted"
                            placeholder="Enter your email"
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: shouldAnimate ? 0.3 : 0 }}
                        >
                          <label htmlFor="signup-password" className="block text-sm font-medium text-space-text-secondary dark:text-space-text-secondary-dark mb-2">
                            Password
                          </label>
                          <input
                            type="password"
                            id="signup-password"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-space-darker border border-eclipse-border dark:border-space-gray rounded-lg text-eclipse-text-dark dark:text-space-text focus:ring-2 focus:ring-stellar-blue focus:border-stellar-blue transition-all duration-300 placeholder:text-eclipse-muted dark:placeholder:text-space-muted"
                            placeholder="Create a password"
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: shouldAnimate ? 0.4 : 0 }}
                        >
                          <label htmlFor="confirm-password" className="block text-sm font-medium text-space-text-secondary dark:text-space-text-secondary-dark mb-2">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            id="confirm-password"
                            value={signupConfirmPassword}
                            onChange={(e) => setSignupConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-space-darker border border-eclipse-border dark:border-space-gray rounded-lg text-eclipse-text-dark dark:text-space-text focus:ring-2 focus:ring-stellar-blue focus:border-stellar-blue transition-all duration-300 placeholder:text-eclipse-muted dark:placeholder:text-space-muted"
                            placeholder="Confirm your password"
                          />
                        </motion.div>

                        <motion.button
                          initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: shouldAnimate ? 0.5 : 0 }}
                          whileHover={shouldAnimate ? { scale: 1.02 } : {}}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 bg-gradient-to-r from-stellar-blue to-stellar-purple text-white rounded-lg font-medium hover:from-stellar-purple hover:to-stellar-blue transition-all duration-300 shadow-lg hover:shadow-stellar-blue/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Creating Account...' : 'Create Account'}
                        </motion.button>
                      </form>

                      <motion.div 
                        initial={shouldAnimate ? { opacity: 0 } : { opacity: 1 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: shouldAnimate ? 0.6 : 0 }}
                        className="mt-6"
                      >
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-eclipse-600 dark:border-eclipse-400"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white dark:bg-space-darker text-space-text-muted dark:text-space-text-muted-dark">
                              Or continue with
                            </span>
                          </div>
                        </div>

                        <motion.button
                          whileHover={shouldAnimate ? { scale: 1.02 } : {}}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleGoogleAuth}
                          className="mt-4 w-full flex items-center justify-center px-4 py-3 border border-eclipse-border dark:border-space-gray rounded-lg text-eclipse-text-dark dark:text-space-text bg-white dark:bg-space-darker hover:bg-eclipse-surface dark:hover:bg-space-dark transition-all duration-300"
                        >
                          <FaGoogle className="w-5 h-5 text-stellar-orange mr-2" />
                          Continue with Google
                        </motion.button>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AuthSection;
