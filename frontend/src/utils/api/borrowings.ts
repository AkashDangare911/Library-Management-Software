import { apiUrl } from './config';

export const requestBorrow = async (bookID: number) => {
  return await fetch(`${apiUrl}/borrowings/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookID }),
    credentials: "include"
  });
};

export const cancelBorrowRequest = async (borrowingID: number) => {
  return await fetch(`${apiUrl}/borrowings/${borrowingID}/cancel`, {
    method: 'PUT',
    credentials: "include"
  });
};

export const getMyBorrowings = async () => {
  return await fetch(`${apiUrl}/borrowings/me`, { credentials: "include" });
};

export const getAllBorrowings = async (status?: string) => {
  let url = `${apiUrl}/borrowings/all`;
  if (status) url += `?status=${status}`;
  return await fetch(url, { credentials: "include" });
};

export const acceptBorrowRequest = async (borrowingID: number) => {
  return await fetch(`${apiUrl}/borrowings/${borrowingID}/accept`, {
    method: 'PUT',
    credentials: "include"
  });
};

export const rejectBorrowRequest = async (borrowingID: number, reason: string) => {
  return await fetch(`${apiUrl}/borrowings/${borrowingID}/reject`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
    credentials: "include"
  });
};

export const issueBook = async (borrowingID: number) => {
  return await fetch(`${apiUrl}/borrowings/${borrowingID}/issue`, {
    method: 'PUT',
    credentials: "include"
  });
};

export const returnBook = async (borrowingID: number) => {
  return await fetch(`${apiUrl}/borrowings/${borrowingID}/return`, {
    method: 'PUT',
    credentials: "include"
  });
};
