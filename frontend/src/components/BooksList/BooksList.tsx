import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BooksNotFound } from '../Home/BooksNotFound';
import { Loader } from '../Loader/Loader';
import { queryCache, setQueryCache } from '../../utils/bookCache';
import { getAllBooks, getFavorites, toggleFavorite, getMyBorrowings } from '../../utils/api';
import type { Book } from '../../utils/bookCache';
import type { Borrowing } from '../../types';
import { Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import "./booksList.css";

export const BooksList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const [books, setBooks] = useState<Book[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [borrowStatusMap, setBorrowStatusMap] = useState<Record<number, string>>({});
  const [totalPages, setTotalPages] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState("");

  const { user, logout } = useAuth();

  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "");
  const [minRating, setMinRating] = useState(searchParams.get("rating") || "");
  const [availableOnly, setAvailableOnly] = useState(searchParams.get("available") === "true");

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      getFavorites().then((res) => {
        setFavorites(new Set(res.data));
      }).catch(err => console.error(err));

      if (user.role === 'member') {
        getMyBorrowings().then((res) => {
          const statusMap: Record<number, string> = {};
          res.data.forEach((b: Borrowing) => {
            if (['pending', 'accepted', 'issued', 'overdue'].includes(b.status)) {
              statusMap[b.book_id] = b.status;
            }
          });
          setBorrowStatusMap(statusMap);
        }).catch(err => console.error(err));
      }
    }
  }, [user]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => updateFilter("search", e.target.value);
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => updateFilter("category", e.target.value);
  const handleRatingChange = (e: React.ChangeEvent<HTMLSelectElement>) => updateFilter("rating", e.target.value);
  const handleAvailableChange = (e: React.ChangeEvent<HTMLInputElement>) => updateFilter("available", e.target.checked);

  // Helper to update filters and reset page to 1
  const updateFilter = (key: string, value: string | boolean) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, String(value));
    } else {
      newParams.delete(key);
    }
    // Always reset to page 1 when filters change
    newParams.set("page", "1");
    setSearchParams(newParams);

    // Update local state to keep inputs responsive
    if (key === "search") setSearchTerm(value as string);
    if (key === "category") setCategoryFilter(value as string);
    if (key === "rating") setMinRating(value as string);
    if (key === "available") setAvailableOnly(value as boolean);
  };

  const setPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(newPage));
    setSearchParams(newParams);
  };

  useEffect(() => {
    const fetchBooks = async () => {
      if (!user) {
        setError("Please log in to view the entire library catalog.");
        setIsInitialLoad(false);
        setIsFiltering(false);
        return;
      }

      try {
        if (!isInitialLoad) {
          setIsFiltering(true);
        }

        const params: Record<string, string> = {};
        if (searchTerm) params.search = searchTerm;
        if (categoryFilter) params.category = categoryFilter;
        if (minRating) params.rating = minRating;
        if (availableOnly) params.available = "true";
        params.page = String(pageParam);
        params.limit = "10";

        const queryString = new URLSearchParams(params).toString();

        // Check our local paginated query cache
        if (queryCache[queryString]) {
          setBooks(queryCache[queryString].books);
          setTotalPages(queryCache[queryString].totalPages);
          setIsInitialLoad(false);
          setIsFiltering(false);
          return;
        }

        const response = await getAllBooks(params);
        const data = response.data;

        setBooks(data.books);
        setTotalPages(data.totalPages || 1);

        setQueryCache(queryString, data);

      } catch (err: any) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          logout();
          setError("Please log in to view the library catalog.");
        } else {
          setError("Could not load the library catalog.");
          console.error(err);
        }
      } finally {
        setIsInitialLoad(false);
        setIsFiltering(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchBooks();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, categoryFilter, minRating, availableOnly, pageParam]);

  const handleViewBookDetails = (bookID: number) => {
    if (user) {
      navigate(`/books/${bookID}`);
    } else {
      navigate('/auth/login', { state: { from: `/books/${bookID}` } });
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent, bookID: number) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth/login', { state: { from: '/books' } });
      return;
    }

    try {
      await toggleFavorite(bookID); // update the backend
      // update frontend state (don't refetch from BE)
      // upon reload, we'll get the latest state from BE
      setFavorites(prev => {
        const next = new Set(prev);
        if (next.has(bookID)) next.delete(bookID);
        else next.add(bookID);
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (error) {
    return <BooksNotFound message={error} isAuthError={error.includes("log in")} />;
  }

  if (isInitialLoad) {
    return (
      <div className="books-list-container">
        <Loader text="Unlocking the archives..." />
      </div>
    );
  }

  // Generate page numbers for pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`page-btn ${pageParam === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          onClick={() => setPage(pageParam - 1)}
          disabled={pageParam === 1}
          className="page-btn nav-btn"
        >
          Previous
        </button>
        <div className="page-numbers">
          {pages}
        </div>
        <button
          onClick={() => setPage(pageParam + 1)}
          disabled={pageParam === totalPages}
          className="page-btn nav-btn"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="books-list-container">
      <div className="books-list-header">
        <h1 className="books-list-title">The Grand Catalog</h1>
        <p className="books-list-subtitle">Explore our complete collection of literary masterpieces.</p>
      </div>

      <div className="books-filters">
        <input
          type="text"
          placeholder="Search by title, author, or ISBN..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="filter-input search-input"
        />
        <select
          value={categoryFilter}
          onChange={handleCategoryChange}
          className="filter-input"
        >
          <option value="">All Categories</option>
          <option value="Fiction">Fiction</option>
          <option value="Non-Fiction">Non-Fiction</option>
          <option value="Science Fiction">Science Fiction</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Mystery">Mystery</option>
          <option value="Biography">Biography</option>
          <option value="History">History</option>
        </select>
        <select
          value={minRating}
          onChange={handleRatingChange}
          className="filter-input"
        >
          <option value="">Any Rating</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
        </select>
        <label className="filter-checkbox-label">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={handleAvailableChange}
          />
          Available Only
        </label>
      </div>

      <div className={`books-grid ${isFiltering ? 'books-grid-loading' : ''}`}>
        {books.length > 0 ? books.map((book) => (
          <div key={book.id} className="book-card">
            <button
              className="favorite-btn"
              onClick={(e) => handleFavoriteToggle(e, book.id)}
              aria-label="Toggle Favorite"
            >
              <Heart
                size={24}
                fill={favorites.has(book.id) ? "var(--primary-color)" : "none"}
                color={favorites.has(book.id) ? "var(--primary-color)" : "var(--text-main)"}
              />
            </button>
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
                {book.category && <span className="book-category-tag">{book.category}</span>}
                {book.rating && <span className="book-rating-tag">★ {book.rating}</span>}
              </div>

              {borrowStatusMap[book.id] && (
                <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className={`status-badge ${borrowStatusMap[book.id]}`} style={{ display: 'inline-block' }}>
                    {borrowStatusMap[book.id]}
                  </span>
                </div>
              )}

              <button
                className="borrow-button"
                onClick={() => handleViewBookDetails(book.id)}
              >
                View Details
              </button>
            </div>
          </div>
        )) : (
          <div className="no-books-found">No books match your filters.</div>
        )}
      </div>

      {renderPagination()}
    </div>
  );
};
