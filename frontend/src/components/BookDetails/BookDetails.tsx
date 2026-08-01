import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader } from '../Loader/Loader';
import { getBookByID, getFavorites, toggleFavorite, requestBorrow, getMyBorrowings, cancelBorrowRequest } from '../../utils/api';
import { getBookBorrowingHistory } from '../../utils/adminApi';
import { Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { BorrowStatus } from '../../types/BorrowStatus';
import { ReviewSection } from './ReviewSection';
import "./bookDetails.css";

interface Book {
  id: number;
  title: string;
  author: string;
  total_copies: number;
  available_copies: number;
  description: string;
  isbn?: string;
  category?: string;
  rating?: number;
}

export const BookDetails = () => {
  const { bookID } = useParams<{ bookID: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState<{ message: string, type: "auth" | "not_found" | "generic" } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [isRequesting, setIsRequesting] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [activeBorrowingStatus, setActiveBorrowingStatus] = useState<string | null>(null);
  const [activeBorrowingId, setActiveBorrowingId] = useState<number | null>(null);
  const [activeBorrowingDueDate, setActiveBorrowingDueDate] = useState<string | null>(null);
  const [borrowersList, setBorrowersList] = useState<any[]>([]);
  const [hasBorrowed, setHasBorrowed] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!user) {
        setError({ message: "Please login first to see the contents.", type: "auth" });
        setLoading(false);
        return;
      }

      try {
        const response = await getBookByID(bookID as string);

        if (response.status === 401 || response.status === 403) {
          logout();
          setError({ message: "Session expired or invalid. Please login first to see the contents.", type: "auth" });
          return;
        }

        if (response.status === 404) {
          setError({ message: "Book not found in the archives.", type: "not_found" });
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch book details");

        const data = await response.json();
        setBook(data);

        // Fetch favorites to see if this book is favored
        const favRes = await getFavorites();
        if (favRes.ok) {
          const favData = await favRes.json();
          if (favData.includes(Number(bookID))) {
            setIsFavorite(true);
          }
        }

        // Fetch user's borrowings to see if they already requested this book
        if (user.role === 'member') {
          const borrowRes = await getMyBorrowings();
          if (borrowRes.ok) {
            const borrowData = await borrowRes.json();
            const active = borrowData.find((b: any) => 
              b.book_id === Number(bookID) && 
              [BorrowStatus.PENDING, BorrowStatus.ACCEPTED, BorrowStatus.ISSUED, BorrowStatus.OVERDUE].includes(b.status as BorrowStatus)
            );
            if (active) {
              setActiveBorrowingStatus(active.status);
              setActiveBorrowingId(active.id);
              if (active.due_date) {
                setActiveBorrowingDueDate(active.due_date);
              }
            }

            const hasBorrowedBook = borrowData.some((b: any) => 
              b.book_id === Number(bookID) && 
              [BorrowStatus.ISSUED, BorrowStatus.RETURNED, BorrowStatus.OVERDUE].includes(b.status as BorrowStatus)
            );
            setHasBorrowed(hasBorrowedBook);
          }
        } else if (user.role === 'admin' || user.role === 'librarian') {
          const historyRes = await getBookBorrowingHistory(bookID as string);
          if (historyRes.ok) {
            setBorrowersList(await historyRes.json());
          }
        }

      } catch (err) {
        setError({ message: "Could not load the book details.", type: "generic" });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookID]);

  const handleFavoriteToggle = async () => {
    try {
      const res = await toggleFavorite(Number(bookID));
      if (res.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  const handleBorrowRequest = async () => {
    if (!user) {
      navigate('/auth/login', { state: { from: location.pathname } });
      return;
    }
    
    setIsRequesting(true);
    try {
      const res = await requestBorrow(Number(bookID));
      if (res.ok) {
        addToast("Borrow request submitted successfully! Pending librarian approval.", "success");
        setShowBorrowModal(false);
        navigate('/profile');
      } else {
        const data = await res.json();
        addToast(data.error || "Failed to submit request", "error");
      }
    } catch (err) {
      addToast("Failed to submit borrow request.", "error");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!activeBorrowingId) return;
    
    setIsRequesting(true);
    try {
      const res = await cancelBorrowRequest(activeBorrowingId);
      const data = await res.json();
      if (res.ok) {
        addToast("Request cancelled successfully.", 'success');
        setActiveBorrowingStatus(null);
        setActiveBorrowingId(null);
        setActiveBorrowingDueDate(null);
        setShowCancelModal(false);
      } else {
        addToast(data.error || "Failed to cancel request.", 'error');
      }
    } catch (err) {
      addToast("Network error occurred while cancelling.", 'error');
    } finally {
      setIsRequesting(false);
    }
  };

  if (loading) return <Loader text="Retrieving book details..." />;

  if (error) {
    return (
      <div className="book-details-error">
        <h2>{error.type === "auth" ? "Access Denied" : "Content Not Available"}</h2>
        <p>{error.message}</p>
        {error.type === "auth" ? (
          <button onClick={() => navigate('/auth/login', { state: { from: location.pathname } })}>Go to Login</button>
        ) : (
          <button onClick={() => navigate('/books')}>Back to Catalog</button>
        )}
      </div>
    );
  }

  if (!book) return <div className="book-details-error">Book not found.</div>;

  return (
    <div className="book-details-container">
      <div className="book-details-card">

        <div className="book-details-visual">
          <div className="book-cover-container">
            <div className="book-cover">
              <div className="book-spine"></div>
              <div className="book-front">
                <h3 className="book-cover-title">{book.title}</h3>
                <p className="book-cover-author">{book.author}</p>
                <div className="book-decor"></div>
              </div>
            </div>
          </div>

          <div className="book-details-stats">
            <div className="stat-box">
              <span className="stat-value available">{book.available_copies}</span>
              <span className="stat-name">Available Copies</span>
            </div>
          </div>
        </div>

        <div className="book-details-info">
          <div className="book-details-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1>{book.title}</h1>
                <h3>By {book.author}</h3>
              </div>
              <button
                className="favorite-btn-details"
                onClick={handleFavoriteToggle}
                aria-label="Toggle Favorite"
                style={{
                  background: 'transparent',
                  border: 'white',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Heart
                  size={32}
                  fill={isFavorite ? "var(--primary-color)" : "none"}
                  color={isFavorite ? "var(--primary-color)" : "var(--text-main)"}
                />
              </button>
            </div>

            <div className="book-details-meta">
              {book.category && <span className="meta-tag category-tag">{book.category}</span>}
              {book.rating && <span className="meta-tag rating-tag">★ {book.rating} / 5.00</span>}
              {book.isbn && <span className="meta-tag isbn-tag">ISBN: {book.isbn}</span>}
            </div>
          </div>

          <div className="book-details-desc">
            <p>{book.description}</p>
          </div>

          <div className="book-details-actions">
            {(!user || user.role === 'member') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                {activeBorrowingStatus === BorrowStatus.ACCEPTED && (
                  <p style={{ textAlign: 'center', fontSize: '0.95rem', color: '#10B981', fontStyle: 'italic', padding: '0.5rem 0' }}>
                    Borrow request accepted! You can collect the book from the library counter.
                  </p>
                )}
                {activeBorrowingDueDate && (
                  <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-main)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                    Return Date: {new Date(activeBorrowingDueDate).toLocaleDateString()}
                  </p>
                )}
                <button 
                  className="borrow-btn" 
                  disabled={book.available_copies === 0 || isRequesting || activeBorrowingStatus !== null}
                  style={{ display: activeBorrowingStatus === BorrowStatus.PENDING ? 'none' : 'block' }}
                  onClick={() => {
                    if (!user) {
                      navigate('/auth/login', { state: { from: location.pathname } });
                    } else {
                      setShowBorrowModal(true);
                    }
                  }}
                >
                  {activeBorrowingStatus 
                    ? (
                      activeBorrowingStatus === BorrowStatus.ACCEPTED ? "Ready for Collection" :
                      ([BorrowStatus.ISSUED, BorrowStatus.OVERDUE].includes(activeBorrowingStatus as BorrowStatus) ? "You own the book" : 
                      `Status: ${activeBorrowingStatus.charAt(0).toUpperCase() + activeBorrowingStatus.slice(1)}`)
                    )
                    : (book.available_copies > 0 ? "Request to Borrow" : "Out of Stock")}
                </button>
                {[BorrowStatus.PENDING, BorrowStatus.ACCEPTED].includes(activeBorrowingStatus as BorrowStatus) && (
                  <button 
                    className="borrow-btn" 
                    style={{ backgroundColor: '#b91c1c' }}
                    disabled={isRequesting}
                    onClick={() => setShowCancelModal(true)}
                  >
                    {isRequesting ? "Cancelling..." : "Cancel Request"}
                  </button>
                )}
              </div>
            )}
            <button className="back-btn" onClick={() => navigate(-1)}>Back to Catalog</button>
          </div>
        </div>

      </div>

      {(user?.role === 'admin' || user?.role === 'librarian') && (
        <div className="borrowers-list-card">
          <h3>Current Borrowers</h3>
          {(() => {
            const activeBorrowers = borrowersList.filter(b => ['PENDING', 'ACCEPTED', 'ISSUED', 'OVERDUE'].includes(b.status.toUpperCase()));
            if (activeBorrowers.length === 0) {
              return (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>
                  No active borrowers found for this book.
                </p>
              );
            }
            return activeBorrowers.map(b => (
              <div key={b.id} className="borrower-item">
                <div className="borrower-item-header">
                  <div>
                    <div className="borrower-name">{b.user_name}</div>
                    <div className="borrower-email">{b.user_email}</div>
                  </div>
                  <span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span>
                </div>
                <div className="borrower-details">
                  <div><strong>Borrowed:</strong> {new Date(b.borrow_date).toLocaleDateString()}</div>
                  {b.due_date && <div><strong>Due:</strong> {new Date(b.due_date).toLocaleDateString()}</div>}
                  {b.return_date && <div><strong>Returned:</strong> {new Date(b.return_date).toLocaleDateString()}</div>}
                  {b.penalty_amount > 0 && <div className="borrower-penalty"><strong>Penalty:</strong> ₹{b.penalty_amount}</div>}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      <ReviewSection bookId={Number(bookID)} hasBorrowed={hasBorrowed} />

      {showBorrowModal && (
        <div className="modal-overlay" onClick={() => setShowBorrowModal(false)}>
          <div className="modal-content borrow-modal" onClick={e => e.stopPropagation()}>
            <h3>Confirm Borrow Request</h3>
            <p>You are about to request <strong>{book.title}</strong>.</p>
            <div className="borrow-modal-info">
              <p>Once the librarian approves your request, the book will be reserved for <strong>24 hours</strong>.</p>
              <p>You must physically collect the book from the library desk within this timeframe, otherwise the request will be automatically revoked.</p>
            </div>
            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="back-btn" onClick={() => setShowBorrowModal(false)} disabled={isRequesting}>Cancel</button>
              <button className="borrow-btn" onClick={handleBorrowRequest} disabled={isRequesting}>
                {isRequesting ? "Submitting..." : "Confirm Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content borrow-modal" onClick={e => e.stopPropagation()}>
            <h3>Cancel Request</h3>
            <p>Are you sure you want to cancel your request for <strong>{book.title}</strong>?</p>
            <div className="borrow-modal-info">
              <p>This action cannot be undone. You will lose your current place in the queue.</p>
            </div>
            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="back-btn" onClick={() => setShowCancelModal(false)} disabled={isRequesting}>Keep Request</button>
              <button className="borrow-btn" style={{ backgroundColor: '#b91c1c' }} onClick={handleCancelRequest} disabled={isRequesting}>
                {isRequesting ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
