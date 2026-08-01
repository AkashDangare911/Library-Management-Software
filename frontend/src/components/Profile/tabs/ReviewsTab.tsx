import React, { useEffect, useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchMyReviews, deleteReview } from '../../../utils/api';
import { useToast } from '../../../context/ToastContext';

import { GenericModal } from '../../common/GenericModal';

export const ReviewsTab = () => {
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleNavigateToBook = (bookId: number) => navigate(`/books/${bookId}`);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await fetchMyReviews();
        if (res.ok) {
          const data = await res.json();
          setMyReviews(data);
        }
      } catch (err) {
        console.error("Failed to load reviews", err);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, []);

  const confirmDeleteReview = async () => {
    if (!deletingReviewId) return;
    try {
      const res = await deleteReview(deletingReviewId);
      if (res.ok) {
        addToast('Review deleted successfully', 'success');
        setMyReviews(myReviews.filter(r => r.id !== deletingReviewId));
      } else {
        addToast('Failed to delete review', 'error');
      }
    } catch (err) {
      addToast('Failed to connect to server', 'error');
    } finally {
      setDeletingReviewId(null);
    }
  };

  const cancelDeleteReview = () => setDeletingReviewId(null);

  return (
    <div className="profile-panel fade-in">
      <h2><Star size={24} fill="var(--primary-color)" color="var(--primary-color)" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> My Reviews</h2>
      <p className="panel-subtitle">Manage all the reviews you have written.</p>

      {loading ? (
        <p>Loading your reviews...</p>
      ) : myReviews.length > 0 ? (
        <div className="profile-reviews-list">
          {myReviews.map((review) => (
            <div key={review.id} className="profile-review-card" onClick={() => handleNavigateToBook(review.book_id)}>
              <div className="profile-review-header">
                <div className="profile-review-book-info">
                  <h3 className="profile-review-book-title">{review.book_title}</h3>
                  <p className="profile-review-book-author">By {review.book_author}</p>
                  <div className="profile-review-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} fill={star <= review.rating ? "#fbbf24" : "transparent"} color={star <= review.rating ? "#fbbf24" : "var(--text-muted)"} />
                    ))}
                  </div>
                </div>
                <div className="profile-review-meta">
                  <span className="profile-review-date">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingReviewId(review.id);
                    }}
                    className="profile-review-delete-btn"
                    title="Delete Review"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              {review.comment && (
                <p className="profile-review-comment">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="profile-placeholder">
          <p>You haven't written any reviews yet.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <GenericModal
        isOpen={!!deletingReviewId}
        onClose={cancelDeleteReview}
        title="Delete Review"
        onConfirm={confirmDeleteReview}
        confirmText="Delete"
        confirmButtonClass="borrow-btn"
        cancelButtonClass="back-btn"
      >
        <p>Are you sure you want to delete this review? This action cannot be undone.</p>
      </GenericModal>
    </div>
  );
};
