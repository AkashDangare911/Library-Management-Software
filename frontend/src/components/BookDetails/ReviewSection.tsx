import React, { useState, useEffect } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { fetchReviewsByBook, addReview, deleteReview } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { GenericModal } from '../common/GenericModal';
import type { Review } from '../../types';

interface ReviewSectionProps {
  bookId: number;
  hasBorrowed: boolean;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ bookId, hasBorrowed }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { addToast } = useToast();

  const loadReviews = async () => {
    try {
      const res = await fetchReviewsByBook(bookId);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [bookId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      addToast("Please select a rating", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addReview(bookId, rating, comment);
      const data = await res.json();

      if (res.ok) {
        addToast(data.message, "success");
        setShowForm(false);
        setComment('');
        setRating(5);
        loadReviews();
      } else {
        addToast(data.message || "Failed to add review", "error");
      }
    } catch (error) {
      addToast("Failed to connect to server", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  const handleToggleForm = () => setShowForm(!showForm);

  const confirmDelete = async () => {
    if (!deletingReviewId) return;
    
    try {
      const res = await deleteReview(deletingReviewId);
      const data = await res.json();
      
      if (res.ok) {
        addToast(data.message, "success");
        loadReviews();
      } else {
        addToast(data.message || "Failed to delete review", "error");
      }
    } catch (error) {
      addToast("Failed to connect to server", "error");
    } finally {
      setDeletingReviewId(null);
    }
  };

  const cancelDelete = () => setDeletingReviewId(null);

  const userHasReviewed = reviews.some(r => r.user_id === user?.id);

  return (
    <details className="review-section-container fade-in" open>
      <summary className="review-summary">
        Reviews ({reviews.length})
      </summary>

      <div className="review-btn-container">
        {user?.role === 'member' && hasBorrowed && !userHasReviewed && (
          <button 
            className="borrow-btn"
            onClick={handleToggleForm}
          >
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="review-form">
          <div className="review-form-group">
            <label className="review-form-label">Rating</label>
            <div className="review-form-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={24}
                  onClick={() => setRating(star)}
                  fill={star <= rating ? "#fbbf24" : "transparent"}
                  color={star <= rating ? "#fbbf24" : "var(--text-muted)"}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>
          </div>
          <div className="review-form-group">
            <label className="review-form-label">Comment (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="review-form-textarea"
              placeholder="What did you think about this book?"
            />
          </div>
          <button 
            type="submit" 
            className="borrow-btn"
            disabled={isSubmitting}
            style={{ opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="review-loading">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="review-empty">
          No reviews yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-card-header">
                <div>
                  <div className="review-user-info">
                    <div className="review-avatar">
                      {review.user_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h4 className="review-author-name">{review.user_name || 'User'}</h4>
                      <div className="review-form-stars" style={{ marginTop: '2px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={14} fill={star <= review.rating ? "#fbbf24" : "transparent"} color={star <= review.rating ? "#fbbf24" : "var(--text-muted)"} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="review-date-container">
                  <span className="review-date">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                  {(user?.id === review.user_id || user?.role === 'admin' || user?.role === 'librarian') && (
                    <button 
                      onClick={() => setDeletingReviewId(review.id)}
                      className="review-delete-btn"
                      title="Delete Review"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              {review.comment && (
                <p className="review-comment">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <GenericModal
        isOpen={!!deletingReviewId}
        onClose={cancelDelete}
        title="Delete Review"
        onConfirm={confirmDelete}
        confirmText="Delete"
        confirmButtonClass="borrow-btn"
        cancelButtonClass="back-btn"
      >
        <p>Are you sure you want to delete this review? This action cannot be undone.</p>
      </GenericModal>
    </details>
  );
};
