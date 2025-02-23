import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Home from './components/Home';
import Login from './components/Login';
import PrivateRoute from './Redux/PrivateRoute';
import Signup from './components/Signup';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<PrivateRoute component={Home} />} />
          {/* Add other private routes here */}
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;