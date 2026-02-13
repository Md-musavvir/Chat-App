import { useState } from "react";

import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function RegisterUser() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:9000/api/v1/user/register",
        {
          username: username.trim(),
          email: email.trim(),
          password,
        },
        { withCredentials: true },
      );

      setMessage(response.data.message);

      setUsername("");
      setEmail("");
      setPassword("");

      // Redirect after short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center px-4 py-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card with gradient border effect */}
        <div className="relative group">
          {/* Gradient glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 animate-pulse"></div>

          {/* Main card */}
          <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-800/50">
            {/* Header with gradient text */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2 animate-fade-in">
                Create Account
              </h2>
              <p className="text-slate-400 text-sm">
                Join us and start chatting!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username input */}
              <div className="group">
                <label className="block text-sm font-medium text-slate-300 mb-2 transition-colors group-focus-within:text-purple-400">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 text-white
                           placeholder-slate-500 border border-slate-700/50
                           focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500
                           transition-all duration-300 backdrop-blur-sm
                           hover:border-slate-600"
                  required
                />
              </div>

              {/* Email input */}
              <div className="group">
                <label className="block text-sm font-medium text-slate-300 mb-2 transition-colors group-focus-within:text-pink-400">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 text-white
                           placeholder-slate-500 border border-slate-700/50
                           focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500
                           transition-all duration-300 backdrop-blur-sm
                           hover:border-slate-600"
                  required
                />
              </div>

              {/* Password input */}
              <div className="group">
                <label className="block text-sm font-medium text-slate-300 mb-2 transition-colors group-focus-within:text-blue-400">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 text-white
                           placeholder-slate-500 border border-slate-700/50
                           focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
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
                  transition-all duration-300 transform
                  ${
                    loading
                      ? "bg-slate-700 cursor-not-allowed opacity-60"
                      : "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/50 active:scale-[0.98]"
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
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Success message */}
            {message && (
              <div className="mt-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm animate-fade-in">
                <p className="text-center text-emerald-400 font-medium flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {message}
                </p>
              </div>
            )}

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

            {/* Login link */}
            <div className="text-center mt-8 pt-6 border-t border-slate-800/50">
              <p className="text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-pink-300 transition-all duration-300"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterUser;
