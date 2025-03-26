import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./Redux/store";
import Home from "./pages/Home";
import Login from "./components/Login";
import PrivateRoute from "./Redux/PrivateRoute";
import Signup from "./components/Signup";
import { Toaster } from "react-hot-toast";
import { memo } from "react";
import PersistentLayout from "./components/PersistentLayout";
import Contest from "./components/Contest";

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes without layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Private routes with persistent layout */}
          <Route element={<PrivateRoute />}>
            <Route element={<PersistentLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/contest" element={<Contest />} />
              {/* Add other authenticated routes here */}
            </Route>
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
};


export default App;