import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';


const PrivateRoute = () => {
  console.log("in private route");
  const { isAuthenticated } = useSelector(state => state.auth);
  
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;