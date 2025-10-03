import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000/api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "user",
    phone_number: "",
    department: "",
    badge_number: "",
    security_question: "",
    security_answer: "",
    date_of_birth: "",
    address: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <div className="register-container">
      <h2>Register</h2>
      <form className="register-form" onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <input type="password" name="confirm_password" placeholder="Confirm Password" onChange={handleChange} required />

        <select name="role" onChange={handleChange} value={form.role}>
          <option value="user">User</option>
          <option value="police">Police</option>
        </select>

        {form.role === "police" && (
          <div className="police-fields">
            <input type="text" name="department" placeholder="Department" onChange={handleChange} required />
            <input type="text" name="badge_number" placeholder="Badge Number" onChange={handleChange} required />
          </div>
        )}

        <input type="text" name="phone_number" placeholder="Phone Number" onChange={handleChange} />
        <input type="text" name="security_question" placeholder="Security Question" onChange={handleChange} />
        <input type="text" name="security_answer" placeholder="Security Answer" onChange={handleChange} />
        <input type="date" name="date_of_birth" placeholder="Date of Birth" onChange={handleChange} />
        <input type="text" name="address" placeholder="Address" onChange={handleChange} />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        {error && <p className="form-error">{error}</p>}

        <p className="login-redirect">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
