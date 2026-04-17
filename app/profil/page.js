'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';

export default function ProfilPage() {
  const { showLoader, hideLoader, toast } = useApp();
  const { currentUser, updateUser } = useAuth();

  const [profile, setProfile]     = useState(null);
  const [stats, setStats]         = useState({ total:0, selesai:0, draft:0 });
  const [showEdit, setShowEdit]   = useState(false);
  const [showPw, setShowPw]       = useState(false);

  // Edit form
  const [peName, setPeName]       = useState('');
  const [peEmail, setPeEmail]     = useState('');
  const [peUnit, setPeUnit]       = useState('');

  // PW form
  const [cpOld, setCpOld]         = useState('');
  const [cpNew, setCpNew]         = useState('');
  const [cpConfirm, setCpConfirm] = useState('');

  const load = useCallback(async () => {
    showLoader('Memuat profil…');
    const [profRes, listRes] = await Promise.all([
      api({ action: 'getProfile' }),
      api({ action: 'listPerhitungan' }),
    ]);
    hideLoader();
    if (!profRes.ok) { toast(profRes.error, 'error'); return; }
    const u = profRes.profile;
    setProfile(u);
    setPeName(u.name || '');
    setPeEmail(u.email || '');
    setPeUnit(u.unit_kerja || '');
    if (listRes.ok) {
      const all = listRes.data;
      setStats({
        total: all.length,
        selesai: all.filter(x => x.status === 'selesai').length,
        draft: all.filter(x => x.status === 'draft').length,
      });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function submitUpdateProfile() {
    showLoader('Menyimpan profil…');
    const res = await api({ action: 'updateProfile', name: peName, email: peEmail, unit_kerja: peUnit });
    hideLoader();
    if (res.ok) {
      setShowEdit(false);
      updateUser({ name: peName, unit_kerja: peUnit });
      toast('Profil berhasil diperbarui.', 'success');
      load();
    } else {
      toast(res.error, 'error');
    }
  }

  async function submitChangePw() {
    if (cpNew !== cpConfirm) { toast('Konfirmasi password tidak cocok.', 'error'); return; }
    showLoader('Mengubah password…');
    const res = await api({ action: 'changePassword', old_password: cpOld, new_password: cpNew });
    hideLoader();
    if (res.ok) {
      setShowPw(false);
      setCpOld(''); setCpNew(''); setCpConfirm('');
      toast('Password berhasil diubah.', 'success');
    } else {
      toast(res.error, 'error');
    }
  }

  function fmtDate(str, opts) {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('id-ID', opts || { day:'2-digit', month:'long', year:'numeric' });
  }

  if (!profile) return null;

  const initial = (profile.name || profile.username)[0].toUpperCase();

  return (
    <>
      <div className="view-header">
        <div className="eyebrow">Akun</div>
        <div className="view-title">Profil Saya</div>
      </div>

      {/* Profile card */}
      <div className="card" style={{ display:'flex', gap:'1.5rem', alignItems:'flex-start', flexWrap:'wrap' }}>
        <div style={{ textAlign:'center' }}>
          <div className="profile-avatar-big">{initial}</div>
          <div style={{ fontSize:12, color:'var(--ink-m)' }}>
            {profile.role === 'admin' ? '⭐ Administrator' : '👤 Pengguna'}
          </div>
        </div>
        <div style={{ flex:1, minWidth:200 }}>
          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, marginBottom:4 }}>
            {profile.name || '—'}
          </div>
          <div style={{ fontSize:13, color:'var(--ink-m)', marginBottom:12 }}>@{profile.username}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:13.5 }}>
            <div><span style={{ color:'var(--ink-m)' }}>Email: </span>{profile.email || '—'}</div>
            <div><span style={{ color:'var(--ink-m)' }}>Unit Kerja: </span>{profile.unit_kerja || '—'}</div>
            <div><span style={{ color:'var(--ink-m)' }}>Bergabung: </span>{fmtDate(profile.created_at)}</div>
            <div>
              <span style={{ color:'var(--ink-m)' }}>Login Terakhir: </span>
              {profile.last_login ? new Date(profile.last_login).toLocaleString('id-ID') : '—'}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowEdit(true)}>✏️ Edit Profil</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowPw(true)}>🔑 Ganti Password</button>
        </div>
      </div>

      {/* Statistik */}
      <div className="card">
        <div className="card-title">Statistik</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
          <div className="profile-stat">
            <div className="profile-stat-num">{stats.total}</div>
            <div className="profile-stat-lbl">Total Perhitungan</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-num">{stats.selesai}</div>
            <div className="profile-stat-lbl">Selesai Dihitung</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-num">{stats.draft}</div>
            <div className="profile-stat-lbl">Draft</div>
          </div>
        </div>
      </div>

      {/* Modal edit profil */}
      {showEdit && (
        <Modal
          title="Edit Profil"
          onClose={() => setShowEdit(false)}
          actions={
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowEdit(false)}>Batal</button>
              <button className="btn btn-primary btn-sm" onClick={submitUpdateProfile}>Simpan</button>
            </>
          }
        >
          <div className="field"><label>Nama Lengkap</label>
            <input type="text" value={peName} onChange={e => setPeName(e.target.value)} /></div>
          <div className="field"><label>Email</label>
            <input type="email" value={peEmail} onChange={e => setPeEmail(e.target.value)} /></div>
          <div className="field"><label>Unit Kerja</label>
            <input type="text" value={peUnit} onChange={e => setPeUnit(e.target.value)} /></div>
        </Modal>
      )}

      {/* Modal ganti password */}
      {showPw && (
        <Modal
          title="Ganti Password"
          onClose={() => setShowPw(false)}
          actions={
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowPw(false)}>Batal</button>
              <button className="btn btn-primary btn-sm" onClick={submitChangePw}>Simpan</button>
            </>
          }
        >
          <div className="field"><label>Password Lama</label>
            <input type="password" value={cpOld} onChange={e => setCpOld(e.target.value)} /></div>
          <div className="field"><label>Password Baru</label>
            <input type="password" value={cpNew} onChange={e => setCpNew(e.target.value)} /></div>
          <div className="field"><label>Konfirmasi Password Baru</label>
            <input type="password" value={cpConfirm} onChange={e => setCpConfirm(e.target.value)} /></div>
        </Modal>
      )}
    </>
  );
}
