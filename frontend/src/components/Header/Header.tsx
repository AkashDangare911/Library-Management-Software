import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./header.css"

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(!!localStorage.getItem("auth_token"));
  const isAuthPage = location.pathname.startsWith('/auth');

  useEffect(() => {
    setIsUserLoggedIn(!!localStorage.getItem("auth_token"));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setIsUserLoggedIn(false);
    navigate('/auth/login');
  }

  return (
    <div className='header'>
      <Link to="/" className="header-title">
        <h1>Library Management Software</h1>
      </Link>

      <div className="header-actions">
        {!isAuthPage && (
          isUserLoggedIn ?
            <button className="logout-btn" onClick={handleLogout}>Logout</button> :
            <button className="login-btn" onClick={() => navigate('/auth/login', { state: { from: location.pathname } })}>Login</button>
        )}
      </div>
    </div>
  )
}

export default Header