import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./Redux/store";
import Home from "./pages/Home";
import Login from "./components/Login";
import PrivateRoute from "./Redux/PrivateRoute";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Toaster/>
      <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />   
          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<Home />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
