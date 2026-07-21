// Base URL of the backend API.
// Set VITE_API_URL at build time (e.g. https://your-backend.up.railway.app).
// Falls back to the local backend for development.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
