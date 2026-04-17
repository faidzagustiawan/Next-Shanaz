'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { DEFAULT_PARAM, runHitung } from '@/lib/sdmk-engine';
import { StepWKT } from '@/components/kalkulator/StepWKT';
import { StepPokok } from '@/components/kalkulator/StepPokok';
import { StepPenunjang } from '@/components/kalkulator/StepPenunjang';
import { StepReview } from '@/components/kalkulator/StepReview';
import { HasilView } from '@/components/kalkulator/HasilView';
import { VersiSidebar } from '@/components/kalkulator/VersiSidebar';

const STEPS = ['wkt', 'pokok', 'penunjang', 'review'];
const STEP_LABELS = ['Waktu Kerja', 'Tugas Pokok', 'Tugas Penunjang', 'Review & Simpan'];

export default function KalkulatorIdPage() {
  const { id } = useParams();
  const { showLoader, hideLoader, toast } = useApp();
  const { currentUser } = useAuth();
  const router = useRouter();

  const [loaded, setLoaded]             = useState(false);
  const [perhitungan, setPerhitungan]   = useState(null);  // master info
  const [allVersi, setAllVersi]         = useState([]);
  const [activeVersi, setActiveVersi]   = useState(null);  // versi yang sedang ditampilkan
  const [mode, setMode]                 = useState('hasil'); // 'hasil' | 'edit'

  // Form state (untuk mode edit)
  const [param, setParam]       = useState(DEFAULT_PARAM);
  const [pokok, setPokok]       = useState([]);
  const [penunjang, setPenunjang] = useState([]);
  const [step, setStep]         = useState('wkt');

  async function load() {
    showLoader('Memuat perhitungan…');
    const res = await api({ action: 'getPerhitungan', id });
    hideLoader();
    if (!res.ok) { toast(res.error, 'error'); router.replace('/dashboard'); return; }

    setPerhitungan(res.perhitungan);
    setAllVersi(res.versi);

    const latest = res.versi[res.versi.length - 1] || null;
    setActiveVersi(latest);
    if (latest?.hasil) setMode('hasil');
    else { setMode('edit'); loadFormFromVersi(latest); }
    setLoaded(true);
  }

  useEffect(() => { load(); }, [id]);

  function loadFormFromVersi(v) {
    if (!v) return;
    setParam(v.param || DEFAULT_PARAM);
    setPokok((v.pokok || []).map((x, i) => ({ id: i+1, ...x })));
    setPenunjang((v.penunjang || []).map((x, i) => ({ id: i+1, ...x })));
    setStep('wkt');
  }

  function selectVersi(v) {
    setActiveVersi(v);
    if (v.hasil) setMode('hasil');
    else { setMode('edit'); loadFormFromVersi(v); }
  }

  function startEdit() {
    loadFormFromVersi(activeVersi);
    setMode('edit');
    setStep('wkt');
  }

  async function doHitungDanSimpan() {
    if (!pokok.length || pokok.some(p => !p.kegiatan || !p.norma_waktu)) {
      toast('Lengkapi semua kegiatan tugas pokok.', 'error'); return;
    }
    // Kalkulasi di frontend
    const result = runHitung(param, pokok, penunjang);
    if (!result.ok) { toast(result.error, 'error'); return; }

    showLoader('Menyimpan versi baru…');
    const res = await api({
      action: 'saveVersi',
      perhitungan_id: id,
      param, pokok, penunjang, hasil: result.hasil,
    });
    hideLoader();

    if (res.ok) {
      toast(`Versi ${res.versi_num} berhasil disimpan!`, 'success');
      await load();  // reload untuk dapat versi terbaru
    } else {
      toast(res.error, 'error');
    }
  }

  if (!loaded) return null;

  const stepIndex = STEPS.indexOf(step);
  const latestVersi = allVersi[allVersi.length - 1];
  const isLatest = activeVersi?.id === latestVersi?.id;

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 240px', gap:'1.5rem', alignItems:'start' }}>
      {/* ── Konten utama ── */}
      <div style={{ minWidth:0 }}>
        {mode === 'hasil' && activeVersi?.hasil ? (
          <HasilView
            judul={perhitungan?.judul}
            hasil={activeVersi.hasil}
            versiNum={activeVersi.versi_num}
            penulis={activeVersi.username}
            savedAt={activeVersi.saved_at}
            isLatest={isLatest}
            onEdit={isLatest ? startEdit : null}
            onNewVersi={!isLatest ? startEdit : null}
            onDashboard={() => router.push('/dashboard')}
          />
        ) : (
          <>
            <div className="view-header">
              <div className="eyebrow">{activeVersi ? `Modifikasi dari Versi ${activeVersi.versi_num}` : 'Edit Perhitungan'}</div>
              <div className="view-title">{perhitungan?.judul}</div>
              <div className="view-desc">
                {perhitungan?.unit_kerja}{perhitungan?.tahun ? ` · Tahun ${perhitungan.tahun}` : ''}
                {' · '}Versi baru oleh <strong>{currentUser?.username}</strong>
              </div>
            </div>

            <div className="steps-nav">
              {STEPS.map((s, i) => (
                <button key={s} className={`step-btn${step === s ? ' active' : ''}`} onClick={() => setStep(s)}>
                  {i < stepIndex && <span className="step-check">✓</span>}
                  <span className="step-num">{String(i+1).padStart(2,'0')}</span>
                  <span className="step-label">{STEP_LABELS[i]}</span>
                </button>
              ))}
            </div>

            {step === 'wkt'       && <StepWKT param={param} setParam={setParam} onNext={() => setStep('pokok')} onBack={() => setMode('hasil')} />}
            {step === 'pokok'     && <StepPokok pokok={pokok} setPokok={setPokok} onNext={() => setStep('penunjang')} onBack={() => setStep('wkt')} />}
            {step === 'penunjang' && <StepPenunjang penunjang={penunjang} setPenunjang={setPenunjang} param={param} onNext={() => setStep('review')} onBack={() => setStep('pokok')} />}
            {step === 'review'    && (
              <StepReview param={param} pokok={pokok} penunjang={penunjang}
                onBack={() => setStep('penunjang')} onHitung={doHitungDanSimpan}
                isNew={false}
              />
            )}
          </>
        )}
      </div>

      {/* ── Version sidebar ── */}
      <VersiSidebar
        versi={allVersi}
        activeId={activeVersi?.id}
        perhitungan={perhitungan}
        onSelect={selectVersi}
      />
    </div>
  );
}
