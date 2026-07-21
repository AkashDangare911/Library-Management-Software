import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./home.css";

interface Book {
  id: number;
  title: string;
  author: string;
  total_copies: number;
  available_copies: number;
}

export const Home = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
        const response = await fetch(`${apiUrl}/api/books`);
        if (!response.ok) throw new Error("Failed to fetch books");
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        setError("Could not load the library catalog.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleBorrow = () => {
    // Redirect to login page as requested
    navigate('/login');
  };

  if (loading) return <div className="loading-state">Loading books...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="home-container">
      <h2 className="home-title">Library Catalog</h2>
      
      <div className="books-grid">
        {books.map((book) => (
          <div key={book.id} className="book-card">
            <h3 className="book-title">{book.title}</h3>
            <p className="book-author">By {book.author}</p>
            
            <div className="book-stats">
              <span>Total: {book.total_copies}</span>
              <span className={book.available_copies > 0 ? "available" : "unavailable"}>
                Available: {book.available_copies}
              </span>
            </div>

            <button 
              className="borrow-button" 
              onClick={handleBorrow}
              disabled={book.available_copies === 0}
            >
              {book.available_copies > 0 ? "Borrow Book" : "Out of Stock"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
