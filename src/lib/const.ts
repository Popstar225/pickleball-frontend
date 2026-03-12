const API_URI = import.meta.env.VITE_API_URI || 'http://localhost:5000';

export const baseURL = `${API_URI}/api/v1`;
export const imageBaseURL = API_URI;

export const siteBaseURL = import.meta.env.VITE_BASIC_URI || 'http://localhost:8080';
