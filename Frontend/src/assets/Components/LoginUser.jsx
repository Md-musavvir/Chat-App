import { useState } from "react";

import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function LoginUser({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:9000/api/v1/user/login",
        {
          email: email.trim(),
          password: password.trim(),
        },
        { withCredentials: true },
      );

      const { accessToken, refreshToken, user } = response.data.data;

      if (response.status === 200 && accessToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));

        setIsLoggedIn(true);
        navigate("/chat");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center px-4 py-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card with gradient border effect */}
        <div className="relative group">
          {/* Gradient glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 animate-pulse"></div>

          {/* Main card */}
          <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-800/50">
            {/* Header with gradient text */}
            <div className="text-center mb-8">
              <div className="mb-4">
                <span className="text-6xl">👋</span>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 animate-fade-in">
                Welcome Back
              </h2>
              <p className="text-slate-400 text-sm">
                Login to continue chatting
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email input */}
              <div className="group">
                <label className="block text-sm font-medium text-slate-300 mb-2 transition-colors group-focus-within:text-blue-400">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 text-white
                           placeholder-slate-500 border border-slate-700/50
                           focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                           transition-all duration-300 backdrop-blur-sm
                           hover:border-slate-600"
                  required
                />
              </div>

              {/* Password input */}
              <div className="group">
                <label className="block text-sm font-medium text-slate-300 mb-2 transition-colors group-focus-within:text-purple-400">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 text-white
                           placeholder-slate-500 border border-slate-700/50
                           focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500
                           transition-all duration-300 backdrop-blur-sm
                           hover:border-slate-600"
                  required
                />
              </div>

              {/* Submit button with gradient */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-semibold text-white text-lg
                  transition-all duration-300 transform mt-6
                  ${
                    loading
                      ? "bg-slate-700 cursor-not-allowed opacity-60"
                      : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/50 active:scale-[0.98]"
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Error message */}
            {error && (
              <div className="mt-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 backdrop-blur-sm animate-fade-in">
                <p className="text-center text-red-400 font-medium flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            {/* Register link */}
            <div className="text-center mt-8 pt-6 border-t border-slate-800/50">
              <p className="text-slate-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-300 transition-all duration-300"
                >
                  Click here to register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginUser;
