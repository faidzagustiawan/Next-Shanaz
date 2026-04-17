'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ── AUTH STATE ──
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // ── LOADER STATE ──
  const [loader, setLoader] = useState({ visible: false, text: 'Memproses…' });

  // ── TOAST STATE ──
  const [toasts, setToasts] = useState([]);

  // Baca dari localStorage saat mount
  useEffect(() => {
    const t = localStorage.getItem('sdmk_token');
    const u = localStorage.getItem('sdmk_user');
    if (t && u) {
      setToken(t);
      setCurrentUser(JSON.parse(u));
    }
  }, []);

  // ── AUTH HELPERS ──
  const login = useCallback((tok, user) => {
    localStorage.setItem('sdmk_token', tok);
    localStorage.setItem('sdmk_user', JSON.stringify(user));
    setToken(tok);
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sdmk_token');
    localStorage.removeItem('sdmk_user');
    setToken(null);
    setCurrentUser(null);
  }, []);

  const updateUser = useCallback((partial) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...partial };
      localStorage.setItem('sdmk_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ── LOADER HELPERS ──
  const showLoader = useCallback((text = 'Memproses…') => {
    setLoader({ visible: true, text });
  }, []);

  const hideLoader = useCallback(() => {
    setLoader((prev) => ({ ...prev, visible: false }));
  }, []);

  // ── TOAST HELPERS ──
  const toast = useCallback((msg, type = 'info', ms = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, ms);
  }, []);

  return (
    <AppContext.Provider
      value={{ token, currentUser, login, logout, updateUser, loader, showLoader, hideLoader, toast, toasts }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
