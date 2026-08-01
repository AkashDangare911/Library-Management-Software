import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { handleErrors } from "../validateFormErrors";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";
import "../Login/login.css"; // Reuse the login styles for the register form

export const Register = () => {
  const { addToast } = useToast();
  const { login } = useAuth();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value);
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setUserEmail(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setUserPassword(e.target.value);
  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevents page reload on form submit

    const error = handleErrors(userEmail, userPassword, userName);
    if (error) {
      setError(error);
      return;
    } else {
      setError("");
    }

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userName, userEmail, userPassword })
      });

      const jsondata = await response.json();
      console.log(jsondata);

      if (jsondata.error) {
        setError(jsondata.error);
        addToast(jsondata.error, "error");
        console.log(error);
        return;
      }

      // store and redirect to homw
      if (jsondata.user) {
        login(jsondata.user);
      } else {
        localStorage.setItem("is_user_logged_in", "true");
      }
      addToast("Registered successfully!", "success");
      navigate('/');
    } catch (err) {
      console.log(err);
      addToast("An unexpected error occurred", "error");
    }
  }

  return (
    <div className="login-container">
      <h2>Register</h2>
      <form className="login-form">
        {error && (
          <div className="inline-error">
            {error}
          </div>
        )}
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            placeholder="Enter your full name"
            value={userName}
            onChange={handleNameChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={userEmail}
            onChange={handleEmailChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="userPassword">Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="userPassword"
              placeholder="Create a password"
              value={userPassword}
              onChange={handlePasswordChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={handleTogglePassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="login-button"
          onClick={handleSubmit}
        >
          Register
        </button>
        <p className="auth-link">
          Already have an account? <Link to="/auth/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};
