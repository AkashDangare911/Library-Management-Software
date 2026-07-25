import React, { useEffect, useState } from 'react';
import { User, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFavorites, getBookByID } from '../../utils/api';
import type { Book } from '../../utils/bookCache';
import './profile.css';

export const Profile = () => {
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavoriteBooks = async () => {
      try {
        const favRes = await getFavorites();
        if (favRes.ok) {
          const bookIDs = await favRes.json();
          if (bookIDs.length > 0) {
            // Fetch all book details
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

    fetchFavoriteBooks();
  }, []);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-large">
          <User size={64} color="var(--bg-color)" />
        </div>
        <h1 className="profile-title">User Profile</h1>
        <p className="profile-subtitle">Manage your account and library history.</p>
      </div>
      
      <div className="profile-content">
        <h2><Heart size={24} fill="var(--primary-color)" color="var(--primary-color)" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Your Favorite Books</h2>
        
        {loading ? (
          <p>Loading your favorites...</p>
        ) : favoriteBooks.length > 0 ? (
          <div className="favorites-grid">
            {favoriteBooks.map((book) => (
              <div key={book.id} className="favorite-card" onClick={() => navigate(`/books/${book.id}`)}>
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
            <button className="borrow-btn" onClick={() => navigate('/books')} style={{ marginTop: '1rem' }}>Browse Books</button>
          </div>
        )}
      </div>
    </div>
  );
};
