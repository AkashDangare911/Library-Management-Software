import { apiUrl } from './config';

export const getAllBooks = async (params?: Record<string, string>) => {
  let url = `${apiUrl}/books`;
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  const response = await fetch(url, {
    credentials: "include"
  });
  return response;
};

export const getBookByID = async (bookID: string) => {
  const response = await fetch(`${apiUrl}/books/${bookID}`, {
    credentials: "include"
  });
  return response;
};

// --- Favorites API ---

export const getFavorites = async () => {
  const url = `${apiUrl}/books/me/favorites`;
  const response = await fetch(url, {
    credentials: "include"
  });
  return response;
};

export const toggleFavorite = async (bookID: number) => {
  const url = `${apiUrl}/books/${bookID}/favorite`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include"
  });
  return response;
};

// --- Wishlist API ---

export const getWishlist = async () => {
  const url = `${apiUrl}/books/me/wishlist`;
  const response = await fetch(url, {
    credentials: "include"
  });
  return response;
};

export const toggleWishlist = async (bookID: number) => {
  const url = `${apiUrl}/books/${bookID}/wishlist`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include"
  });
  return response;
};
