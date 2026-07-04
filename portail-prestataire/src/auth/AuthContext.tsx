import React, { createContext, useContext, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAccount, getToken, setAccount as persistAccount, setToken as persistToken, clearToken, clearAccount } from '../api/client';
import type { PrestataireAccountInfo } from '../api/auth';

interface AuthContextValue {
  account: PrestataireAccountInfo | null;
  isAuthenticated: boolean;
  loginSuccess: (sessionToken: string, account: PrestataireAccountInfo) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccountState] = useState<PrestataireAccountInfo | null>(() => getAccount());

  const loginSuccess = (sessionToken: string, newAccount: PrestataireAccountInfo) => {
    persistToken(sessionToken);
    persistAccount(newAccount);
    setAccountState(newAccount);
  };

  const logout = () => {
    clearToken();
    clearAccount();
    setAccountState(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ account, isAuthenticated: !!getToken(), loginSuccess, logout }),
    [account]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider');
  }
  return ctx;
}

export const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
