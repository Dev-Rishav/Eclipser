import React, { useEffect, useRef, useState } from "react";
// import { gsap } from "gsap";
import { Link,useNavigate } from "react-router-dom";
// import axios from "axios";
import "../styles/Login.css";
// import { useNavigate} from "react-router-dom";
// import {useDispatch} from "react-redux"
import { loginUser } from "../Redux/actions/authActions";
import { connect,useSelector } from "react-redux";

const Login = ({loginUser, loading,error}) => {
  const [credentials,setCredentials]=useState({
    id:5,
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

  // const [username, setUsername] = useState("");
  // const [password, setPassword] = useState("");

  // const dispatch=useDispatch();

  // useEffect(() => {
  //   gsap.from(formRef.current, {
  //     duration: 0.6,
  //     opacity:50,
  //     y: 0,
  //     ease: "power2.out"
  //   });
  // }, []);

  const handleSubmit = async (e) => {
    // const id=4; //TODO handle id into the database
    e.preventDefault();
    try {
      // const response = await axios.post("http://localhost:8080/login", { id,username, password });
      // console.log("Login successful:", response.data);
      // dispatch({type: 'Login', payload: {username}});
      // navigate("/home");
      await loginUser(credentials);

    } catch (error) {
      // console.error("Login failed:", error);
    }
  };

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