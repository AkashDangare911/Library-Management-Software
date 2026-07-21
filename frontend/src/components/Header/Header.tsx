import { Link, useNavigate, useLocation } from "react-router-dom";
import "./header.css"

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // TODO: Replace with actual auth context state when implemented
  const isLoggedIn = false; 
  
  // Don't show the login button if we are already on the auth pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className='header'>
      <Link to="/" className="header-title">
        <h1>Library Management Software</h1>
      </Link>
      
      <div className="header-actions">
        {isLoggedIn ? (
          <button className="profile-btn">Profile</button>
        ) : (
          !isAuthPage && <button className="login-btn" onClick={() => navigate('/login')}>Login</button>
        )}
      </div>
    </div>
  )
}

export default Header