import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BooksNotFound } from '../Home/BooksNotFound';
import { Loader } from '../Loader/Loader';
import { cachedBooks, setCachedBooks } from '../../utils/bookCache';
import { getAllBooks } from '../../utils/api';
import type { Book } from '../../utils/bookCache';
import "./booksList.css";

export const BooksList = () => {
  const [books, setBooks] = useState<Book[]>(cachedBooks || []);
  const [loading, setLoading] = useState(!cachedBooks);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        setError("Please log in to view the entire library catalog.");
        setLoading(false);
        return;
      }

      try {
        const response = await getAllBooks();

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("auth_token");
          setError("Please log in to view the library catalog.");
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch books");
        const data = await response.json();
        setCachedBooks(data);
        setBooks(data);
      } catch (err) {
        setError("Could not load the library catalog.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!cachedBooks) {
      fetchBooks();
    }
  }, []);

  const handleBorrow = (bookID: number) => {
    const isUserLoggedIn = localStorage.getItem("auth_token") ?? '';

    if (isUserLoggedIn) {
      navigate(`/books/${bookID}`);
    } else {
      navigate('/auth/login', { state: { from: `/books/${bookID}` } });
    }
  };

  if (loading) return <Loader text="Unlocking the archives..." />;
  if (error) {
    return <BooksNotFound message={error} isAuthError={error.includes("log in")} />;
  }

  return (
    <div className="books-list-container">
      <div className="books-list-header">
        <h1 className="books-list-title">The Grand Catalog</h1>
        <p className="books-list-subtitle">Explore our complete collection of literary masterpieces.</p>
      </div>
      
      <div className="books-grid">
        {books.map((book) => (
          <div key={book.id} className="book-card">
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

            <div className="book-details">
              <h3 className="book-title" title={book.title}>{book.title}</h3>
              <p className="book-author">By {book.author}</p>

              <div className="book-stats">
                <span className={book.available_copies > 0 ? "available" : "unavailable"}>
                  Available: {book.available_copies}
                </span>
              </div>

              <button
                className="borrow-button"
                onClick={() => handleBorrow(book.id)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
