// src/utils/deploymentHelper.js
import { API_CONFIG } from '../config/api.js';

/**
 * Deployment and Environment Detection Utilities
 */

export const getDeploymentInfo = () => {
  const hostname = window.location.hostname;
  const origin = window.location.origin;
  const isDev = import.meta.env.DEV;
  const environment = import.meta.env.VITE_ENVIRONMENT;
  
  return {
    hostname,
    origin,
    isDev,
    environment,
    isVercel: hostname.includes('vercel.app') || hostname.includes('vercel.com'),
    isNetlify: hostname.includes('netlify.app') || hostname.includes('netlify.com'),
    isLocalhost: hostname === 'localhost' || hostname === '127.0.0.1',
    isProduction: environment === 'production' || !isDev,
  };
};

export const getCORSDebugInfo = () => {
  const deployment = getDeploymentInfo();
  const backendURL = API_CONFIG.BASE_URL;
  
  return {
    frontendOrigin: deployment.origin,
    backendURL,
    deployment,
    expectedCORSOrigin: deployment.origin,
    isOriginMismatchLikely: deployment.isVercel && backendURL.includes('13.204.53.103'),
  };
};

export const logCORSDebugInfo = () => {
  const debugInfo = getCORSDebugInfo();
  
  console.group('🔍 CORS Debug Information');
  console.log('Frontend Origin:', debugInfo.frontendOrigin);
  console.log('Backend URL:', debugInfo.backendURL);
  console.log('Deployment Type:', debugInfo.deployment.isVercel ? 'Vercel' : 
               debugInfo.deployment.isNetlify ? 'Netlify' :
               debugInfo.deployment.isLocalhost ? 'Localhost' : 'Other');
  console.log('Environment:', debugInfo.deployment.environment);
  
  if (debugInfo.isOriginMismatchLikely) {
    console.warn('⚠️ Origin mismatch likely! Your Vercel frontend origin:', debugInfo.frontendOrigin);
    console.warn('💡 Backend CORS needs to include this origin for SSE/API requests to work');
    console.warn('🛠️ Backend fix: Add CORS_ORIGIN=' + debugInfo.frontendOrigin + ' to backend .env');
  }
  
  console.groupEnd();
};

export const generateBackendCORSConfig = () => {
  const debugInfo = getCORSDebugInfo();
  
  const config = {
    envVars: `# Add to your backend .env file
CORS_ORIGIN=${debugInfo.frontendOrigin}
CLIENT_URL=${debugInfo.frontendOrigin}`,

    nodeJSCode: `// Backend CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  '${debugInfo.frontendOrigin}',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(\`🚫 CORS blocked origin: \${origin}\`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));`,

    curlTest: `# Test CORS with curl
curl -H "Origin: ${debugInfo.frontendOrigin}" \\
     -H "Access-Control-Request-Method: GET" \\
     -X OPTIONS \\
     "${debugInfo.backendURL}/api/notifications/stream"`,
  };

  return config;
};

// Auto-log debug info in development
if (import.meta.env.DEV) {
  logCORSDebugInfo();
}
