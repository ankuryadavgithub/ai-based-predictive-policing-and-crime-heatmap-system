import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt } from "react-icons/fa";
import "./Login.css";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000/api";

function Login() {
  useEffect(() => {
    document.body.classList.add("log-body");
    return () => document.body.classList.remove("log-body");
  }, []);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", data.username);
        localStorage.setItem("token", "dummy-token"); // TODO: Replace with real JWT

        if (data.role === "police") navigate("/dashboard");
        else navigate("/heatmap");
      } else {
        setError(data.error || "Login failed. Try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="log-body">
    <div className="login-container">
      <h2><FaSignInAlt /> Login</h2>

      <form className="login-form" onSubmit={handleSubmit}>
        {/* Email Input */}
        <div className="input-group">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password Input */}
        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <span
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* Error Message */}
        {error && <p className="form-error">{error}</p>}

        {/* Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="register-redirect">
        Don’t have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
    </div>
  );
}

export default Login;
