// src/utils/corsHelper.js
import { generateBackendCORSConfig } from './deploymentHelper.js';

/**
 * CORS Configuration Helper for Developers
 * Run these commands in the browser console for backend config
 */

// Make these functions available globally in development
if (import.meta.env.DEV) {
  window.eclipserDebug = {
    getCORSConfig: () => {
      const config = generateBackendCORSConfig();
      
      console.group('🛠️ Backend CORS Configuration');
      console.log('\n📝 Add to your backend .env file:');
      console.log(config.envVars);
      
      console.log('\n💻 Node.js CORS code:');
      console.log(config.nodeJSCode);
      
      console.log('\n🧪 Test with curl:');
      console.log(config.curlTest);
      console.groupEnd();
      
      return config;
    },
    
    copyEnvVars: () => {
      const config = generateBackendCORSConfig();
      navigator.clipboard.writeText(config.envVars);
      console.log('✅ Environment variables copied to clipboard!');
      return config.envVars;
    },
    
    copyCORSCode: () => {
      const config = generateBackendCORSConfig();
      navigator.clipboard.writeText(config.nodeJSCode);
      console.log('✅ CORS configuration code copied to clipboard!');
      return config.nodeJSCode;
    }
  };

  console.log('🚀 Eclipser Debug Tools Available:');
  console.log('   eclipserDebug.getCORSConfig() - Show CORS configuration');
  console.log('   eclipserDebug.copyEnvVars() - Copy env vars to clipboard');
  console.log('   eclipserDebug.copyCORSCode() - Copy CORS code to clipboard');
}
