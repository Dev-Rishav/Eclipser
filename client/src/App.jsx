import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./Redux/store";
import Home from "./components/Home";
import Login from "./components/Login";
import PrivateRoute from "./Redux/PrivateRoute";
import Signup from "./components/Signup";
import AuthStatus from "./Redux/AuthStatus";

const App = () => {
  return (
    <Provider store={store}>
      <Router>
      <AuthStatus />
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
