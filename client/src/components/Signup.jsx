import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";


const Signup = () => {
  const formRef = useRef(null);
  const navigate=useNavigate();
  const [email,setEmail] =useState("")
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("")


  const handleSubmit=async( e)=>{
    e.preventDefault();
    try {
      const response=await axios.post("http://localhost:3000/api/auth/register",{email,username,password});
      console.log("Account creation successful"+response.data);
      navigate('/login');
    } catch (error) {
      console.error("Failure");
    }
  };

  return (
    <div className="login-container">
      <div className="eclipser-card">
        <h1 className="eclipser-title">ECLIPSER</h1>
        <h2 className="eclipser-subtitle">Join the Cosmos</h2>
        <form ref={formRef} className="eclipser-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            className="eclipser-input"
            onChange={(e)=>setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="eclipser-input"
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="eclipser-input"
            onChange={(e)=> setPassword(e.target.value)}
            required
          />
          <button className="eclipser-button" onClick={handleSubmit}>
            Create Account
          </button>
        </form>
        <p className="eclipser-footer">
          Already have an account?{" "}
          <Link to="/login" className="eclipser-link">
            Return to Orbit
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;