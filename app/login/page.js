'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { api } from '@/lib/api';

export default function LoginPage() {
  const { login } = useAuth();
  const { showLoader, hideLoader, toast } = useApp();
  const router = useRouter();

  const [tab, setTab] = useState('login');

  // Login fields
  const [lUsername, setLUsername] = useState('');
  const [lPassword, setLPassword] = useState('');

  // Register fields
  const [rUsername, setRUsername] = useState('');
  const [rName, setRName]         = useState('');
  const [rEmail, setREmail]       = useState('');
  const [rUnit, setRUnit]         = useState('');
  const [rPassword, setRPassword] = useState('');

  async function doLogin() {
    if (!lUsername || !lPassword) { toast('Isi username dan password.', 'error'); return; }
    showLoader('Memverifikasi…');
    const res = await api({ action: 'login', username: lUsername, password: lPassword });
    if (res.ok) {
      login(res.token, res.user);
      toast(`Selamat datang, ${res.user.name || res.user.username}!`, 'success');
      router.replace('/dashboard');
    } else {
      hideLoader();
      toast(res.error, 'error');
    }
  }

  async function doRegister() {
    if (!rUsername || !rName || !rPassword) { toast('Lengkapi data wajib (*)', 'error'); return; }
    showLoader('Mendaftar…');
    const res = await api({ action: 'register', username: rUsername, name: rName, email: rEmail, password: rPassword, unit_kerja: rUnit });
    if (res.ok) {
      login(res.token, res.user);
      toast('Akun berhasil dibuat!', 'success');
      router.replace('/dashboard');
    } else {
      hideLoader();
      toast(res.error, 'error');
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-box">
        <div className="auth-logo">S</div>
        <div className="auth-title">Kalkulator SDMK</div>
        <div className="auth-sub">Sistem Analisis Kebutuhan Tenaga Kesehatan</div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0, background:'#ede9e1', borderRadius:6, padding:3, marginBottom:'1.5rem' }}>
          {['login','register'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex:1, textAlign:'center', padding:'8px', borderRadius:4, cursor:'pointer',
                fontSize:13.5, fontWeight:500, border:'none',
                background: tab === t ? 'white' : 'none',
                color: tab === t ? '#1b6b5a' : '#8a8580',
                boxShadow: tab === t ? '0 2px 12px rgba(26,25,22,.08)' : 'none',
                transition:'all .15s', fontFamily:"'DM Sans', sans-serif",
              }}
            >
              {t === 'login' ? 'Masuk' : 'Daftar'}
            </button>
          ))}
        </div>

        {/* Login Form */}
        {tab === 'login' && (
          <div className="auth-form">
            <div className="field">
              <label>Username</label>
              <input type="text" placeholder="username" value={lUsername}
                onChange={e => setLUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doLogin()} />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" placeholder="••••••" value={lPassword}
                onChange={e => setLPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doLogin()} />
            </div>
            <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:4 }} onClick={doLogin}>
              Masuk
            </button>
          </div>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <div className="auth-form">
            <div className="field">
              <label>Username *</label>
              <input type="text" placeholder="username (huruf kecil)" value={rUsername} onChange={e => setRUsername(e.target.value)} />
            </div>
            <div className="field">
              <label>Nama Lengkap *</label>
              <input type="text" placeholder="Nama Anda" value={rName} onChange={e => setRName(e.target.value)} />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" placeholder="email@contoh.com" value={rEmail} onChange={e => setREmail(e.target.value)} />
            </div>
            <div className="field">
              <label>Unit Kerja</label>
              <input type="text" placeholder="Nama unit / puskesmas" value={rUnit} onChange={e => setRUnit(e.target.value)} />
            </div>
            <div className="field">
              <label>Password *</label>
              <input type="password" placeholder="min. 6 karakter" value={rPassword} onChange={e => setRPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:4 }} onClick={doRegister}>
              Buat Akun
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
