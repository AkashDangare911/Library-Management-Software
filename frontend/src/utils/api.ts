const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const getAllBooks = async () => {
  const token = localStorage.getItem("auth_token");
  const response = await fetch(`${apiUrl}/books`, {
    headers: token ? { "Authorization": `Bearer ${token}` } : {}
  });
  return response;
};

export const getBookByID = async (bookID: string) => {
  const token = localStorage.getItem("auth_token");
  const response = await fetch(`${apiUrl}/books/${bookID}`, {
    headers: token ? { "Authorization": `Bearer ${token}` } : {}
  });
  return response;
};
