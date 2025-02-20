import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";
import { useNavigate} from "react-router-dom";


const Login = () => {
  const formRef = useRef(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate=useNavigate();

  // useEffect(() => {
  //   gsap.from(formRef.current, {
  //     duration: 0.6,
  //     opacity: 0,
  //     y: 20,
  //     ease: "power2.out"
  //   });
  // }, []);

  const handleSubmit = async (e) => {
    const id=4; //TODO handle id into the database
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/login", { id,username, password });
      console.log("Login successful:", response.data);
      navigate("/home");
    } catch (error) {
      console.error("Login failed:", error);
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="eclipser-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="eclipser-button" onClick={handleSubmit} >
            Continue
          </button>
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

export default Login;