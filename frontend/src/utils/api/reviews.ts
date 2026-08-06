import { axiosClient } from './axiosClient';

export const fetchReviewsByBook = async (bookID: number) => {
  return await axiosClient.get(`/reviews/book/${bookID}`);
};

export const fetchMyReviews = async () => {
  return await axiosClient.get(`/reviews/me`);
};

export const addReview = async (bookID: number, rating: number, comment: string) => {
  return await axiosClient.post(`/reviews/book/${bookID}`, { rating, comment });
};

export const deleteReview = async (reviewID: number) => {
  return await axiosClient.delete(`/reviews/${reviewID}`);
};
