// Environment validation component
import { useEffect, useState } from 'react';
import { API_CONFIG } from '../config/api';

const EnvironmentValidator = ({ children }) => {
  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const validateEnvironment = () => {
      const validationErrors = [];

      // Check if all required environment variables are set
      if (!API_CONFIG.BASE_URL) {
        validationErrors.push('VITE_API_URL is not configured');
      }
      if (!API_CONFIG.SOCKET_URL) {
        validationErrors.push('VITE_SOCKET_URL is not configured');
      }
      if (!API_CONFIG.CONTEST_BASE_URL) {
        validationErrors.push('VITE_CONTEST_API_URL is not configured');
      }
      if (!API_CONFIG.ENVIRONMENT) {
        validationErrors.push('VITE_ENVIRONMENT is not configured');
      }

      // Validate URL format
      try {
        new URL(API_CONFIG.BASE_URL);
        new URL(API_CONFIG.SOCKET_URL);
        new URL(API_CONFIG.CONTEST_BASE_URL);
      } catch (error) {
        validationErrors.push('Invalid URL format in environment variables');
      }

      setErrors(validationErrors);
      setIsValid(validationErrors.length === 0);
    };

    validateEnvironment();
  }, []);

  if (!isValid) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-red-600 text-center mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h2 className="text-xl font-bold text-red-800 mb-2">
              ❌ Environment Configuration Error
            </h2>
          </div>
          
          <div className="space-y-2 mb-4">
            <p className="text-gray-700 text-sm">
              The following environment variables are missing or invalid:
            </p>
            <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-100 rounded p-3 text-xs">
            <p className="font-semibold mb-2">Required Environment Variables:</p>
            <ul className="space-y-1 text-gray-600">
              <li>• VITE_API_URL (Backend API URL)</li>
              <li>• VITE_SOCKET_URL (WebSocket URL)</li>
              <li>• VITE_CONTEST_API_URL (Contest API URL)</li>
              <li>• VITE_ENVIRONMENT (dev/prod)</li>
            </ul>
            <p className="mt-2 text-gray-500">
              Current Environment: {API_CONFIG.ENVIRONMENT || 'Not Set'}
            </p>
          </div>

          <div className="mt-4 text-center">
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default EnvironmentValidator;
