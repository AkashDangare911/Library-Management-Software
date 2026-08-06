import { axiosClient } from './axiosClient';

export const requestBorrow = async (bookID: number) => {
  return await axiosClient.post(`/borrowings/request`, { bookID });
};

export const cancelBorrowRequest = async (borrowingID: number) => {
  return await axiosClient.put(`/borrowings/${borrowingID}/cancel`);
};

export const getMyBorrowings = async () => {
  return await axiosClient.get(`/borrowings/me`);
};

export const getAllBorrowings = async (status?: string) => {
  return await axiosClient.get(`/borrowings/all`, { params: status ? { status } : undefined });
};

export const acceptBorrowRequest = async (borrowingID: number) => {
  return await axiosClient.put(`/borrowings/${borrowingID}/accept`);
};

export const rejectBorrowRequest = async (borrowingID: number, reason: string) => {
  return await axiosClient.put(`/borrowings/${borrowingID}/reject`, { reason });
};

export const issueBook = async (borrowingID: number) => {
  return await axiosClient.put(`/borrowings/${borrowingID}/issue`);
};

export const returnBook = async (borrowingID: number) => {
  return await axiosClient.put(`/borrowings/${borrowingID}/return`);
};
