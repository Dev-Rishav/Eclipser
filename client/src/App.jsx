import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./Redux/store";
import PrivateRoute from "./Redux/PrivateRoute";
import { Toaster } from "react-hot-toast";
import PersistentLayout from "./components/PersistentLayout";
import Contest from "./pages/Contest";
import Profile from "./pages/Profile";
import UnderConstruction from "./pages/UnderConstruction";
import { useState } from "react";
import LoadingPage from "./components/LoadingPage";
import Feed from "./components/newUI/Feed";
import { ThemeProvider } from "./contexts/ThemeContext";
import LandingPage from "./pages/LandingPage.jsx";
import ConnectionDebugPanel from "./components/ConnectionDebugPanel.jsx";

const App = () => {
  const [isLoading, setIsLoading] = useState(false); // State to control loading screen

  const handleLoginToHome = (navigate) => {
    setIsLoading(true); // Show loading screen
    setTimeout(() => {
      setIsLoading(false); // Hide loading screen after 3 seconds
      navigate("/"); // Navigate to home
    }, 3000);
  };


  return (
    <ThemeProvider>
      <Provider store={store}>
        <Router>
          <Toaster position="top-right" />
          {isLoading && <LoadingPage />}
          <Routes>
            {/* Public routes without layout */}
            <Route path="/login" element={<LandingPage onLogin={(navigate)=> handleLoginToHome(navigate)} />} />
            {/* <Route path="/signup" element={<LandingPage />} /> */}
            
            {/* Private routes with persistent layout */}
            <Route element={<PrivateRoute />}>
            <Route element={<PersistentLayout />}>
              <Route path="/" element={<Feed />} />
              <Route path="/contest" element={<Contest />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/topics" element={<UnderConstruction />} />
              <Route path="/discussions" element={<UnderConstruction />} />
              <Route path="/help" element={<UnderConstruction />} />
              <Route path="/leaderboard" element={<UnderConstruction />} />
              <Route path="/under-construction" element={<UnderConstruction />} />
              {/* <Route path="/posts" element={<PostList />} /> */}
              {/* Add other authenticated routes here */}
            </Route>
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