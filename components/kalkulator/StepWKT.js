'use client';

import { calcWKT } from '@/lib/sdmk-engine';
import { fmt } from '@/lib/utils';

export function StepWKT({ param, setParam, onNext, onBack }) {
  const w = calcWKT(param);

  function set(key, val) {
    const num = Number(val);
    setParam(prev => ({
      ...prev,
      [key]: Number.isNaN(num) ? 0 : num
    }));
  }

  return (
    <>
      <div className="card">
        <div className="card-title">Hari Kerja & Pengurangan</div>

        <div className="grid3" style={{ marginBottom: '1rem' }}>
          {hariKerjaFields.slice(0,3).map(f => (
            <FieldInput
              key={f.key}
              field={f}
              value={param[f.key]}
              onChange={set}
            />
          ))}
        </div>

        <div className="grid3">
          {hariKerjaFields.slice(3).map(f => (
            <FieldInput
              key={f.key}
              field={f}
              value={param[f.key]}
              onChange={set}
            />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Jam & Efektivitas</div>

        <div className="grid2">
          {jamFields.map(f => (
            <FieldInput
              key={f.key}
              field={f}
              value={param[f.key]}
              onChange={set}
            />
          ))}
        </div>
      </div>

      {/* Metrics */}
      <MetricsStrip w={w} />

      <div className="actions">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Kembali
        </button>

        <button className="btn btn-primary" onClick={onNext}>
          Lanjut ke Tugas Pokok →
        </button>
      </div>
    </>
  );
}

function FieldInput({ field, value, onChange }) {
  const { key, label, unit, min, max, step } = field;

  return (
    <div className="field">
      <label>{label}</label>

      <div className="input-wrap">
        <input
          type="number"
          value={value ?? ''}
          min={min}
          max={max}
          step={step}
          onChange={e => onChange(key, e.target.value)}
        />

        {unit && <span className="input-unit">{unit}</span>}
      </div>
    </div>
  );
}

function MetricsStrip({ w }) {
  const metrics = [
    { value: Math.round(w.hkt), label: 'Hari Kerja Tersedia' },
    { value: w.jke.toFixed(2), label: 'Jam Efektif / Hari' },
    { value: w.wkt_jam.toFixed(2), label: 'WKT (jam/tahun)' },
    { value: fmt(w.wkt_menit), label: 'WKT (menit/tahun)' },
  ];

  return (
    <div className="metrics-strip">
      {metrics.map((m, i) => (
        <div key={i} className="metric-cell">
          <div className="metric-val">{m.value}</div>
          <div className="metric-lbl">{m.label}</div>
        </div>
      ))}
    </div>
  );
}

/* =========================
   FIELD CONFIG
========================= */

const hariKerjaFields = [
  { key: 'hari_kerja', label: 'Hari Kerja per Tahun', unit: 'hari', min: 1 },
  { key: 'cuti', label: 'Cuti Tahunan', unit: 'hari', min: 0 },
  { key: 'libur', label: 'Libur Nasional', unit: 'hari', min: 0 },
  { key: 'pelatihan', label: 'Pelatihan / Diklat', unit: 'hari', min: 0 },
  { key: 'absen', label: 'Absen / Sakit', unit: 'hari', min: 0 },
];

const jamFields = [
  { key: 'jam_kerja', label: 'Jam Kerja per Hari', unit: 'jam', min: 1, step: 0.5 },
  { key: 'kerja_perminggu', label: 'Hari Kerja per Minggu', unit: 'hari', min: 1, max: 7 },
];