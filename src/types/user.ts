export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'owner' | 'tenant' | 'service-provider';
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  serviceCategory?: string; // For service providers
  serviceAreas?: string[]; // For service providers
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  updateUserProfile: (data: any) => Promise<void>;
  isAuthenticated: boolean;
  authInitialized: boolean;
}