const isProd = import.meta.env.PROD;

export const baseURL = isProd
  ? 'https://pickleball-backend-omega.vercel.app/api/v1'
  : (import.meta.env.VITE_API_URI ?? 'http://localhost:5000/api/v1');

export const imageBaseURL = isProd
  ? 'https://pickleball-backend-omega.vercel.app'
  : 'http://localhost:5000';