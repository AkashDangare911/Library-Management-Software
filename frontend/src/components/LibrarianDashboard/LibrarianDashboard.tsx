import React, { useEffect, useState } from 'react';
import { getAllBorrowings, acceptBorrowRequest, rejectBorrowRequest, issueBook, returnBook } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { BorrowStatus } from '../../types/BorrowStatus';
import { GenericModal } from '../common/GenericModal';
import './librarianDashboard.css';

interface Borrowing {
  id: number;
  user_id: number;
  book_id: number;
  borrow_date: string;
  due_date: string | null;
  return_date: string | null;
  status: BorrowStatus;
  accepted_at: string | null;
  rejection_reason: string | null;
  penalty_amount: number;
  book_title: string;
  user_name: string;
  user_email: string;
}

export const LibrarianDashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<BorrowStatus.PENDING | BorrowStatus.ACCEPTED | BorrowStatus.ISSUED>(BorrowStatus.PENDING);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);

  // Reject modal state
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Generic confirm modal state
  const [confirmingAction, setConfirmingAction] = useState<{ id: number, action: 'accept' | 'issue' | 'return', userName: string } | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'librarian' && user.role !== 'admin'))) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      const res = await getAllBorrowings(activeTab);
      setBorrowings(res.data);
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch borrowings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'librarian' || user.role === 'admin')) {
      fetchBorrowings();
    }
  }, [activeTab, user]);

  const handleAccept = async (id: number) => {
    try {
      await acceptBorrowRequest(id);
      addToast("Request accepted! Book reserved for 24 hours.", "success");
      fetchBorrowings();
    } catch (err: any) {
      addToast(err.response?.data?.error || "Error accepting request", "error");
    } finally {
      setConfirmingAction(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingId || !rejectReason.trim()) {
      addToast("Please provide a reason", "error");
      return;
    }
    try {
      await rejectBorrowRequest(rejectingId, rejectReason);
      addToast("Request rejected.", "success");
      setRejectingId(null);
      setRejectReason("");
      fetchBorrowings();
    } catch (err: any) {
      addToast(err.response?.data?.error || "Error rejecting request", "error");
    }
  };

  const handleIssue = async (id: number) => {
    try {
      await issueBook(id);
      addToast("Book issued successfully.", "success");
      fetchBorrowings();
    } catch (err: any) {
      addToast(err.response?.data?.error || "Error issuing book", "error");
    } finally {
      setConfirmingAction(null);
    }
  };

  const handleReturn = async (id: number) => {
    try {
      const res = await returnBook(id);
      const data = res.data;
      if (data.isOverdue) {
        addToast(`Book returned. Penalty collected: ₹${data.penalty}`, "success");
      } else {
        addToast("Book returned successfully.", "success");
      }
      fetchBorrowings();
    } catch (err: any) {
      addToast(err.response?.data?.error || "Error returning book", "error");
    } finally {
      setConfirmingAction(null);
    }
  };

  if (isLoading || !user) return <div className="loading-state">Loading...</div>;

  return (
    <div className="librarian-dashboard">
      <div className="dashboard-header">
        <h1>Librarian Hub</h1>
        <p>Manage borrow requests and active book circulations</p>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === BorrowStatus.PENDING ? 'active' : ''}`}
          onClick={() => setActiveTab(BorrowStatus.PENDING)}
        >
          Pending Requests
        </button>
        <button 
          className={`tab-btn ${activeTab === BorrowStatus.ACCEPTED ? 'active' : ''}`}
          onClick={() => setActiveTab(BorrowStatus.ACCEPTED)}
        >
          Awaiting Collection
        </button>
        <button 
          className={`tab-btn ${activeTab === BorrowStatus.ISSUED ? 'active' : ''}`}
          onClick={() => setActiveTab(BorrowStatus.ISSUED)}
        >
          Active Borrowings
        </button>
      </div>

      <div className="dashboard-content">
        {loading ? (
          <div className="loading-state">Loading data...</div>
        ) : borrowings.length === 0 ? (
          <div className="empty-state">No records found for this category.</div>
        ) : (
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Request Date</th>
                  {activeTab === BorrowStatus.ACCEPTED && <th>Accepted On</th>}
                  {activeTab === BorrowStatus.ISSUED && <th>Due Date</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrowings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <Link to={`/books/${b.book_id}`} className="dashboard-book-link">
                        {b.book_title}
                      </Link>
                    </td>
                    <td>{b.user_name}</td>
                    <td>{b.user_email}</td>
                    <td>{new Date(b.borrow_date).toLocaleDateString()}</td>
                    {activeTab === BorrowStatus.ACCEPTED && <td>{b.accepted_at ? new Date(b.accepted_at).toLocaleString() : '-'}</td>}
                    {activeTab === BorrowStatus.ISSUED && <td>{b.due_date ? new Date(b.due_date).toLocaleDateString() : '-'}</td>}
                    <td className="action-cell">
                      {activeTab === BorrowStatus.PENDING && (
                        <>
                          <button className="action-btn accept" onClick={() => setConfirmingAction({ id: b.id, action: 'accept', userName: b.user_name })}>Accept</button>
                          <button className="action-btn reject" onClick={() => setRejectingId(b.id)}>Reject</button>
                        </>
                      )}
                      {activeTab === BorrowStatus.ACCEPTED && (
                        <button className="action-btn issue" onClick={() => setConfirmingAction({ id: b.id, action: 'issue', userName: b.user_name })}>Issue Book</button>
                      )}
                      {activeTab === BorrowStatus.ISSUED && (
                        <button className="action-btn return" onClick={() => setConfirmingAction({ id: b.id, action: 'return', userName: b.user_name })}>Mark Returned</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <GenericModal
        isOpen={!!rejectingId}
        onClose={() => setRejectingId(null)}
        title="Reject Borrow Request"
        onConfirm={handleRejectSubmit}
        confirmText="Submit Rejection"
        confirmButtonClass="action-btn reject"
        cancelButtonClass="action-btn cancel"
      >
        <p>Please provide a reason for rejecting this request.</p>
        <textarea 
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="E.g., Book is currently reserved for faculty..."
          className="modal-textarea"
        />
      </GenericModal>

      {/* Confirm Action Modal */}
      <GenericModal
        isOpen={!!confirmingAction}
        onClose={() => setConfirmingAction(null)}
        title="Confirm Action"
        onConfirm={() => {
          if (confirmingAction) {
            if (confirmingAction.action === 'accept') handleAccept(confirmingAction.id);
            else if (confirmingAction.action === 'issue') handleIssue(confirmingAction.id);
            else if (confirmingAction.action === 'return') handleReturn(confirmingAction.id);
          }
          setConfirmingAction(null);
        }}
        confirmText={`Confirm ${confirmingAction?.action}`}
        confirmButtonClass={`action-btn ${confirmingAction?.action}`}
        cancelButtonClass="action-btn cancel"
      >
        <p>
          Are you sure you want to {confirmingAction?.action} the request for <strong>{confirmingAction?.userName}</strong>?
        </p>
      </GenericModal>
    </div>
  );
};
