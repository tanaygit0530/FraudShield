import axios from 'axios';

const API_URL = 'http://localhost:5001/api/admin';

export const getAnalytics = () => axios.get(`${API_URL}/analytics`);

export const getAuditLogs = () => axios.get(`${API_URL}/audit-logs`);
