import React, { useEffect, useState } from 'react';
import { User, Heart, Lock, KeyRound, Eye, EyeOff, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getFavorites, getBookByID, resetPassword, getMyBorrowings } from '../../utils/api';
import { BorrowStatus } from '../../types/BorrowStatus';
import type { Book } from '../../utils/bookCache';
import type { Borrowing } from '../../types';
import './profile.css';

export const Profile = () => {
  const { user } = useAuth();
  const isStaff = user?.role === 'admin' || user?.role === 'librarian';

  const [activeTab, setActiveTab] = useState<'borrowings' | 'favorites' | 'security'>(isStaff ? 'favorites' : 'borrowings');

  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const [myBorrowings, setMyBorrowings] = useState<Borrowing[]>([]);
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

  const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value);
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value);
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value);

  const toggleCurrentPassword = () => setShowCurrentPassword(prev => !prev);
  const toggleNewPassword = () => setShowNewPassword(prev => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword(prev => !prev);

  const handleNavigateToBook = (bookId: number) => navigate(`/books/${bookId}`);
  const handleBrowseBooks = () => navigate('/books');
  const handleTabChange = (tab: 'borrowings' | 'favorites' | 'security') => setActiveTab(tab);

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

    const fetchBorrowings = async () => {
      try {
        const res = await getMyBorrowings();
        if (res.ok) {
          const data = await res.json();
          setMyBorrowings(data);
        }
      } catch (err) {
        console.error("Failed to load borrowings", err);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    if (activeTab === 'favorites') {
      fetchFavoriteBooks();
    } else if (activeTab === 'borrowings' && !isStaff) {
      fetchBorrowings();
    } else {
      setLoading(false);
    }
  }, [activeTab, isStaff]);

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
          {!isStaff && (
            <button
              className={`sidebar-btn ${activeTab === 'borrowings' ? 'active' : ''}`}
              onClick={() => handleTabChange('borrowings')}
            >
              <BookOpen size={20} /> My Borrowings
            </button>
          )}
          <button
            className={`sidebar-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => handleTabChange('favorites')}
          >
            <Heart size={20} /> My Favorites
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => handleTabChange('security')}
          >
            <Lock size={20} /> Security & Password
          </button>
        </nav>
      </aside>

      {/* RHS Main Panel */}
      <main className="profile-main">
        {activeTab === 'borrowings' && !isStaff && (
          <div className="profile-panel fade-in">
            <h2><BookOpen size={24} color="var(--primary-color)" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> My Borrowings</h2>
            <p className="panel-subtitle">Track your borrow requests, active circulations, and past history.</p>

            {loading ? (
              <p>Loading your borrowings...</p>
            ) : myBorrowings.length > 0 ? (
              <div className="borrowings-container">
                {[BorrowStatus.ISSUED, BorrowStatus.OVERDUE].some(s => myBorrowings.some(b => b.status === s)) && (
                  <details style={{ marginTop: '2rem' }} open>
                    <summary style={{ cursor: 'pointer', marginBottom: '1rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)', fontSize: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Active Borrowings</summary>
                    <div className="borrowings-grid">
                      {myBorrowings.filter(b => [BorrowStatus.ISSUED, BorrowStatus.OVERDUE].includes(b.status as BorrowStatus)).map((b) => (
                        <div key={b.id} className="borrowing-card">
                          <div className="borrowing-card-header">
                            <h3 style={{ cursor: 'pointer' }} onClick={() => handleNavigateToBook(b.book_id)}>{b.title}</h3>
                            <span className={`status-badge ${b.status}`}>
                              {b.status}
                            </span>
                          </div>
                          <div className="borrowing-card-details">
                            <p><strong>Request Date:</strong> {new Date(b.borrow_date).toLocaleDateString()}</p>
                            {b.due_date && <p><strong>Due Date:</strong> {new Date(b.due_date).toLocaleDateString()}</p>}
                            {b.penalty_amount > 0 && (
                              <div className="penalty-tag">Penalty: ₹{b.penalty_amount}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {[BorrowStatus.PENDING, BorrowStatus.ACCEPTED].some(s => myBorrowings.some(b => b.status === s)) && (
                  <details style={{ marginTop: '2rem' }} open>
                    <summary style={{ cursor: 'pointer', marginBottom: '1rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)', fontSize: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Pending Requests</summary>
                    <div className="borrowings-grid">
                      {myBorrowings.filter(b => [BorrowStatus.PENDING, BorrowStatus.ACCEPTED].includes(b.status as BorrowStatus)).map((b) => (
                        <div key={b.id} className="borrowing-card">
                          <div className="borrowing-card-header">
                            <h3 style={{ cursor: 'pointer' }} onClick={() => handleNavigateToBook(b.book_id)}>{b.title}</h3>
                            <span className={`status-badge ${b.status}`}>
                              {b.status}
                            </span>
                          </div>
                          <div className="borrowing-card-details">
                            <p><strong>Request Date:</strong> {new Date(b.borrow_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {[BorrowStatus.RETURNED, BorrowStatus.REJECTED, BorrowStatus.REVOKED, BorrowStatus.CANCELLED].some(s => myBorrowings.some(b => b.status === s)) && (
                  <details style={{ marginTop: '2rem' }} open>
                    <summary style={{ cursor: 'pointer', marginBottom: '1rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)', fontSize: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>History</summary>
                    <div className="borrowings-grid">
                      {myBorrowings.filter(b => [BorrowStatus.RETURNED, BorrowStatus.REJECTED, BorrowStatus.REVOKED, BorrowStatus.CANCELLED].includes(b.status as BorrowStatus)).map((b) => (
                        <div key={b.id} className="borrowing-card">
                          <div className="borrowing-card-header">
                            <h3 style={{ cursor: 'pointer' }} onClick={() => handleNavigateToBook(b.book_id)}>{b.title}</h3>
                            <span className={`status-badge ${b.status}`}>
                              {b.status}
                            </span>
                          </div>
                          <div className="borrowing-card-details">
                            <p><strong>Request Date:</strong> {new Date(b.borrow_date).toLocaleDateString()}</p>
                            {b.penalty_amount > 0 && (
                              <div className="penalty-tag">Penalty: ₹{b.penalty_amount}</div>
                            )}
                            {b.status === BorrowStatus.REJECTED && b.rejection_reason && (
                              <p style={{ color: '#b91c1c', marginTop: '0.5rem', fontStyle: 'italic' }}>Reason: {b.rejection_reason}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            ) : (
              <div className="profile-placeholder">
                <p>You haven't requested any books yet.</p>
                <button className="borrow-btn" onClick={handleBrowseBooks} style={{ marginTop: '1rem' }}>Browse Books</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="profile-panel fade-in">
            <h2><Heart size={24} fill="var(--primary-color)" color="var(--primary-color)" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Your Favorite Books</h2>
            <p className="panel-subtitle">Manage your library history and saved reads.</p>

            {loading ? (
              <p>Loading your favorites...</p>
            ) : favoriteBooks.length > 0 ? (
              <div className="favorites-grid">
                {favoriteBooks.map((book) => (
                  <div key={book.id} className="favorite-card" onClick={() => handleNavigateToBook(book.id)}>
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
                <button className="borrow-btn" onClick={handleBrowseBooks} style={{ marginTop: '1rem' }}>Browse Books</button>
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
                    onChange={handleCurrentPasswordChange}
                    placeholder="Enter current password"
                  />
                  <button type="button" className="eye-btn" onClick={toggleCurrentPassword}>
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
                    onChange={handleNewPasswordChange}
                    placeholder="Enter new password"
                  />
                  <button type="button" className="eye-btn" onClick={toggleNewPassword}>
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
                    onChange={handleConfirmPasswordChange}
                    placeholder="Re-enter new password"
                  />
                  <button type="button" className="eye-btn" onClick={toggleConfirmPassword}>
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
