import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserShield, FaEye, FaEyeSlash } from "react-icons/fa";
import "./Register.css";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000/api";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pwdVisible, setPwdVisible] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "user",
    department: "",
    badge_number: "",
    phone_number: "",
    security_question: "",
    security_answer: "",
    date_of_birth: "",
    address: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.status === 201) {
        navigate("/login");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-body">
    <div className="reg-wrapper">
      <div className="reg-glass">
        {/* Left Hero / Branding */}
        <div className="reg-hero">
          <div className="reg-brand">
            <FaUserShield size={48} />
            <h1>Secure Access</h1>
            <p>Join our Predictive Policing & Crime Heatmap System</p>
          </div>
        </div>

        {/* Register Form */}
        <div className="reg-form-container">
          <form onSubmit={handleSubmit} className="reg-form">
            <h2>Create Account</h2>

            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="e.g. johndoe"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="pwd-box">
                <input
                  type={pwdVisible ? "text" : "password"}
                  name="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setPwdVisible((v) => !v)}
                >
                  {pwdVisible ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                placeholder="Retype password"
                value={form.confirm_password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="user">Citizen / Researcher</option>
                <option value="police">Law-Enforcement Officer</option>
              </select>
            </div>

            {form.role === "police" && (
              <div className="police-extra">
                <div className="input-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    placeholder="e.g. LAPD"
                    value={form.department}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Badge Number</label>
                  <input
                    type="text"
                    name="badge_number"
                    placeholder="e.g. 123456"
                    value={form.badge_number}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                placeholder="+91 98765 43210"
                value={form.phone_number}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Security Question</label>
              <input
                type="text"
                name="security_question"
                placeholder="Mother's maiden name?"
                value={form.security_question}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Security Answer</label>
              <input
                type="text"
                name="security_answer"
                placeholder="Answer"
                value={form.security_answer}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                placeholder="123 Main St, City, State"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Securing your access…" : "Register"}
            </button>

            <p className="login-redirect">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}
