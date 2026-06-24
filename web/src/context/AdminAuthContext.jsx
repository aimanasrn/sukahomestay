import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

const STORAGE_KEY = "sukahomestay_admin_token";
const AdminAuthContext = createContext(null);

async function parseJsonResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error?.message || "Request failed");
  }

  return data;
}

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(localStorage.getItem(STORAGE_KEY)));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await fetch(`${API_URL}/admin/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await parseJsonResponse(response);

        if (!cancelled) {
          setUser(data.user);
        }
      } catch (_error) {
        if (!cancelled) {
          localStorage.removeItem(STORAGE_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (credentials) => {
    const response = await fetch(`${API_URL}/admin/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await parseJsonResponse(response);
    localStorage.setItem(STORAGE_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    setIsLoading(false);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const authFetch = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return parseJsonResponse(response);
  }, [token]);

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        logout,
        authFetch,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return context;
}
