import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMyBorrowings } from '../../../utils/api';
import { BorrowStatus } from '../../../types/BorrowStatus';
import type { Borrowing } from '../../../types';

export const BorrowingsTab = () => {
  const [myBorrowings, setMyBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleNavigateToBook = (bookId: number) => navigate(`/books/${bookId}`);
  const handleBrowseBooks = () => navigate('/books');

  useEffect(() => {
    const fetchBorrowings = async () => {
      try {
        const res = await getMyBorrowings();
        if (res.ok) {
          const data = await res.json();
          setMyBorrowings(data);
        }
      } catch (err) {
        console.error("Failed to load borrowings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBorrowings();
  }, []);

  return (
    <div className="profile-panel fade-in">
      <h2><BookOpen size={24} color="var(--primary-color)" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> My Borrowings</h2>
      <p className="panel-subtitle">Track your borrow requests, active circulations, and past history.</p>

      {loading ? (
        <p>Loading your borrowings...</p>
      ) : myBorrowings.length > 0 ? (
        <div className="borrowings-container">
          {[BorrowStatus.ISSUED, BorrowStatus.OVERDUE].some(s => myBorrowings.some(b => b.status === s)) && (
            <details className="borrowings-details" open>
              <summary className="borrowings-summary">Active Borrowings</summary>
              <div className="borrowings-grid">
                {myBorrowings.filter(b => [BorrowStatus.ISSUED, BorrowStatus.OVERDUE].includes(b.status as BorrowStatus)).map((b) => (
                  <div key={b.id} className="borrowing-card">
                    <div className="borrowing-card-header">
                      <h3 style={{ cursor: 'pointer' }} onClick={() => handleNavigateToBook(b.book_id)}>{b.title}</h3>
                      <span className={`status-badge ${b.status}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="borrowing-card-details">
                      <p><strong>Request Date:</strong> {new Date(b.borrow_date).toLocaleDateString()}</p>
                      {b.due_date && <p><strong>Due Date:</strong> {new Date(b.due_date).toLocaleDateString()}</p>}
                      {b.penalty_amount > 0 && (
                        <div className="penalty-tag">Penalty: ₹{b.penalty_amount}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}

          {[BorrowStatus.PENDING, BorrowStatus.ACCEPTED].some(s => myBorrowings.some(b => b.status === s)) && (
            <details className="borrowings-details" open>
              <summary className="borrowings-summary">Pending Requests</summary>
              <div className="borrowings-grid">
                {myBorrowings.filter(b => [BorrowStatus.PENDING, BorrowStatus.ACCEPTED].includes(b.status as BorrowStatus)).map((b) => (
                  <div key={b.id} className="borrowing-card">
                    <div className="borrowing-card-header">
                      <h3 style={{ cursor: 'pointer' }} onClick={() => handleNavigateToBook(b.book_id)}>{b.title}</h3>
                      <span className={`status-badge ${b.status}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="borrowing-card-details">
                      <p><strong>Request Date:</strong> {new Date(b.borrow_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}

          {[BorrowStatus.RETURNED, BorrowStatus.REJECTED, BorrowStatus.REVOKED, BorrowStatus.CANCELLED].some(s => myBorrowings.some(b => b.status === s)) && (
            <details className="borrowings-details" open>
              <summary className="borrowings-summary">History</summary>
              <div className="borrowings-grid">
                {myBorrowings.filter(b => [BorrowStatus.RETURNED, BorrowStatus.REJECTED, BorrowStatus.REVOKED, BorrowStatus.CANCELLED].includes(b.status as BorrowStatus)).map((b) => (
                  <div key={b.id} className="borrowing-card">
                    <div className="borrowing-card-header">
                      <h3 style={{ cursor: 'pointer' }} onClick={() => handleNavigateToBook(b.book_id)}>{b.title}</h3>
                      <span className={`status-badge ${b.status}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="borrowing-card-details">
                      <p><strong>Request Date:</strong> {new Date(b.borrow_date).toLocaleDateString()}</p>
                      {b.penalty_amount > 0 && (
                        <div className="penalty-tag">Penalty: ₹{b.penalty_amount}</div>
                      )}
                      {b.status === BorrowStatus.REJECTED && b.rejection_reason && (
                        <p style={{ color: '#b91c1c', marginTop: '0.5rem', fontStyle: 'italic' }}>Reason: {b.rejection_reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      ) : (
        <div className="profile-placeholder">
          <p>You haven't requested any books yet.</p>
          <button className="borrow-btn" onClick={handleBrowseBooks} style={{ marginTop: '1rem' }}>Browse Books</button>
        </div>
      )}
    </div>
  );
};
