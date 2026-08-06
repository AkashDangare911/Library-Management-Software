import { axiosClient } from './axiosClient';

export const getAllBooks = async (params?: Record<string, string>) => {
  return await axiosClient.get(`/books`, { params });
};

export const getBookByID = async (bookID: string) => {
  return await axiosClient.get(`/books/${bookID}`);
};

// --- Favorites API ---

export const getFavorites = async () => {
  return await axiosClient.get(`/books/me/favorites`);
};

export const toggleFavorite = async (bookID: number) => {
  return await axiosClient.post(`/books/${bookID}/favorite`);
};

// --- Wishlist API ---

export const getWishlist = async () => {
  return await axiosClient.get(`/books/me/wishlist`);
};

export const toggleWishlist = async (bookID: number) => {
  return await axiosClient.post(`/books/${bookID}/wishlist`);
};
