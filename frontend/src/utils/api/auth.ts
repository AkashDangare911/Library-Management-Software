import { apiUrl } from './config';

export const logoutUser = async () => {
  const response = await fetch(`${apiUrl}/auth/logout`, {
    method: 'POST',
    credentials: "include"
  });
  return response;
};

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
