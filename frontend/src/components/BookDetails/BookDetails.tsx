import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader } from '../Loader/Loader';
import { getBookByID } from '../../utils/api';
import "./bookDetails.css";

interface Book {
  title: string;
  author: string;
  total_copies: number;
  available_copies: number;
  description: string;
}

export const BookDetails = () => {
  const { bookID } = useParams<{ bookID: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string, type: "auth" | "not_found" | "generic" } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchBookDetails = async () => {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setError({ message: "Please login first to see the contents.", type: "auth" });
        setLoading(false);
        return;
      }

      try {
        const response = await getBookByID(bookID);
        
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("auth_token");
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
      } catch (err) {
        setError({ message: "Could not load the book details.", type: "generic" });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookID]);

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
            <h1>{book.title}</h1>
            <h3>By {book.author}</h3>
          </div>

          <div className="book-details-desc">
            <p>{book.description}</p>
          </div>

          <div className="book-details-actions">
            <button className="borrow-btn" disabled={book.available_copies === 0}>
              {book.available_copies > 0 ? "Confirm Borrow" : "Out of Stock"}
            </button>
            <button className="back-btn" onClick={() => navigate('/')}>Back to Catalog</button>
          </div>
        </div>

      </div>
    </div>
  );
};
