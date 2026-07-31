import { Link, useNavigate, useLocation, NavLink } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { logoutUser } from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { User, ShieldUser, Library } from "lucide-react";
import "./header.css"

function Header() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthPage = location.pathname.startsWith('/auth');

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
    } catch (e) { }
    logout();
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

          {/* Role specific links (Placeholders for now) */}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Admin Dashboard
            </NavLink>
          )}
          {user?.role === 'librarian' && (
            <>
              <NavLink
                to="/librarian/dashboard"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                Librarian Hub
              </NavLink>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                Manage Books
              </NavLink>
            </>
          )}
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
              {user?.role === 'admin' ? <ShieldUser size={28} color="#e5a00d" /> :
                user?.role === 'librarian' ? <Library size={28} color="#2b5c8f" /> :
                  <User size={28} />}
            </button>

            {isDropdownOpen && (
              <div className="profile-dropdown-menu">
                {user ? (
                  <>
                    <div className="dropdown-header-info" style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                      <strong>{user.name}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>Role: {user.role}</div>
                    </div>
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