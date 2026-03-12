const isProd = import.meta.env.PROD;

export const baseURL = true
  ? 'https://pickleball-backend-omega.vercel.app/api/v1'
  : (import.meta.env.VITE_API_URI ?? 'http://localhost:5000/api/v1');

export const imageBaseURL = true
  ? 'https://pickleball-backend-omega.vercel.app'
  : 'http://localhost:5000';
