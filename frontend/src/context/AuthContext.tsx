import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { login as apiLogin, verifyToken, getCurrentUser, setAuthToken, getAuthToken, removeAuthToken, LoginCredentials, VerifyTokenResponse } from '@/apiClient/authApi';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  user: VerifyTokenResponse['user'] | null;
  permissions: string[];
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<VerifyTokenResponse['user'] | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  
  const navigate = useNavigate();

  // Check if the user is already authenticated on page load
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await verifyToken(token);
        if (response.valid) {
          setUser(response.user);
          setIsAuthenticated(true);
          setPermissions(response.permissions || []);
        } else {
          removeAuthToken();
        }
      } catch (error) {
        removeAuthToken();
        setError('Session expired. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiLogin(credentials);
      setAuthToken(response.token);
      
      // Get more detailed user info
      const userInfoResponse = await getCurrentUser(response.token);
      setUser(userInfoResponse.user);
      setIsAuthenticated(true);
      setPermissions(userInfoResponse.permissions || []);
      
      // Redirect to home page after successful login
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Login failed');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setUser(null);
    setPermissions([]);
    navigate('/login');
  };

  const value = {
    isAuthenticated,
    user,
    permissions,
    login,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 