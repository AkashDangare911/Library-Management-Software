import React, { useState } from 'react';
import { addBook } from '../../../utils/adminApi';
import { useToast } from '../../../context/ToastContext';

interface AddBookProps {
  onSuccess: () => void;
}

export const AddBook: React.FC<AddBookProps> = ({ onSuccess }) => {
  const { addToast } = useToast();
  
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', description: '', category: '', total_copies: 1 });
  const [confirmingAddBook, setConfirmingAddBook] = useState(false);

  const handleAddBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmingAddBook(true);
  };

  const confirmAddBook = async () => {
    try {
      const res = await addBook(newBook);
      if (res.ok) {
        addToast("Book added successfully", "success");
        setNewBook({ title: '', author: '', isbn: '', description: '', category: '', total_copies: 1 });
        onSuccess();
      } else {
        const data = await res.json();
        addToast(data.error || "Failed to add book", "error");
      }
    } catch (err) {
      addToast("Error adding book", "error");
    } finally {
      setConfirmingAddBook(false);
    }
  };

  return (
    <>
      <form className="settings-form" onSubmit={handleAddBookSubmit}>
        <div className="flex-between">
          <h2>Add New Book</h2>
        </div>
        <div className="add-book-grid">
          <div className="form-group">
            <label>Title <span className="req">*</span></label>
            <input required type="text" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Author <span className="req">*</span></label>
            <input required type="text" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} />
          </div>
          <div className="form-group">
            <label>ISBN <span className="req">*</span></label>
            <input required type="text" value={newBook.isbn} onChange={e => setNewBook({...newBook, isbn: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Category <span className="req">*</span></label>
            <input required type="text" value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Description <span className="req">*</span></label>
            <textarea required rows={4} value={newBook.description} onChange={e => setNewBook({...newBook, description: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Total Copies <span className="req">*</span></label>
            <div className="copies-counter">
              <button type="button" onClick={() => setNewBook(prev => ({...prev, total_copies: Math.max(1, prev.total_copies - 1)}))}>-</button>
              <span className="count-display">{newBook.total_copies}</span>
              <button type="button" onClick={() => setNewBook(prev => ({...prev, total_copies: prev.total_copies + 1}))}>+</button>
            </div>
          </div>
        </div>
        <button type="submit" className="btn-submit">Save Book</button>
      </form>

      {confirmingAddBook && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Book Addition</h3>
            <p>Are you sure you want to add <strong>{newBook.title}</strong> to the library catalog with <strong>{newBook.total_copies}</strong> copies?</p>
            <div className="modal-actions">
              <button className="btn-sm" onClick={() => setConfirmingAddBook(false)}>Cancel</button>
              <button className="btn-sm btn-primary" onClick={confirmAddBook}>Add Book</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
