import React from 'react';

import { useNavigate, useLocation } from 'react-router-dom';

interface BooksNotFoundProps {
  message: string;
  onRetry?: () => void;
  isAuthError?: boolean;
}

export const BooksNotFound: React.FC<BooksNotFoundProps> = ({ message, onRetry, isAuthError }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleReload = () => {
    if (isAuthError) {
      navigate('/auth/login', { state: { from: location.pathname } });
      return;
    }
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="error-container">
      <div className="error-content">
        <h2 className="error-title">{isAuthError ? "Authentication Required" : "Oops! Something went wrong"}</h2>
        <p className="error-message">{message}</p>
        <p className="error-instruction">
          {isAuthError ? "You need to log in to access the library." : "Please check your internet connection and try reloading the page."}
        </p>
        <button className="reload-button" onClick={handleReload}>
          {isAuthError ? (
            <svg className="reload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
          ) : (
          <svg className="reload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          )}
          {isAuthError ? "Go to Login" : "Reload Page"}
        </button>
      </div>
    </div>
  );
};
