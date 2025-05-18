export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'owner' | 'tenant';
  phone?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: any) => Promise<void>;
  isAuthenticated: boolean;
} 