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
    <Provider store={store}>
      <Router>
        <Toaster position="top-right" />
        {isLoading && <LoadingPage />}
        <Routes>
          {/* Public routes without layout */}
          <Route path="/login" element={<Login onLogin={(navigate)=> handleLoginToHome(navigate)} />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Private routes with persistent layout */}
          <Route element={<PrivateRoute />}>
            <Route element={<PersistentLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/contest" element={<Contest />} />
              <Route path="/profile" element={<Profile />} />
              {/* <Route path="/posts" element={<PostList />} /> */}
              {/* Add other authenticated routes here */}
            </Route>
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
};


export default App;