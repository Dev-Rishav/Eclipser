import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../Redux/actions/authActions";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

const Login = ({onLogin}) => {
  const dispatch = useDispatch();
  const { error, isAuthenticated, loading } = useSelector(state => state.auth);
  const [user, setUser] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) onLogin(navigate);
  }, [isAuthenticated, navigate,onLogin]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      console.error(error);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(loginUser(user));
    } catch (error) {
      console.log(error);
    }
  }

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
          Explore the Platform
        </h2>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 bg-stellar rounded-lg border border-nebula/30 text-stardust placeholder-stardust/50 
                focus:outline-none focus:ring-2 focus:ring-supernova transition-all
                animate-glow-input"
              value={user.email}
              onChange={(e) => setUser({...user, email: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 bg-stellar rounded-lg border border-nebula/30 text-stardust placeholder-stardust/50 
                focus:outline-none focus:ring-2 focus:ring-supernova transition-all
                animate-glow-input"
              value={user.password}
              onChange={(e) => setUser({...user, password: e.target.value})}
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
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {error && (
            <div className="text-center text-supernova text-sm mt-2 animate-pulse-fast">
              {error}
            </div>
          )}
        </form>

        <p className="text-stardust/80 text-center mt-6">
          New user?{" "}
          <Link 
            to="/signup" 
            className="text-corona hover:text-supernova transition-colors font-semibold hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;