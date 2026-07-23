const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const getAllBooks = async () => {
  const response = await fetch(`${apiUrl}/books`, {
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
};
