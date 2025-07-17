import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./Redux/store";
import Home from "./pages/Home";
import Login from "./components/Login";
import PrivateRoute from "./Redux/PrivateRoute";
import Signup from "./components/Signup";
import { Toaster } from "react-hot-toast";
import PersistentLayout from "./components/PersistentLayout";
import Contest from "./pages/Contest";
import Profile from "./pages/Profile";
import { useState } from "react";
import LoadingPage from "./components/LoadingPage";
import Feed from "./components/newUI/Feed";
import { ThemeProvider } from "./contexts/ThemeContext";
import LandingPage from "./pages/LandingPage.jsx";

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
            <Route path="/login" element={<Login onLogin={(navigate)=> handleLoginToHome(navigate)} />} />
            <Route path="/signup" element={<LandingPage />} />
            
            {/* Private routes with persistent layout */}
            <Route element={<PrivateRoute />}>
            <Route element={<PersistentLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/contest" element={<Contest />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/feed" element={<Feed />} />
              {/* <Route path="/posts" element={<PostList />} /> */}
              {/* Add other authenticated routes here */}
            </Route>
          </Route>
        </Routes>
      </Router>
    </Provider>
    </ThemeProvider>
  );
};


export default App;