'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { api } from '@/lib/api';
import { DEFAULT_PARAM, runHitung } from '@/lib/sdmk-engine';
import { Modal } from '@/components/ui/Modal';
import { StepWKT } from '@/components/kalkulator/StepWKT';
import { StepPokok } from '@/components/kalkulator/StepPokok';
import { StepPenunjang } from '@/components/kalkulator/StepPenunjang';
import { StepReview } from '@/components/kalkulator/StepReview';
import { HasilView } from '@/components/kalkulator/HasilView';

const STEPS = ['wkt', 'pokok', 'penunjang', 'review'];
const STEP_LABELS = ['Waktu Kerja', 'Tugas Pokok', 'Tugas Penunjang', 'Review & Simpan'];

export default function KalkulatorBaruPage() {
  const { currentUser } = useAuth();
  const { showLoader, hideLoader, toast } = useApp();
  const router = useRouter();

  const [showJudul, setShowJudul] = useState(true);
  const [formJudul, setFormJudul] = useState('');
  const [formUnit, setFormUnit]   = useState(currentUser?.unit_kerja || '');
  const [formTahun, setFormTahun] = useState(String(new Date().getFullYear()));

  const [meta, setMeta]           = useState(null);
  const [param, setParam]         = useState(DEFAULT_PARAM);
  const [pokok, setPokok]         = useState([{ id:1, kegiatan:'', norma_waktu:30, capaian_tahun:100 }]);
  const [penunjang, setPenunjang] = useState([]);
  const [step, setStep]           = useState('wkt');
  const [hasil, setHasil]         = useState(null);

  function submitJudul() {
    if (!formJudul.trim()) { toast('Judul wajib diisi.', 'error'); return; }
    setMeta({ judul: formJudul.trim(), unit_kerja: formUnit.trim(), tahun: formTahun });
    setShowJudul(false);
  }

  async function doHitungDanSimpan() {
    if (!pokok.length || pokok.some(p => !p.kegiatan || !p.norma_waktu)) {
      toast('Lengkapi semua kegiatan tugas pokok.', 'error'); return;
    }
    // Kalkulasi di frontend — tanpa round-trip server
    const result = runHitung(param, pokok, penunjang);
    if (!result.ok) { toast(result.error, 'error'); return; }

    showLoader('Menyimpan ke server…');
    const res = await api({
      action: 'createPerhitungan',
      judul: meta.judul, unit_kerja: meta.unit_kerja, tahun: meta.tahun,
      param, pokok, penunjang, hasil: result.hasil,
    });
    hideLoader();

    if (res.ok) {
      setHasil(result.hasil);
      toast('Perhitungan berhasil disimpan!', 'success');
    } else {
      toast(res.error, 'error');
    }
  }

  const stepIndex = STEPS.indexOf(step);

  if (hasil) {
    return (
      <HasilView judul={meta?.judul} hasil={hasil} versiNum={1}
        onEdit={() => { setHasil(null); setStep('wkt'); }}
        onDashboard={() => router.push('/dashboard')}
      />
    );
  }

  return (
    <>
      {showJudul && (
        <Modal title="Perhitungan Baru" subtitle="Beri nama perhitungan ini sebelum memulai."
          onClose={() => router.push('/dashboard')}
          actions={<>
            <button className="btn btn-secondary btn-sm" onClick={() => router.push('/dashboard')}>Batal</button>
            <button className="btn btn-primary btn-sm" onClick={submitJudul}>Mulai →</button>
          </>}
        >
          <div className="field">
            <label>Judul Perhitungan *</label>
            <input type="text" placeholder="cth. Analisis Tenaga Dokter 2025"
              value={formJudul} onChange={e => setFormJudul(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitJudul()} autoFocus />
          </div>
          <div className="field">
            <label>Unit Kerja</label>
            <input type="text" placeholder="Puskesmas / RSUD / …"
              value={formUnit} onChange={e => setFormUnit(e.target.value)} />
          </div>
          <div className="field">
            <label>Tahun</label>
            <input type="number" value={formTahun} onChange={e => setFormTahun(e.target.value)} />
          </div>
        </Modal>
      )}

      {!showJudul && (
        <>
          <div className="view-header">
            <div className="eyebrow">Perhitungan Baru</div>
            <div className="view-title">{meta?.judul}</div>
            <div className="view-desc">{meta?.unit_kerja}{meta?.tahun ? ` · Tahun ${meta.tahun}` : ''}</div>
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

          {step === 'wkt'       && <StepWKT param={param} setParam={setParam} onNext={() => setStep('pokok')} onBack={() => router.push('/dashboard')} />}
          {step === 'pokok'     && <StepPokok pokok={pokok} setPokok={setPokok} onNext={() => setStep('penunjang')} onBack={() => setStep('wkt')} />}
          {step === 'penunjang' && <StepPenunjang penunjang={penunjang} setPenunjang={setPenunjang} param={param} onNext={() => setStep('review')} onBack={() => setStep('pokok')} />}
          {step === 'review'    && (
            <StepReview param={param} pokok={pokok} penunjang={penunjang}
              onBack={() => setStep('penunjang')} onHitung={doHitungDanSimpan}
              isNew={true}
            />
          )}
        </>
      )}
    </>
  );
}
