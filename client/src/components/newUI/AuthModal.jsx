import React, { useState, useEffect } from 'react';
import { FaGoogle, FaTimes } from 'react-icons/fa';

const AuthModal = ({ isOpen, onClose, activeTab, setActiveTab }) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-space-card-dark dark:bg-space-card-light rounded-xl shadow-2xl max-w-md w-full relative border border-eclipse-600 dark:border-eclipse-400 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-space-text-muted hover:text-space-text-primary dark:text-space-text-muted-dark dark:hover:text-space-text-primary-dark transition"
        >
          <FaTimes size={20} />
        </button>
        
        <div className="flex border-b border-eclipse-600 dark:border-eclipse-400">
          <button 
            className={`flex-1 py-4 font-medium transition \${
              activeTab === 'login' 
                ? 'text-stellar-blue border-b-2 border-stellar-blue' 
                : 'text-space-text-muted hover:text-space-text-primary dark:text-space-text-muted-dark dark:hover:text-space-text-primary-dark'
            }`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button 
            className={`flex-1 py-4 font-medium transition \${
              activeTab === 'signup' 
                ? 'text-stellar-blue border-b-2 border-stellar-blue' 
                : 'text-space-text-muted hover:text-space-text-primary dark:text-space-text-muted-dark dark:hover:text-space-text-primary-dark'
            }`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'login' && (
            <div>
              <h2 className="text-2xl font-bold text-center mb-6 text-stellar-blue">
                Welcome Back
              </h2>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-space-text-secondary dark:text-space-text-secondary-dark mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-eclipse-800 dark:bg-eclipse-200 border border-eclipse-600 dark:border-eclipse-400 rounded-lg text-space-text-primary dark:text-space-text-primary-dark focus:ring-2 focus:ring-stellar-blue focus:border-transparent"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-space-text-secondary dark:text-space-text-secondary-dark">
                      Password
                    </label>
                    <a href="#" className="text-xs text-stellar-blue hover:text-stellar-orange">
                      Forgot password?
                    </a>
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-eclipse-800 dark:bg-eclipse-200 border border-eclipse-600 dark:border-eclipse-400 rounded-lg text-space-text-primary dark:text-space-text-primary-dark focus:ring-2 focus:ring-stellar-blue focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-stellar-blue to-stellar-purple text-white rounded-lg font-medium hover:from-stellar-purple hover:to-stellar-blue transition shadow-lg hover:shadow-stellar-blue/30"
                >
                  Sign In
                </button>
              </form>

              <div className="mt-6">
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

                <button
                  onClick={handleGoogleAuth}
                  className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-eclipse-600 dark:border-eclipse-400 rounded-lg text-space-text-secondary dark:text-space-text-secondary-dark bg-space-card-dark dark:bg-space-card-light hover:bg-eclipse-800 dark:hover:bg-eclipse-200 transition"
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
              
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-space-text-secondary dark:text-space-text-secondary-dark mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-eclipse-800 dark:bg-eclipse-200 border border-eclipse-600 dark:border-eclipse-400 rounded-lg text-space-text-primary dark:text-space-text-primary-dark focus:ring-2 focus:ring-stellar-blue focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="signup-email" className="block text-sm font-medium text-space-text-secondary dark:text-space-text-secondary-dark mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="signup-email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-eclipse-800 dark:bg-eclipse-200 border border-eclipse-600 dark:border-eclipse-400 rounded-lg text-space-text-primary dark:text-space-text-primary-dark focus:ring-2 focus:ring-stellar-blue focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="signup-password" className="block text-sm font-medium text-space-text-secondary dark:text-space-text-secondary-dark mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="signup-password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-eclipse-800 dark:bg-eclipse-200 border border-eclipse-600 dark:border-eclipse-400 rounded-lg text-space-text-primary dark:text-space-text-primary-dark focus:ring-2 focus:ring-stellar-blue focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-space-text-secondary dark:text-space-text-secondary-dark mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-eclipse-800 dark:bg-eclipse-200 border border-eclipse-600 dark:border-eclipse-400 rounded-lg text-space-text-primary dark:text-space-text-primary-dark focus:ring-2 focus:ring-stellar-blue focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-stellar-blue to-stellar-purple text-white rounded-lg font-medium hover:from-stellar-purple hover:to-stellar-blue transition shadow-lg hover:shadow-stellar-blue/30"
                >
                  Create Account
                </button>
              </form>

              <div className="mt-6">
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

                <button
                  onClick={handleGoogleAuth}
                  className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-eclipse-600 dark:border-eclipse-400 rounded-lg text-space-text-secondary dark:text-space-text-secondary-dark bg-space-card-dark dark:bg-space-card-light hover:bg-eclipse-800 dark:hover:bg-eclipse-200 transition"
                >
                  <FaGoogle className="w-5 h-5 text-stellar-orange mr-2" />
                  Continue with Google
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
