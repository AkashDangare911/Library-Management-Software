import { apiUrl } from './config';

export const fetchReviewsByBook = async (bookID: number) => {
  return await fetch(`${apiUrl}/reviews/book/${bookID}`, {
    credentials: "include"
  });
};

export const fetchMyReviews = async () => {
  return await fetch(`${apiUrl}/reviews/me`, {
    credentials: "include"
  });
};

export const addReview = async (bookID: number, rating: number, comment: string) => {
  return await fetch(`${apiUrl}/reviews/book/${bookID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, comment }),
    credentials: "include"
  });
};

export const deleteReview = async (reviewID: number) => {
  return await fetch(`${apiUrl}/reviews/${reviewID}`, {
    method: 'DELETE',
    credentials: "include"
  });
};
