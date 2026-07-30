export const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const getAllBooks = async (params?: Record<string, string>) => {
  let url = `${apiUrl}/books`;
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    console.log('querystring', queryString);
  }
  console.log("Url", url);
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

export const logoutUser = async () => {
  const response = await fetch(`${apiUrl}/auth/logout`, {
    method: 'POST',
    credentials: "include"
  });
  return response;
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

// --- Auth API ---
export const resetPassword = async (currentPassword: string, newPassword: string) => {
  const url = `${apiUrl}/auth/reset-password`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
    credentials: "include"
  });
  return response;
};

// --- Borrowings API ---
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
