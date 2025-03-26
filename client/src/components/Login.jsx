import React, { useEffect, useRef, useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { loginUser } from "../Redux/actions/authActions";
import { useDispatch,useSelector } from "react-redux";
import toast from "react-hot-toast";

const Login = () => {
  const dispatch=useDispatch();
  const {error,isAuthenticated,loading}=useSelector(state=>state.auth);
  const [user,setUser]=useState({
    email:'',
    password:''
  });
    const navigate=useNavigate();
  const formRef = useRef(null);



  useEffect(()=>{
    if(isAuthenticated)
        navigate("/home");
  },[isAuthenticated,navigate]);

  useEffect(() => {
    if(error){
        toast.error(error);
        console.error(error);
    }
}, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(loginUser(user));
      console.log(user);
      
      toast.success(`Welcome back, ${user.username}!`);
    } catch (error) {
      console.log(error);
    }
    }

  return (
    <div className="login-container">
      <div className="eclipser-card">
        <h1 className="eclipser-title">ECLIPSER</h1>
        <h2 className="eclipser-subtitle">Explore the Platform</h2>
        <form ref={formRef} className="eclipser-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="eclipser-input"
            value={user.email}
            onChange={(e) => setUser({...user, email: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="eclipser-input"
            value={user.password}
            onChange={(e) => setUser({...user, password :e.target.value})}
            required
          />
          <button type="submit" className="eclipser-button" disabled={loading} >
            {loading ? 'Loggin in...' : 'Login'}
          </button>
          {error && <div className="error">{error}</div>}
        </form>
        <p className="eclipser-footer">
          New user?{" "}
          <Link to="/signup" className="eclipser-link">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

// const mapStateToProps=(state)=>({
//   loading: state.auth.loading,
//   error: state.auth.error
// })

export default Login;