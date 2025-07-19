import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./Redux/store";
import PrivateRoute from "./Redux/PrivateRoute";
import { Toaster } from "react-hot-toast";
import PersistentLayout from "./components/PersistentLayout";
import { useState, useEffect } from "react";
import LoadingPage from "./components/LoadingPage";
import { ThemeProvider } from "./contexts/ThemeContext";
import LandingPage from "./pages/LandingPage.jsx";
import ConnectionDebugPanel from "./components/ConnectionDebugPanel.jsx";
import SSLWarningModal from "./components/SSLWarningModal.jsx";
import { API_CONFIG } from "./config/api.js";

const App = () => {
  const [isLoading, setIsLoading] = useState(false); // State to control loading screen
  const [showSSLWarning, setShowSSLWarning] = useState(false);

  // Check if SSL certificate has been accepted
  useEffect(() => {
    const sslAccepted = localStorage.getItem('ssl-certificate-accepted');
    if (!sslAccepted) {
      setShowSSLWarning(true);
    }
  }, []);

  const handleLoginToHome = (navigate) => {
    setIsLoading(true); // Show loading screen
    setTimeout(() => {
      setIsLoading(false); // Hide loading screen after 3 seconds
      navigate("/"); // Navigate to home
    }, 3000);
  };

  const handleCloseSSLWarning = () => {
    setShowSSLWarning(false);
  };


  return (
    <ThemeProvider>
      <Provider store={store}>
        <Router>
          <Toaster position="top-right" />
          {isLoading && <LoadingPage />}
          
          {/* SSL Warning Modal */}
          <SSLWarningModal 
            isOpen={showSSLWarning}
            onClose={handleCloseSSLWarning}
            backendUrl={API_CONFIG.BASE_URL}
          />
          
          <Routes>
            {/* Public routes without layout */}
            <Route path="/login" element={<LandingPage onLogin={(navigate)=> handleLoginToHome(navigate)} />} />
            {/* <Route path="/signup" element={<LandingPage />} /> */}
            
            {/* Private routes with persistent layout */}
            <Route element={<PrivateRoute />}>
              <Route path="/*" element={<PersistentLayout />} />
            </Route>
        </Routes>
        {/* Debug panel - only shows in development */}
        {import.meta.env.DEV && <ConnectionDebugPanel />}
      </Router>
    </Provider>
    </ThemeProvider>
  );
};


export default App;