import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Modal from './Modal/Modal';

const PrivateRoute = ({ component: Component }) => {
  const isAuthenticated = useSelector((state) => state.isAuthenticated);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
      }, 3000); // Hide the modal after 3 seconds
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <>
        <Modal show={showModal} message="You need to login to access this page." />
        <Navigate to="/login" />
      </>
    );
  }

  return <Component />;
};

export default PrivateRoute;