'use client';

import { calcWKT } from '@/lib/sdmk-engine';
import { fmt } from '@/lib/utils';

export function StepReview({ param, pokok, penunjang, onBack, onHitung, isNew }) {
  const w = calcWKT(param);

  return (
    <>
      <div className="card">
        <div className="card-title">Ringkasan Data</div>
        <div className="grid2" style={{ marginBottom:'1rem' }}>
          <div><span style={{ fontSize:12, color:'var(--ink-m)' }}>Hari Kerja Tersedia</span><br/><strong>{Math.round(w.hkt)} hari</strong></div>
          <div><span style={{ fontSize:12, color:'var(--ink-m)' }}>WKT</span><br/><strong>{fmt(w.wkt_menit)} menit/tahun</strong></div>
          <div><span style={{ fontSize:12, color:'var(--ink-m)' }}>Tugas Pokok</span><br/><strong>{pokok.length} kegiatan</strong></div>
          <div><span style={{ fontSize:12, color:'var(--ink-m)' }}>Tugas Penunjang</span><br/><strong>{penunjang.length} kegiatan</strong></div>
        </div>
        <div className="alert-box">
          ⚡ Kalkulasi dilakukan langsung di browser — instan tanpa loading.{' '}
          {isNew
            ? 'Klik <strong>Hitung & Simpan</strong> untuk menjalankan dan menyimpan hasilnya.'
            : 'Klik <strong>Hitung & Simpan Versi Baru</strong> untuk membuat versi baru.'
          }
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-secondary" onClick={onBack}>← Tugas Penunjang</button>
        <button className="btn btn-calc" onClick={onHitung}>
          ⚡ {isNew ? 'Hitung & Simpan' : 'Hitung & Simpan Versi Baru'}
        </button>
      </div>
    </>
  );
}
