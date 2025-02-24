import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from './actions/authActions';
import { useNavigate } from 'react-router-dom';

const AuthStatus = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  return (
    <div>
      {isAuthenticated ? (
        <>
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <span>Please log in</span>
      )}
    </div>
  );
};

export default AuthStatus;