const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
});

const defaultFetchOpts = {
  credentials: "include" as RequestCredentials,
};

// Users
export const fetchAllUsers = async () => {
  return await fetch(`${API_URL}/users`, { ...defaultFetchOpts });
};

export const updateUserRole = async (userId: number, role: string) => {
  return await fetch(`${API_URL}/users/${userId}/role`, {
    ...defaultFetchOpts,
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ role }),
  });
};

export const deleteUser = async (userId: number) => {
  return await fetch(`${API_URL}/users/${userId}`, {
    ...defaultFetchOpts,
    method: "DELETE",
  });
};

// Admin Stats & Settings
export const fetchAdminStats = async () => {
  return await fetch(`${API_URL}/admin/stats`, { ...defaultFetchOpts });
};

export const fetchAdminSettings = async () => {
  return await fetch(`${API_URL}/admin/settings`, { ...defaultFetchOpts });
};

export const updateAdminSettings = async (settings: any) => {
  return await fetch(`${API_URL}/admin/settings`, {
    ...defaultFetchOpts,
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(settings),
  });
};

export const fetchAllBorrowingsHistory = async () => {
  return await fetch(`${API_URL}/admin/borrowings`, { ...defaultFetchOpts });
};

export const getBookBorrowingHistory = async (bookId: string) => {
  return await fetch(`${API_URL}/borrowings/book/${bookId}`, { ...defaultFetchOpts });
};

// Books (Admin & Librarian)
export const addBook = async (bookData: any) => {
  return await fetch(`${API_URL}/books`, {
    ...defaultFetchOpts,
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(bookData),
  });
};

export const updateBook = async (bookId: number, bookData: any) => {
  return await fetch(`${API_URL}/books/${bookId}`, {
    ...defaultFetchOpts,
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(bookData),
  });
};

export const deleteBook = async (bookId: number) => {
  return await fetch(`${API_URL}/books/${bookId}`, {
    ...defaultFetchOpts,
    method: "DELETE",
  });
};
