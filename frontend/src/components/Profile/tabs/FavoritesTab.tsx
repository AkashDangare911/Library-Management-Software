import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFavorites, getBookByID } from '../../../utils/api';
import type { Book } from '../../../utils/bookCache';

export const FavoritesTab = () => {
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleNavigateToBook = (bookId: number) => navigate(`/books/${bookId}`);
  const handleBrowseBooks = () => navigate('/books');

  useEffect(() => {
    const fetchFavoriteBooks = async () => {
      try {
        const favRes = await getFavorites();
        const bookIDs = favRes.data;
        if (bookIDs.length > 0) {
          const bookPromises = bookIDs.map((id: number) => getBookByID(String(id)));
          const responses = await Promise.all(bookPromises);

          const booksData = responses.map(res => res.data);
          setFavoriteBooks(booksData);
        }
      } catch (err) {
        console.error("Failed to load favorites", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavoriteBooks();
  }, []);

  return (
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
  );
};
