import axios from 'axios';
import { OpenAPI } from './generated';

// Configure the base URL for API calls
OpenAPI.BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5062';

// Create axios instance with defaults
export const apiClient = axios.create({
  baseURL: OpenAPI.BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export all generated services and models
export * from './generated';
