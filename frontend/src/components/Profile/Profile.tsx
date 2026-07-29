import React, { useEffect, useState } from 'react';
import { User, Heart, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { getFavorites, getBookByID, resetPassword } from '../../utils/api';
import type { Book } from '../../utils/bookCache';
import './profile.css';

export const Profile = () => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'security'>('favorites');

  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Reset Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [inlineError, setInlineError] = useState('');
  
  // Visibility State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchFavoriteBooks = async () => {
      try {
        const favRes = await getFavorites();
        if (favRes.ok) {
          const bookIDs = await favRes.json();
          if (bookIDs.length > 0) {
            const bookPromises = bookIDs.map((id: number) => getBookByID(String(id)));
            const responses = await Promise.all(bookPromises);
            
            const booksData = [];
            for (const response of responses) {
              if (response.ok) {
                booksData.push(await response.json());
              }
            }
            setFavoriteBooks(booksData);
          }
        }
      } catch (err) {
        console.error("Failed to load favorites", err);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'favorites') {
      fetchFavoriteBooks();
    }
  }, [activeTab]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setInlineError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setInlineError("New passwords do not match.");
      return;
    }
    
    if (newPassword.length < 6) {
      setInlineError("New password must be at least 6 characters.");
      return;
    }

    setIsResetting(true);
    try {
      const res = await resetPassword(currentPassword, newPassword);
      const data = await res.json();
      if (res.ok) {
        addToast("Password updated successfully!", 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        addToast(data.error || "Failed to reset password.", 'error');
      }
    } catch (err) {
      addToast("Network error occurred.", 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="profile-dashboard">
      {/* LHS Sidebar */}
      <aside className="profile-sidebar">
        <div className="sidebar-user">
          <div className="profile-avatar-large">
            <User size={64} color="var(--bg-color)" />
          </div>
          <h2 className="profile-title">User Profile</h2>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`sidebar-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <Heart size={20} /> My Favorites
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Lock size={20} /> Security & Password
          </button>
        </nav>
      </aside>

      {/* RHS Main Panel */}
      <main className="profile-main">
        {activeTab === 'favorites' && (
          <div className="profile-panel fade-in">
            <h2><Heart size={24} fill="var(--primary-color)" color="var(--primary-color)" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Your Favorite Books</h2>
            <p className="panel-subtitle">Manage your library history and saved reads.</p>
            
            {loading ? (
              <p>Loading your favorites...</p>
            ) : favoriteBooks.length > 0 ? (
              <div className="favorites-grid">
                {favoriteBooks.map((book) => (
                  <div key={book.id} className="favorite-card" onClick={() => navigate(`/books/${book.id}`)}>
                    <h3>{book.title}</h3>
                    <p>By {book.author}</p>
                    <div className="favorite-card-meta">
                      {book.category && <span>{book.category}</span>}
                      {book.rating && <span>★ {book.rating}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="profile-placeholder">
                <p>You haven't favorited any books yet.</p>
                <p>Head over to the catalog to discover your next great read!</p>
                <button className="borrow-btn" onClick={() => navigate('/books')} style={{ marginTop: '1rem' }}>Browse Books</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="profile-panel fade-in">
            <h2><KeyRound size={24} color="var(--primary-color)" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Reset Password</h2>
            <p className="panel-subtitle">Update your account password. A fresh session will be issued upon success.</p>
            
            <form className="reset-password-form" onSubmit={handleResetPassword}>
              {inlineError && (
                <div className="status-msg error">
                  {inlineError}
                </div>
              )}

              <div className="form-group">
                <label>Current Password</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showCurrentPassword ? "text" : "password"} 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="borrow-btn reset-btn" disabled={isResetting}>
                {isResetting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
