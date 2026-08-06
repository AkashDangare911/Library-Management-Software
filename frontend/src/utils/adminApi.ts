import { axiosClient } from './api/axiosClient';

// Users
export const fetchAllUsers = async () => {
  return await axiosClient.get(`/users`);
};

export const updateUserRole = async (userId: number, role: string) => {
  return await axiosClient.put(`/users/${userId}/role`, { role });
};

export const deleteUser = async (userId: number) => {
  return await axiosClient.delete(`/users/${userId}`);
};

// Admin Stats & Settings
export const fetchAdminStats = async () => {
  return await axiosClient.get(`/admin/stats`);
};

export const fetchAdminSettings = async () => {
  return await axiosClient.get(`/admin/settings`);
};

export const updateAdminSettings = async (settings: any) => {
  return await axiosClient.put(`/admin/settings`, settings);
};

export const fetchAllBorrowingsHistory = async () => {
  return await axiosClient.get(`/admin/borrowings`);
};

export const getBookBorrowingHistory = async (bookId: string) => {
  return await axiosClient.get(`/borrowings/book/${bookId}`);
};

// Books (Admin & Librarian)
export const addBook = async (bookData: any) => {
  return await axiosClient.post(`/books`, bookData);
};

export const updateBook = async (bookId: number, bookData: any) => {
  return await axiosClient.put(`/books/${bookId}`, bookData);
};

export const deleteBook = async (bookId: number) => {
  return await axiosClient.delete(`/books/${bookId}`);
};
