import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export const getCases = () => axios.get(`${API_URL}/cases`);

export const getCaseIntelligence = (id) => axios.get(`${API_URL}/cases/${id}/intelligence`);

export const ingestOCR = (formData) => axios.post(`${API_URL}/cases/ingest/ocr`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const createCase = (payload, origin = 'MANUAL') => axios.post(`${API_URL}/cases`, { 
  payload, 
  origin 
});

export const updateCaseStatus = (id, payload) => axios.patch(`${API_URL}/cases/${id}/status`, payload);

export const escalateCase = (id) => axios.post(`${API_URL}/cases/${id}/escalate`);

export const downloadLegalPDF = (id) => axios.get(`${API_URL}/cases/${id}/download-legal`, { responseType: 'blob' });

export const generateAndSendLegalPDF = (caseId, institution) => axios.post(`${API_URL}/generate-legal`, { 
  case_id: caseId, 
  institution 
});
