import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export const generateOTP = (phone) => axios.post(`${API_URL}/otp/generate`, { phone });

export const verifyOTP = (phone, code) => axios.post(`${API_URL}/otp/verify`, { phone, code });
