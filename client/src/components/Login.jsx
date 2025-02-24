import React, { useEffect, useRef, useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { loginUser } from "../Redux/actions/authActions";
import { connect,useSelector } from "react-redux";

const Login = ({loginUser, loading,error}) => {
  const [credentials,setCredentials]=useState({
    id:2,
    username:'',
    password:''
  });
    const navigate=useNavigate();
  const formRef = useRef(null);
  const {isAuthenticated}=useSelector(state=>state.auth);



  useEffect(()=>{
    if(isAuthenticated)
        navigate("/home");
  },[isAuthenticated,navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser(credentials);
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
            type="username"
            placeholder="Username"
            className="eclipser-input"
            value={credentials.username}
            onChange={(e) => setCredentials({...credentials,username: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="eclipser-input"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password :e.target.value})}
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

const mapStateToProps=(state)=>({
  loading: state.auth.loading,
  error: state.auth.error
})

export default connect(mapStateToProps,{ loginUser })(Login);