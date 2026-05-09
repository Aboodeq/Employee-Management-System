import { useEffect, useState } from "react";
import {
  clearAuthToken,
  getAuthToken,
  getCurrentUser,
  loginAdmin,
  logoutAdmin,
  setAuthToken,
} from "../api/employeeApi";
import { AuthContext } from "./authContextValue";

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(Boolean(getAuthToken()));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!getAuthToken()) {
      clearAuthToken();
      return;
    }

    getCurrentUser()
      .then((res) => {
        if (res.success) {
          setUser(res.user);
          setIsAuthenticated(true);
        } else {
          clearAuthToken();
          setUser(null);
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        clearAuthToken();
        setUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const login = async (username, password, remember = true) => {
    const res = await loginAdmin(username, password);

    if (res.success && res.token) {
      setAuthToken(res.token, remember);
      setUser(res.user || null);
      setIsAuthenticated(true);
      return { success: true };
    }

    return {
      success: false,
      message: res.message || "Invalid username or password.",
      errors: res.errors || {},
    };
  };

  const logout = async () => {
    if (getAuthToken()) {
      await logoutAdmin().catch(() => null);
    }

    clearAuthToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ authLoading, isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};
