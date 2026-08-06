import React, { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getWishlist, getBookByID } from '../../../utils/api';
import type { Book } from '../../../utils/bookCache';

export const WishlistTab = () => {
  const [wishlistBooks, setWishlistBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleNavigateToBook = (bookId: number) => navigate(`/books/${bookId}`);
  const handleBrowseBooks = () => navigate('/books');

  useEffect(() => {
    const fetchWishlistBooks = async () => {
      try {
        const wishRes = await getWishlist();
        const bookIDs = wishRes.data;
        if (bookIDs.length > 0) {
          const bookPromises = bookIDs.map((id: number) => getBookByID(String(id)));
          const responses = await Promise.all(bookPromises);

          const booksData = responses.map(res => res.data);
          setWishlistBooks(booksData);
        }
      } catch (err) {
        console.error("Failed to load wishlist", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistBooks();
  }, []);

  return (
    <div className="profile-panel fade-in">
      <h2><Bookmark size={24} fill="var(--primary-color)" color="var(--primary-color)" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Your Wishlist</h2>
      <p className="panel-subtitle">Manage books you want to read in the future.</p>

      {loading ? (
        <p>Loading your wishlist...</p>
      ) : wishlistBooks.length > 0 ? (
        <div className="favorites-grid">
          {wishlistBooks.map((book) => (
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
          <p>You haven't added any books to your wishlist yet.</p>
          <p>Head over to the catalog to discover your next great read!</p>
          <button className="borrow-btn" onClick={handleBrowseBooks} style={{ marginTop: '1rem' }}>Browse Books</button>
        </div>
      )}
    </div>
  );
};
