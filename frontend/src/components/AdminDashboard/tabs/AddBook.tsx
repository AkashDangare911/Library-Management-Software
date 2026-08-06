import React, { useState } from 'react';
import { addBook } from '../../../utils/adminApi';
import { useToast } from '../../../context/ToastContext';
import { GenericModal } from '../../common/GenericModal';

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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewBook({...newBook, title: e.target.value});
  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewBook({...newBook, author: e.target.value});
  const handleIsbnChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewBook({...newBook, isbn: e.target.value});
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewBook({...newBook, category: e.target.value});
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setNewBook({...newBook, description: e.target.value});
  
  const decrementCopies = () => setNewBook(prev => ({...prev, total_copies: Math.max(1, prev.total_copies - 1)}));
  const incrementCopies = () => setNewBook(prev => ({...prev, total_copies: prev.total_copies + 1}));
  
  const cancelAddBook = () => setConfirmingAddBook(false);

  const confirmAddBook = async () => {
    try {
      await addBook(newBook);
      addToast("Book added successfully", "success");
      setNewBook({ title: '', author: '', isbn: '', description: '', category: '', total_copies: 1 });
      onSuccess();
    } catch (err: any) {
      addToast(err.response?.data?.error || "Error adding book", "error");
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
            <input required type="text" value={newBook.title} onChange={handleTitleChange} />
          </div>
          <div className="form-group">
            <label>Author <span className="req">*</span></label>
            <input required type="text" value={newBook.author} onChange={handleAuthorChange} />
          </div>
          <div className="form-group">
            <label>ISBN <span className="req">*</span></label>
            <input required type="text" value={newBook.isbn} onChange={handleIsbnChange} />
          </div>
          <div className="form-group">
            <label>Category <span className="req">*</span></label>
            <input required type="text" value={newBook.category} onChange={handleCategoryChange} />
          </div>
          <div className="form-group">
            <label>Description <span className="req">*</span></label>
            <textarea required rows={4} value={newBook.description} onChange={handleDescriptionChange} />
          </div>
          <div className="form-group">
            <label>Total Copies <span className="req">*</span></label>
            <div className="copies-counter">
              <button type="button" onClick={decrementCopies}>-</button>
              <span className="count-display">{newBook.total_copies}</span>
              <button type="button" onClick={incrementCopies}>+</button>
            </div>
          </div>
        </div>
        <button type="submit" className="btn-submit">Save Book</button>
      </form>

      {confirmingAddBook && (
        <GenericModal
          isOpen={confirmingAddBook}
          onClose={cancelAddBook}
          title="Confirm Book Addition"
          onConfirm={confirmAddBook}
          confirmText="Add Book"
          confirmButtonClass="btn-sm btn-primary"
          cancelButtonClass="btn-sm"
        >
          <p>Are you sure you want to add <strong>{newBook.title}</strong> to the library catalog with <strong>{newBook.total_copies}</strong> copies?</p>
        </GenericModal>
      )}
    </>
  );
};
