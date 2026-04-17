'use client';

import { useApp } from '@/contexts/AppContext';

export function StepPokok({ pokok, setPokok, onNext, onBack }) {
  const { toast } = useApp();

  function update(id, field, val) {
    setPokok(prev => prev.map(p => p.id === id
      ? { ...p, [field]: field === 'kegiatan' ? val : (parseFloat(val) || 0) }
      : p
    ));
  }

  function addRow() {
    setPokok(prev => {
      const maxId = prev.reduce((m, p) => Math.max(m, p.id), 0);
      return [...prev, { id: maxId + 1, kegiatan: '', norma_waktu: 30, capaian_tahun: 100 }];
    });
  }

  function delRow(id) {
    if (pokok.length <= 1) { toast('Minimal 1 kegiatan.', 'error'); return; }
    setPokok(prev => prev.filter(p => p.id !== id));
  }

  return (
    <>
      <div className="card">
        <div className="ktbl-header ktbl-header-pokok">
          <span>Nama Kegiatan</span>
          <span>Norma (mnt)</span>
          <span>Capaian/Tahun</span>
          <span></span>
        </div>
        <div id="list-pokok-form">
          {pokok.map(p => (
            <div className="ktbl-row-pokok" key={p.id}>
              <input
                type="text"
                value={p.kegiatan}
                placeholder="Nama kegiatan pokok"
                onChange={e => update(p.id, 'kegiatan', e.target.value)}
                style={{ fontSize:13.5 }}
              />
              <input
                type="number"
                value={p.norma_waktu}
                min="1"
                style={{ textAlign:'center' }}
                onChange={e => update(p.id, 'norma_waktu', e.target.value)}
              />
              <input
                type="number"
                value={p.capaian_tahun}
                min="0"
                style={{ textAlign:'center' }}
                onChange={e => update(p.id, 'capaian_tahun', e.target.value)}
              />
              <button className="btn-icon" onClick={() => delRow(p.id)} title="Hapus">×</button>
            </div>
          ))}
        </div>
        <button className="btn btn-add" onClick={addRow} style={{ marginTop:8 }}>
          ＋ Tambah Kegiatan
        </button>
      </div>

      <div className="actions">
        <button className="btn btn-secondary" onClick={onBack}>← Waktu Kerja</button>
        <button className="btn btn-primary" onClick={onNext}>Lanjut ke Tugas Penunjang →</button>
      </div>
    </>
  );
}
