import { Link, useNavigate, useLocation } from "react-router-dom";
import "./login.css";
import { useState } from "react";

export const Login = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [error, setError] = useState<any>("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Basic validation for UI demonstration
    if (!userEmail || !userPassword) {
      setError("Please enter your email and password");
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userEmail,
          userPassword
        })
      });

      const jsondata = await response.json();
      console.log(jsondata);

      if (jsondata.error) {
        setError(jsondata.error);
        return;
      }

      localStorage.setItem("auth_token", jsondata.token);
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      console.log(err);
      setError(err);
      return;
    }
  }

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form className="login-form">
        {error && (
          <div className="inline-error">
            {error}
          </div>
        )}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={userEmail}
            onChange={(e) => { setUserEmail(e.target.value) }}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={userPassword}
            onChange={(e) => { setUserPassword(e.target.value) }}
            required
          />
        </div>
        <button
          type="submit"
          className="login-button"
          onClick={handleSubmit}
        >
          Login
        </button>
        <p className="auth-link">
          Don't have an account? <Link to="/auth/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};
