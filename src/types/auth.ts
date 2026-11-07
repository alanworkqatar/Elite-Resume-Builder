export interface UserAccount {
  id: string;
  fullName: string; // Mandatory
  email: string;    // Mandatory
  headline?: string;
  createdAt: string;
  lastLogin: string;
}

export interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
}
