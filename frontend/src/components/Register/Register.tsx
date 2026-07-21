import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import "../Login/login.css"; // Reuse the login styles for the register form

export const Register = () => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevents page reload on form submit
    navigate('/');
  }

  return (
    <div className="login-container">
      <h2>Register</h2>
      <form className="login-form">
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
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            placeholder="Create a password" 
            value={password}
            onChange={(e) => { setPassword(e.target.value) }}
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
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};
