'use client';

import { calcWKT } from '@/lib/sdmk-engine';
import { fmt } from '@/lib/utils';

export function StepPenunjang({ penunjang, setPenunjang, param, onNext, onBack }) {
  const w = calcWKT(param);

  function update(id, field, val) {
    setPenunjang(prev => prev.map(p => p.id === id
      ? { ...p, [field]: field === 'kegiatan' ? val : (parseFloat(val) || 0) }
      : p
    ));
  }

  function addRow() {
    setPenunjang(prev => {
      const maxId = prev.reduce((m, p) => Math.max(m, p.id), 0);
      return [...prev, { id: maxId + 1, kegiatan: '', waktu_menit_hari: 10 }];
    });
  }

  function delRow(id) {
    setPenunjang(prev => prev.filter(p => p.id !== id));
  }

  return (
    <>
      <div className="info-bar">
        WKT: <strong>{fmt(w.wkt_menit)} menit/tahun</strong> &nbsp;|&nbsp; HKT:{' '}
        <strong>{Math.round(w.hkt)} hari</strong> — digunakan sebagai pembagi FTP.
      </div>

      <div className="card">
        <div className="ktbl-header ktbl-header-penunjang">
          <span>Nama Kegiatan Penunjang</span>
          <span>Waktu (mnt/hari)</span>
          <span></span>
        </div>
        <div id="list-penunjang-form">
          {penunjang.length === 0 && (
            <div style={{ fontSize:13, color:'var(--ink-m)', padding:'1rem 0' }}>
              Belum ada tugas penunjang. (Opsional)
            </div>
          )}
          {penunjang.map(p => (
            <div className="ktbl-row-penunjang" key={p.id}>
              <input
                type="text"
                value={p.kegiatan}
                placeholder="Nama kegiatan"
                onChange={e => update(p.id, 'kegiatan', e.target.value)}
                style={{ fontSize:13.5 }}
              />
              <input
                type="number"
                value={p.waktu_menit_hari}
                min="0"
                step="1"
                placeholder="mnt/hari"
                style={{ textAlign:'center' }}
                onChange={e => update(p.id, 'waktu_menit_hari', e.target.value)}
              />
              <button className="btn-icon" onClick={() => delRow(p.id)} title="Hapus">×</button>
            </div>
          ))}
        </div>
        <button className="btn btn-add" onClick={addRow} style={{ marginTop:8 }}>
          ＋ Tambah Kegiatan Penunjang
        </button>
      </div>

      <div className="actions">
        <button className="btn btn-secondary" onClick={onBack}>← Tugas Pokok</button>
        <button className="btn btn-primary" onClick={onNext}>Lanjut ke Review →</button>
      </div>
    </>
  );
}
