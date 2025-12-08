import axios from 'axios';
import { OpenAPI } from './generated';

// Configure the base URL for API calls
OpenAPI.BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5163';

// Create axios instance with defaults
export const apiClient = axios.create({
  baseURL: OpenAPI.BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set the auth token for API calls
export function setAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    OpenAPI.TOKEN = token;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    OpenAPI.TOKEN = undefined;
  }
}

// Export all generated services and models
export * from './generated';

// Type aliases for convenience and backwards compatibility
export type {
  SessionResponse as TennisSession,
  StringResponse as TennisString,
  CreateSessionRequest as CreateTennisSessionRequest,
  CreateStringRequest as CreateTennisStringRequest,
  UpdateSessionRequest as UpdateTennisSessionRequest,
  UpdateStringRequest as UpdateTennisStringRequest,
} from './generated';
