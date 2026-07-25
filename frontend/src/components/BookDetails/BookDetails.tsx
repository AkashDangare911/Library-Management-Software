import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader } from '../Loader/Loader';
import { getBookByID, getFavorites, toggleFavorite } from '../../utils/api';
import { Heart } from 'lucide-react';
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

  useEffect(() => {
    const fetchBookDetails = async () => {
      const token = localStorage.getItem("is_user_logged_in");

      if (!token) {
        setError({ message: "Please login first to see the contents.", type: "auth" });
        setLoading(false);
        return;
      }

      try {
        const response = await getBookByID(bookID as string);

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("is_user_logged_in");
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
            <button className="borrow-btn" disabled={book.available_copies === 0}>
              {book.available_copies > 0 ? "Confirm Borrow" : "Out of Stock"}
            </button>
            <button className="back-btn" onClick={() => navigate(-1)}>Back to Catalog</button>
          </div>
        </div>

      </div>
    </div>
  );
};
