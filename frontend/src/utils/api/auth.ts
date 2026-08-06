import { axiosClient } from './axiosClient';

export const logoutUser = async () => {
  return await axiosClient.post(`/auth/logout`);
};

export const resetPassword = async (currentPassword: string, newPassword: string) => {
  return await axiosClient.put(`/auth/reset-password`, { currentPassword, newPassword });
};
