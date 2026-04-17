'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { useState, useRef, useEffect } from 'react';

export function Navbar() {
  const { currentUser, logout } = useAuth();
  const { toast } = useApp();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  function handleLogout() {
    logout();
    toast('Berhasil keluar.', 'info');
    router.push('/login');
  }

  const initial = currentUser
    ? (currentUser.name || currentUser.username)[0].toUpperCase()
    : '?';

  const displayName = currentUser?.name || currentUser?.username || '—';

  /* Close dropdown jika klik di luar */
  useEffect(() => {
    function handleClickOutside(e) {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header
      style={{
        background: '#1a1916',
        height: 58,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 30,
            height: 30,
            background: '#1b6b5a',
            borderRadius: 7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'DM Serif Display', serif",
            fontSize: 17,
            color: 'white',
            flexShrink: 0,
          }}
        >
          S
        </div>

        <div>
          <div
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 16,
              color: '#f7f4ef',
            }}
          >
            Kalkulator SDMK
          </div>

          <div
            style={{
              fontSize: 11,
              color: '#666',
              letterSpacing: '.06em',
              textTransform: 'uppercase',
            }}
          >
            Analisis Kebutuhan Tenaga
          </div>
        </div>
      </div>

      {/* User dropdown */}
      <div
        ref={dropdownRef}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Trigger */}
        <button
          onClick={() => setOpen(!open)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            padding: '6px 10px',
            borderRadius: 6,
            background: 'transparent',
            border: 'none',
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              background: '#1b6b5a',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 600,
              color: 'white',
            }}
          >
            {initial}
          </div>

          <span style={{ fontSize: 13, color: '#ccc' }}>{displayName}</span>
        </button>

        {/* Dropdown */}
        <div className={`h-dropdown ${open ? 'show' : ''}`}>
          <button
            className="h-drop-item"
            onClick={() => {
              router.push('/profil');
              setOpen(false);
            }}
          >
            👤 Profil Saya
          </button>

          <div className="h-drop-sep" />

          <button
            className="h-drop-item danger"
            onClick={handleLogout}
          >
            ← Keluar
          </button>
        </div>
      </div>

      <style>{`
        .h-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: white;
          border: 0.5px solid #d8d3ca;
          border-radius: 10px;
          box-shadow: 0 8px 32px rgba(26,25,22,.12);
          min-width: 180px;
          overflow: hidden;
          opacity: 0;
          transform: translateY(-6px);
          pointer-events: none;
          transition: all .15s ease;
          z-index: 200;
        }

        .h-dropdown.show {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .h-drop-item {
          padding: 10px 14px;
          font-size: 13.5px;
          cursor: pointer;
          color: #4a4740;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background .1s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
        }

        .h-drop-item:hover {
          background: #f7f4ef;
        }

        .h-drop-item.danger {
          color: #b84040;
        }

        .h-drop-item.danger:hover {
          background: #faeded;
        }

        .h-drop-sep {
          height: 0.5px;
          background: #ede9e1;
        }
      `}</style>
    </header>
  );
}