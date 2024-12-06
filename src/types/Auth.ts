type AuthMethod = 'USERNAME_PASSWORD' | 'TAP_PATTERN' | 'COLOR_NUMBER';

interface AuthState {
  verifiedMethods: AuthMethod[];
  isAuthenticated: boolean;
  currentUser: string | null;
}

const initialAuthState: AuthState = {
  verifiedMethods: [],
  isAuthenticated: false,
  currentUser: null
}; 