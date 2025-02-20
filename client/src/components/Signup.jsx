import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";

const Signup = () => {
  const formRef = useRef(null);

  // useEffect(() => {
  //   gsap.from(formRef.current, { duration: 1, opacity: 0, x: -30, ease: "power3.out" });
  // }, []);

  return (
    <div className="login-container">
      <div className="eclipser-card">
        <h1 className="eclipser-title">ECLIPSER</h1>
        <h2 className="eclipser-subtitle">Join the Cosmos</h2>
        <form ref={formRef} className="eclipser-form">
          <input
            type="text"
            placeholder="Full Name"
            className="eclipser-input"
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="eclipser-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="eclipser-input"
            required
          />
          <button className="eclipser-button">
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