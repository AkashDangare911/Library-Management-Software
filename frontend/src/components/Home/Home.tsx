import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BooksNotFound } from './BooksNotFound';
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
        const response = await fetch(`${apiUrl}/books`);
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
    const isUserLoggedIn = localStorage.getItem("isLoggedIn") ?? '';
    if (isUserLoggedIn) {
      navigate('/borrowBook');
    } else {
      navigate('/auth/login');
    }
  };

  if (loading) return <div className="loading-state">Loading books...</div>;
  if (error) {
    return <BooksNotFound message={error} />;
  }

  const totalBooks = books.length;
  const totalAvailable = books.reduce((sum, book) => sum + book.available_copies, 0);

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to the Grand Archives</h1>
          <p className="hero-subtitle">
            "A room without books is like a body without a soul." – Marcus Tullius Cicero
          </p>
          <button className="hero-cta" onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}>
            Explore the Archives
          </button>
        </div>
      </section>

      {/* Stats Banner */}
      <div className="stats-banner">
        <div className="stat-item">
          <span className="stat-number">{totalBooks}</span>
          <span className="stat-label">Unique Titles</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{totalAvailable}</span>
          <span className="stat-label">Available Copies</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">24/7</span>
          <span className="stat-label">Digital Access</span>
        </div>
      </div>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Join Our Library?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3 className="feature-title">Vast Collection</h3>
            <p className="feature-desc">Access thousands of rare manuscripts and modern bestsellers.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Instant Borrowing</h3>
            <p className="feature-desc">Borrow books instantly with our streamlined digital process.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3 className="feature-title">Community Events</h3>
            <p className="feature-desc">Join book clubs, author meetups, and literary discussions.</p>
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section id="catalog" className="catalog-section">
        <h2 className="section-title">Library Catalog</h2>

        <div className="books-grid">
          {books.slice(0, 5).map((book) => (
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
            </div>
          ))}
        </div>

        {books.length > 5 && (
          <div className="more-books-banner">
            <h3 className="more-books-text">...and many more fascinating titles awaiting your discovery.</h3>
          </div>
        )}
      </section>

      <div className="section-separator"></div>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Start Your Journey?</h2>
          <p className="cta-desc">Join our community of readers and gain unlimited access to our vast library of knowledge.</p>
          <button className="hero-cta" onClick={() => navigate('/login')}>
            Join the Library
          </button>
        </div>
      </section>
    </div>
  );
};
