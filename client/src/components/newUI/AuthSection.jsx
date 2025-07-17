import React, { useState } from 'react';
import { FaGoogle, FaRocket, FaCode, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AuthSection = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Login attempted with:', { loginEmail, loginPassword });
    // Add actual login logic here
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Signup attempted with:', { signupName, signupEmail, signupPassword });
    // Add actual signup logic here
  };

  const handleGoogleAuth = () => {
    console.log('Google authentication attempted');
    // Add Google OAuth logic here
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <section id="auth" className="py-20 px-4 bg-gradient-to-br from-eclipse-surface/50 dark:from-space-darker/50 to-eclipse-border/30 dark:to-space-dark/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left Side - Marketing Content */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="space-y-6">
              <motion.h2 
                variants={itemVariants}
                className="text-4xl lg:text-5xl font-bold"
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
                variants={itemVariants}
                className="text-lg text-space-text-secondary dark:text-space-text-secondary-dark leading-relaxed"
              >
                Connect with thousands of developers, participate in coding contests, 
                and accelerate your programming journey in our vibrant community.
              </motion.p>
            </div>

            {/* Feature highlights */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-4 rounded-xl bg-space-card-dark/50 dark:bg-space-card-light/10 border border-eclipse-600/30 dark:border-eclipse-400/30"
              >
                <FaRocket className="w-8 h-8 text-stellar-blue mx-auto mb-3" />
                <h3 className="font-semibold text-space-text-primary dark:text-space-text-primary-dark">Fast Setup</h3>
                <p className="text-sm text-space-text-muted dark:text-space-text-muted-dark">Get started in seconds</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-4 rounded-xl bg-space-card-dark/50 dark:bg-space-card-light/10 border border-eclipse-600/30 dark:border-eclipse-400/30"
              >
                <FaCode className="w-8 h-8 text-stellar-orange mx-auto mb-3" />
                <h3 className="font-semibold text-space-text-primary dark:text-space-text-primary-dark">Code Together</h3>
                <p className="text-sm text-space-text-muted dark:text-space-text-muted-dark">Collaborative coding</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-4 rounded-xl bg-space-card-dark/50 dark:bg-space-card-light/10 border border-eclipse-600/30 dark:border-eclipse-400/30"
              >
                <FaUsers className="w-8 h-8 text-stellar-green mx-auto mb-3" />
                <h3 className="font-semibold text-space-text-primary dark:text-space-text-primary-dark">Global Network</h3>
                <p className="text-sm text-space-text-muted dark:text-space-text-muted-dark">Connect worldwide</p>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-eclipse-600/30 dark:border-eclipse-400/30"
            >
              <div className="text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                  className="text-3xl font-bold text-stellar-blue"
                >
                  10K+
                </motion.div>
                <p className="text-space-text-muted dark:text-space-text-muted-dark">Developers</p>
              </div>
              <div className="text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.8, type: "spring" }}
                  className="text-3xl font-bold text-stellar-orange"
                >
                  500+
                </motion.div>
                <p className="text-space-text-muted dark:text-space-text-muted-dark">Contests</p>
              </div>
              <div className="text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.8, type: "spring" }}
                  className="text-3xl font-bold text-stellar-green"
                >
                  50K+
                </motion.div>
                <p className="text-space-text-muted dark:text-space-text-muted-dark">Solutions</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div variants={cardVariants} className="w-full max-w-md mx-auto">
            <div className="bg-space-card-dark dark:bg-space-card-light rounded-2xl shadow-2xl border border-eclipse-600 dark:border-eclipse-400 overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex border-b border-eclipse-600 dark:border-eclipse-400">
                <button 
                  className={`flex-1 py-4 px-6 font-medium transition-all duration-300 ${
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
                  initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'login' && (
                    <div>
                      <h2 className="text-2xl font-bold text-center mb-6 text-stellar-blue">
                        Welcome Back
                      </h2>
                      
                      <form onSubmit={handleLogin} className="space-y-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <label htmlFor="email" className="block text-sm font-medium text-space-text-secondary dark:text-space-text-secondary-dark mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-eclipse-800 dark:bg-eclipse-200 border border-eclipse-600 dark:border-eclipse-400 rounded-lg text-space-text-primary dark:text-space-text-primary-dark focus:ring-2 focus:ring-stellar-blue focus:border-transparent transition-all duration-300"
                            placeholder="Enter your email"
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
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
                            className="w-full px-4 py-3 bg-eclipse-800 dark:bg-eclipse-200 border border-eclipse-600 dark:border-eclipse-400 rounded-lg text-space-text-primary dark:text-space-text-primary-dark focus:ring-2 focus:ring-stellar-blue focus:border-transparent transition-all duration-300"
                            placeholder="Enter your password"
                          />
                        </motion.div>

                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          className="w-full py-3 bg-gradient-to-r from-stellar-blue to-stellar-purple text-white rounded-lg font-medium hover:from-stellar-purple hover:to-stellar-blue transition-all duration-300 shadow-lg hover:shadow-stellar-blue/30"
                        >
                          Sign In
                        </motion.button>
                      </form>

                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-6"
                      >
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-eclipse-600 dark:border-eclipse-400"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-space-card-dark dark:bg-space-card-light text-space-text-muted dark:text-space-text-muted-dark">
                              Or continue with
                            </span>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleGoogleAuth}
                          className="mt-4 w-full flex items-center justify-center px-4 py-3 border border-eclipse-600 dark:border-eclipse-400 rounded-lg text-space-text-secondary dark:text-space-text-secondary-dark bg-space-card-dark dark:bg-space-card-light hover:bg-eclipse-800 dark:hover:bg-eclipse-200 transition-all duration-300"
                        >
                          <FaGoogle className="w-5 h-5 text-stellar-orange mr-2" />
                          Continue with Google
                        </motion.button>
                      </motion.div>
                    </div>
                  )}

                  {activeTab === 'signup' && (
                    <div>
                      <h2 className="text-2xl font-bold text-center mb-6 text-stellar-blue">
                        Create Account
                      </h2>
                      
                      <form onSubmit={handleSignup} className="space-y-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
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
                            className="w-full px-4 py-3 bg-eclipse-800 dark:bg-eclipse-200 border border-eclipse-600 dark:border-eclipse-400 rounded-lg text-space-text-primary dark:text-space-text-primary-dark focus:ring-2 focus:ring-stellar-blue focus:border-transparent transition-all duration-300"
                            placeholder="Enter your full name"
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
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
                            className="w-full px-4 py-3 bg-eclipse-800 dark:bg-eclipse-200 border border-eclipse-600 dark:border-eclipse-400 rounded-lg text-space-text-primary dark:text-space-text-primary-dark focus:ring-2 focus:ring-stellar-blue focus:border-transparent transition-all duration-300"
                            placeholder="Enter your email"
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
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
                            className="w-full px-4 py-3 bg-eclipse-800 dark:bg-eclipse-200 border border-eclipse-600 dark:border-eclipse-400 rounded-lg text-space-text-primary dark:text-space-text-primary-dark focus:ring-2 focus:ring-stellar-blue focus:border-transparent transition-all duration-300"
                            placeholder="Create a password"
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
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
                            className="w-full px-4 py-3 bg-eclipse-800 dark:bg-eclipse-200 border border-eclipse-600 dark:border-eclipse-400 rounded-lg text-space-text-primary dark:text-space-text-primary-dark focus:ring-2 focus:ring-stellar-blue focus:border-transparent transition-all duration-300"
                            placeholder="Confirm your password"
                          />
                        </motion.div>

                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          className="w-full py-3 bg-gradient-to-r from-stellar-blue to-stellar-purple text-white rounded-lg font-medium hover:from-stellar-purple hover:to-stellar-blue transition-all duration-300 shadow-lg hover:shadow-stellar-blue/30"
                        >
                          Create Account
                        </motion.button>
                      </form>

                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-6"
                      >
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-eclipse-600 dark:border-eclipse-400"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-space-card-dark dark:bg-space-card-light text-space-text-muted dark:text-space-text-muted-dark">
                              Or continue with
                            </span>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleGoogleAuth}
                          className="mt-4 w-full flex items-center justify-center px-4 py-3 border border-eclipse-600 dark:border-eclipse-400 rounded-lg text-space-text-secondary dark:text-space-text-secondary-dark bg-space-card-dark dark:bg-space-card-light hover:bg-eclipse-800 dark:hover:bg-eclipse-200 transition-all duration-300"
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
