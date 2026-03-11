const API_URI = import.meta.env.VITE_API_URI || 'https://pickleball-backend-omega.vercel.app';

export const baseURL = `${API_URI}/api/v1`;
export const imageBaseURL = API_URI;

export const siteBaseURL = import.meta.env.VITE_BASIC_URI || 'https://pickleball-frontend-ten.vercel.app';