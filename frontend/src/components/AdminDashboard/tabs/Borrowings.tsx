import React, { useEffect, useState } from 'react';
import { fetchAllBorrowingsHistory } from '../../../utils/adminApi';
import { useToast } from '../../../context/ToastContext';
import type { Borrowing } from '../../../types';

export const Borrowings = () => {
  const { addToast } = useToast();

  const [borrowingsHistory, setBorrowingsHistory] = useState<Borrowing[]>([]);
  const [borrowingFilter, setBorrowingFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBorrowings = async () => {
      setLoading(true);
      try {
        const res = await fetchAllBorrowingsHistory();
        setBorrowingsHistory(res.data);
      } catch (err: any) {
        addToast(err.response?.data?.error || "Failed to load borrowings data", "error");
      } finally {
        setLoading(false);
      }
    };
    loadBorrowings();
  }, [addToast]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => setBorrowingFilter(e.target.value);

  const filteredHistory = borrowingFilter === 'ALL'
    ? borrowingsHistory
    : borrowingsHistory.filter(b => b.status.toUpperCase() === borrowingFilter);

  if (loading && borrowingsHistory.length === 0) return <div className="loading-state">Loading borrowings...</div>;

  return (
    <div className="admin-table-container">
      <div className="flex-between">
        <h2>Borrowings History</h2>
        <select
          value={borrowingFilter}
          onChange={handleFilterChange}
          style={{ padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-start)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
        >
          <option value="ALL">All Borrowings</option>
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="ISSUED">Issued</option>
          <option value="RETURNED">Returned</option>
          <option value="REJECTED">Rejected</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>
      {borrowingFilter === 'ALL' && borrowingsHistory.length === 0 ? (
        <div className="empty-state">No borrowing records found.</div>
      ) : filteredHistory.length === 0 ? (
        <div className="empty-state">No records found for the '{borrowingFilter}' status.</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Book</th>
              <th>User</th>
              <th>Status</th>
              <th>Borrow Date</th>
              <th>Return Date</th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.book_title}</td>
                <td>{b.user_name}</td>
                <td>
                  <span className={`status-badge ${b.status.toLowerCase()}`}>
                    {b.status}
                  </span>
                </td>
                <td>{new Date(b.borrow_date).toLocaleDateString()}</td>
                <td>{b.return_date ? new Date(b.return_date).toLocaleDateString() : '-'}</td>
                <td>₹{b.penalty_amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
