import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearAuthToken,
  getAuthToken,
  getCurrentUser,
  loginAdmin,
  logoutAdmin,
  setAuthToken,
} from "../api/employeeApi";
import { AuthContext } from "./authContextValue";
import { useI18n } from "../i18n/i18n";

export const AuthProvider = ({ children }) => {
  const { t } = useI18n();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(Boolean(getAuthToken()));
  const [user, setUser] = useState(null);

  const permissions = useMemo(() => user?.permissions || [], [user]);
  const role = user?.role || "viewer";

  const can = useCallback(
    (permission) => permissions.includes(permission),
    [permissions],
  );

  const resetAuth = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getAuthToken()) {
      resetAuth();
      return null;
    }

    try {
      const res = await getCurrentUser();
      if (res.success) {
        setUser(res.user);
        setIsAuthenticated(true);
        return res.user;
      }

      resetAuth();
      return null;
    } catch {
      resetAuth();
      return null;
    }
  }, [resetAuth]);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(() => {
      if (!getAuthToken()) {
        resetAuth();
        if (isMounted) setAuthLoading(false);
        return;
      }

      refreshUser().finally(() => {
        if (isMounted) setAuthLoading(false);
      });
    });

    return () => {
      isMounted = false;
    };
  }, [refreshUser, resetAuth]);

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
      message: res.message || t("login.invalidCredentials"),
      errors: res.errors || {},
    };
  };

  const logout = async () => {
    if (getAuthToken()) {
      await logoutAdmin().catch(() => null);
    }

    resetAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        authLoading,
        can,
        isAuthenticated,
        login,
        logout,
        permissions,
        refreshUser,
        role,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
