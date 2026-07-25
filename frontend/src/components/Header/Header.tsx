import { Link, useNavigate, useLocation, NavLink } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { logoutUser } from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import { User } from "lucide-react";
import "./header.css"

function Header() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(!!localStorage.getItem("is_user_logged_in"));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const isAuthPage = location.pathname.startsWith('/auth');

  useEffect(() => {
    setIsUserLoggedIn(!!localStorage.getItem("is_user_logged_in"));
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {}
    localStorage.removeItem("is_user_logged_in");
    setIsUserLoggedIn(false);
    setIsDropdownOpen(false);
    addToast("Logged out successfully.", "success");
    navigate('/auth/login');
  }

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  const handleLoginClick = () => {
    setIsDropdownOpen(false);
    navigate('/auth/login', { state: { from: location.pathname } });
  };

  return (
    <header className='header'>
      <div className="header-left">
        <Link to="/" className="header-title">
          <h1>Grand Archives</h1>
        </Link>
      </div>

      {!isAuthPage && (
        <nav className="header-nav">
          <NavLink 
            to="/" 
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Home
          </NavLink>
          <NavLink 
            to="/books" 
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Books
          </NavLink>
          <NavLink 
            to="/about" 
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            About
          </NavLink>
        </nav>
      )}

      <div className="header-actions">
        {!isAuthPage && (
          <div className="profile-dropdown-container" ref={dropdownRef}>
            <button 
              className="profile-icon-btn" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="User Profile"
            >
              <User size={28} />
            </button>
            
            {isDropdownOpen && (
              <div className="profile-dropdown-menu">
                {isUserLoggedIn ? (
                  <>
                    <button className="dropdown-item" onClick={handleProfileClick}>
                      View Profile
                    </button>
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      Logout
                    </button>
                  </>
                ) : (
                  <button className="dropdown-item" onClick={handleLoginClick}>
                    Login / Register
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header