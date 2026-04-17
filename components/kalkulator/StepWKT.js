'use client';

import { calcWKT } from '@/lib/sdmk-engine';
import { fmt } from '@/lib/utils';

export function StepWKT({ param, setParam, onNext, onBack }) {
  const w = calcWKT(param);

  function set(key, val) {
    setParam(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));
  }

  return (
    <>
      <div className="card">
        <div className="card-title">Hari Kerja &amp; Pengurangan</div>
        <div className="grid3" style={{ marginBottom:'1rem' }}>
          <Field label="Hari Kerja per Tahun" unit="hari">
            <input type="number" value={param.hari_kerja} min="1"
              onChange={e => set('hari_kerja', e.target.value)} />
          </Field>
          <Field label="Cuti Tahunan" unit="hari">
            <input type="number" value={param.cuti} min="0"
              onChange={e => set('cuti', e.target.value)} />
          </Field>
          <Field label="Libur Nasional" unit="hari">
            <input type="number" value={param.libur} min="0"
              onChange={e => set('libur', e.target.value)} />
          </Field>
        </div>
        <div className="grid3">
          <Field label="Pelatihan / Diklat" unit="hari">
            <input type="number" value={param.pelatihan} min="0"
              onChange={e => set('pelatihan', e.target.value)} />
          </Field>
          <Field label="Absen / Sakit" unit="hari">
            <input type="number" value={param.absen} min="0"
              onChange={e => set('absen', e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Jam &amp; Efektivitas</div>
        <div className="grid2">
          <Field label="Jam Kerja per Hari" unit="jam">
            <input type="number" value={param.jam_kerja} step=".5" min="1"
              onChange={e => set('jam_kerja', e.target.value)} />
          </Field>
          <Field label="Efektivitas Kerja" unit="%">
            <input type="number" value={param.efektivitas} min="1" max="100"
              onChange={e => set('efektivitas', e.target.value)} />
          </Field>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-strip">
        <div className="metric-cell">
          <div className="metric-val">{Math.round(w.hkt)}</div>
          <div className="metric-lbl">Hari Kerja Tersedia</div>
        </div>
        <div className="metric-cell">
          <div className="metric-val">{w.jke.toFixed(2)}</div>
          <div className="metric-lbl">Jam Efektif / Hari</div>
        </div>
        <div className="metric-cell">
          <div className="metric-val">{w.wkt_jam.toFixed(2)}</div>
          <div className="metric-lbl">WKT (jam/tahun)</div>
        </div>
        <div className="metric-cell">
          <div className="metric-val">{fmt(w.wkt_menit)}</div>
          <div className="metric-lbl">WKT (menit/tahun)</div>
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-secondary" onClick={onBack}>← Kembali</button>
        <button className="btn btn-primary" onClick={onNext}>Lanjut ke Tugas Pokok →</button>
      </div>
    </>
  );
}

function Field({ label, unit, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="input-wrap">
        {children}
        {unit && <span className="input-unit">{unit}</span>}
      </div>
    </div>
  );
}
