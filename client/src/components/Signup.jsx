import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const formRef = useRef(null);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/api/auth/register", {
        email,
        username,
        password
      });
      console.log("Account creation successful" + response.data);
      navigate('/login');
    } catch (error) {
      console.error("Failure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cosmic via-stellar to-galaxy-purple p-4 relative overflow-hidden">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%22100%25%22%20height=%22100%25%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20fill=%22none%22/%3E%3Cg%20fill=%22%23FFFFFF%22%20opacity=%220.2%22%3E%3Ccircle%20cx=%2215%25%22%20cy=%2220%25%22%20r=%221%22/%3E%3Ccircle%20cx=%2285%25%22%20cy=%2265%25%22%20r=%221.5%22/%3E%3Ccircle%20cx=%2245%25%22%20cy=%2290%25%22%20r=%220.8%22/%3E%3C/g%3E%3C/svg%3E')]"></div>

      {/* Floating Card */}
      <div className="w-full max-w-md bg-gradient-to-br from-stellar/90 to-cosmic/90 rounded-xl p-8 border border-nebula/30 backdrop-blur-lg shadow-galaxy animate-float">
        {/* Animated Title */}
        <h1 className="text-4xl bg-gradient-to-r from-nebula to-supernova bg-clip-text text-transparent font-orbitron font-bold text-center mb-2 animate-pulse-slow">
          ECLIPSER
        </h1>

        <h2 className="text-xl text-stardust/80 text-center mb-6">
          Join the Cosmos
        </h2>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-3 bg-stellar rounded-lg border border-nebula/30 text-stardust placeholder-stardust/50 
                focus:outline-none focus:ring-2 focus:ring-supernova transition-all
                animate-glow-input"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 bg-stellar rounded-lg border border-nebula/30 text-stardust placeholder-stardust/50 
                focus:outline-none focus:ring-2 focus:ring-supernova transition-all
                animate-glow-input"
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 bg-stellar rounded-lg border border-nebula/30 text-stardust placeholder-stardust/50 
                focus:outline-none focus:ring-2 focus:ring-supernova transition-all
                animate-glow-input"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-nebula to-supernova text-cosmic font-semibold rounded-lg 
              hover:brightness-110 hover:scale-[1.02] transition-all 
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-glow hover:shadow-glow-intense"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-stardust/80 text-center mt-6">
          Already have an account?{" "}
          <Link 
            to="/login" 
            className="text-corona hover:text-supernova transition-colors font-semibold hover:underline"
          >
            Return to Orbit
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;