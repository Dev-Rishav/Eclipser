import React from 'react';
import { useSelector } from 'react-redux';

const Home = () => {
  const user = useSelector((state) =>state.auth.user);

  return (
    <div>
      <h1>Welcome, {user ? user.username : 'Guest'}!</h1>
      <p>Home</p>
    </div>
  );
};

export default Home;