// src/utils/sslHelper.js
import { API_CONFIG } from '../config/api.js';

/**
 * SSL Certificate Helper Utilities
 */

export const checkSSLCertificate = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/health`, {
      method: 'GET',
      mode: 'cors',
    });
    return response.ok;
  } catch (error) {
    console.error('🔐 SSL Certificate Error:', error.message);
    return false;
  }
};

export const logSSLInstructions = () => {
  console.group('🔐 SSL Certificate Setup Required');
  console.log('Backend URL:', API_CONFIG.BASE_URL);
  console.log('Steps to resolve:');
  console.log('1. Open the backend URL in a new tab');
  console.log('2. Accept the SSL certificate warning');
  console.log('3. Refresh this page');
  console.log('4. The CORS error should be resolved');
  console.groupEnd();
};

export const isSSLAccepted = () => {
  return localStorage.getItem('ssl-certificate-accepted') === 'true';
};

export const markSSLAccepted = () => {
  localStorage.setItem('ssl-certificate-accepted', 'true');
};

export const resetSSLAccepted = () => {
  localStorage.removeItem('ssl-certificate-accepted');
};
