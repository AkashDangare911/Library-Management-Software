import React from 'react';

interface BooksNotFoundProps {
  message: string;
  onRetry?: () => void;
}

export const BooksNotFound: React.FC<BooksNotFoundProps> = ({ message, onRetry }) => {
  const handleReload = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="error-container">
      <div className="error-content">
        <h2 className="error-title">Oops! Something went wrong</h2>
        <p className="error-message">{message}</p>
        <p className="error-instruction">Please check your internet connection and try reloading the page.</p>
        <button className="reload-button" onClick={handleReload}>
          <svg className="reload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          Reload Page
        </button>
      </div>
    </div>
  );
};
