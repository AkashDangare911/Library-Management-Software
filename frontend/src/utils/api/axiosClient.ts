import axios from 'axios';
import { apiUrl } from './config';

export const axiosClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
