import React, { useEffect, useState } from 'react';
import { getAllBooks } from '../../../utils/api';
import { deleteBook } from '../../../utils/adminApi';
import { useToast } from '../../../context/ToastContext';
import type { Book } from '../../../types';

export const AllBooks = () => {
  const { addToast } = useToast();

  const [booksList, setBooksList] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [deletingBook, setDeletingBook] = useState<{ id: number, title: string } | null>(null);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value);
  const handleClearSearch = () => { setSearchInput(''); setSearchQuery(''); setPage(1); };
  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); setSearchQuery(searchInput); setPage(1); };
  const handleDeleteClick = (book: Book) => setDeletingBook({ id: book.id, title: book.title });
  const cancelDelete = () => setDeletingBook(null);
  const handlePrevPage = () => setPage(p => Math.max(1, p - 1));
  const handleNextPage = () => setPage(p => Math.min(totalPages, p + 1));

  const loadBooks = async () => {
    setLoading(true);
    try {
      const res = await getAllBooks({ page: String(page), limit: '10', search: searchQuery });
      if (res.ok) {
        const data = await res.json();
        setBooksList(data.books || data);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || 0);
      }
    } catch (err) {
      addToast("Failed to load books", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [page, searchQuery]);

  const confirmDeleteBook = async () => {
    if (!deletingBook) return;
    try {
      const res = await deleteBook(deletingBook.id);
      if (res.ok) {
        addToast("Book deleted successfully", "success");
        setDeletingBook(null);
        loadBooks();
      } else {
        const data = await res.json();
        addToast(data.error || "Failed to delete book", "error");
      }
    } catch (err) {
      addToast("Error deleting book", "error");
    }
  };

  if (loading && booksList.length === 0) return <div className="loading-state">Loading books...</div>;

  return (
    <>
      <div className="admin-table-container">
        <div className="flex-between">
          <h2>All Books</h2>
          <span style={{ color: 'var(--text-muted)' }}>Total: {totalItems}</span>
        </div>

        <form
          className="search-bar"
          onSubmit={handleSearchSubmit}
        >
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={searchInput}
            onChange={handleSearchInputChange}
          />
          <button type="submit" className="btn-sm btn-primary">Search</button>
          {searchQuery && (
            <button
              type="button"
              className="btn-sm"
              onClick={handleClearSearch}
            >
              Clear
            </button>
          )}
        </form>

        {booksList.length === 0 ? (
          <div className="empty-state">No books found in the library catalog.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Copies (Avail/Total)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {booksList.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{b.category}</td>
                  <td>{b.available_copies} / {b.total_copies}</td>
                  <td>
                    <button className="btn-sm btn-danger" onClick={() => handleDeleteClick(b)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              className="btn-sm btn-primary"
              disabled={page === 1}
              onClick={handlePrevPage}
              style={{ opacity: page === 1 ? 0.5 : 1 }}
            >
              Previous
            </button>
            <span style={{ color: 'var(--text-main)' }}>Page {page} of {totalPages}</span>
            <button
              className="btn-sm btn-primary"
              disabled={page === totalPages}
              onClick={handleNextPage}
              style={{ opacity: page === totalPages ? 0.5 : 1 }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {deletingBook && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Book</h3>
            <p>Are you sure you want to delete "<strong>{deletingBook.title}</strong>"? This will remove all copies and active reservations.</p>
            <div className="modal-actions">
              <button className="btn-sm" onClick={cancelDelete}>Cancel</button>
              <button className="btn-sm btn-danger" onClick={confirmDeleteBook}>Delete Book</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
