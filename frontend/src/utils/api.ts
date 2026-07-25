const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

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
};
