import api from './api';

export interface AuthUser {
  id: string;
  username: string;
  role: 'operator' | 'maintenance' | 'manager';
}

export interface AuthResponse {
  token: string;
  session: {
    user: AuthUser;
  };
}

export const authService = {
  /**
   * Registers a new user inside the SQLite database on the backend.
   */
  signup: async (username: string, password: string, role: string): Promise<AuthResponse> => {
    return api.post('/auth/signup', { username, password, role });
  },

  /**
   * Logs in an existing user from the SQLite database.
   */
  login: async (username: string, password: string): Promise<AuthResponse> => {
    return api.post('/auth/login', { username, password });
  },
};
