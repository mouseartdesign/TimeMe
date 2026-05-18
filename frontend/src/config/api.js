import axios from 'axios';

// Create a centralized Axios instance
// In development, it uses the Vite proxy (relative URLs like /api/...)
// In production, it uses the deployed backend URL from environment variables
const baseURL = import.meta.env.MODE === 'production' 
  ? 'https://timeme.onrender.com' 
  : ''; // Use empty string in dev to let Vite proxy handle it

const api = axios.create({
  baseURL: baseURL,
});

export default api;
