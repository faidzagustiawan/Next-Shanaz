'use client';

import { useApp } from '@/contexts/AppContext';

export function ToastContainer() {
  const { toasts } = useApp();

  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map((t) => (
        <div key={t.id} style={toastStyle(t.type)}>
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

function toastStyle(type) {
  const base = {
    padding: '12px 16px',
    borderRadius: 6,
    fontSize: 13.5,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 260,
    boxShadow: '0 8px 32px rgba(26,25,22,.12)',
    animation: 'slideIn .25s ease',
  };
  if (type === 'success') return { ...base, background: '#1b6b5a', color: 'white' };
  if (type === 'error')   return { ...base, background: '#b84040', color: 'white' };
  return { ...base, background: '#1a1916', color: '#f7f4ef' };
}
