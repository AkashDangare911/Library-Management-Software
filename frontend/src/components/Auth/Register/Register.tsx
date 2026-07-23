import React, { useState } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";
import { handleErrors } from "../validateFormErrors";
import "../Login/login.css"; // Reuse the login styles for the register form

export const Register = () => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

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
        console.log(error);
        return;
      }

      // store and redirect to homw
      localStorage.setItem("is_user_logged_in", "true");
      navigate('/');
    } catch (err) {
      console.log(err);
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
            onChange={(e) => { setUserName(e.target.value) }}
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
            onChange={(e) => { setUserEmail(e.target.value) }}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="userPassword">Password</label>
          <input
            type="userPassword"
            id="userPassword"
            placeholder="Create a userPassword"
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
          Register
        </button>
        <p className="auth-link">
          Already have an account? <Link to="/auth/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};
