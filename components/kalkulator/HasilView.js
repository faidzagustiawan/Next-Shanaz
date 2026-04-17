'use client';

import { fmt } from '@/lib/utils';

/**
 * Tampilan hasil perhitungan SDMK.
 * Props: judul, hasil, versiNum, penulis, savedAt, isLatest, onEdit, onNewVersi, onDashboard
 */
export function HasilView({ judul, hasil, versiNum, penulis, savedAt, isLatest, onEdit, onNewVersi, onDashboard }) {
  if (!hasil) return null;
  const h = hasil;
  const p = h.param || {};

  function fmtDateTime(str) {
    if (!str) return '—';
    return new Date(str).toLocaleString('id-ID', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' });
  }

  return (
    <>
      <div className="view-header">
        <div className="eyebrow">Hasil Perhitungan</div>
        <div className="view-title">{judul || '—'}</div>
        {/* Info versi */}
        {penulis && (
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:6, flexWrap:'wrap' }}>
            <span style={{
              background: isLatest ? 'var(--ink)' : 'var(--cream-d)',
              color: isLatest ? 'var(--cream)' : 'var(--ink-m)',
              borderRadius:99, padding:'2px 10px', fontSize:11, fontWeight:600,
            }}>
              {isLatest ? '● Versi Terbaru' : `Versi ${versiNum}`}
            </span>
            <span style={{ fontSize:12, color:'var(--ink-m)' }}>
              oleh <strong>{penulis}</strong> · {fmtDateTime(savedAt)}
            </span>
          </div>
        )}
      </div>

      {/* Aksi */}
      <div style={{ display:'flex', gap:8, marginBottom:'1.25rem', flexWrap:'wrap' }} className="print-actions">
        {onEdit && <button className="btn btn-ghost btn-sm" onClick={onEdit}>✏️ Edit Versi Ini</button>}
        {onNewVersi && <button className="btn btn-primary btn-sm" onClick={onNewVersi}>＋ Buat Versi Baru dari Ini</button>}
        <button className="btn btn-ghost btn-sm" onClick={onDashboard}>← Dashboard</button>
        <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>🖨 Cetak / PDF</button>
      </div>

      {!isLatest && (
        <div style={{
          background:'var(--amber-p)', border:'1px solid #e8c88a',
          borderRadius:'var(--r-sm)', padding:'10px 14px',
          fontSize:13, color:'#7a5020', marginBottom:'1.25rem',
        }}>
          ⚠️ Anda sedang melihat versi lama. Pilih versi terbaru di sidebar kanan atau klik "Buat Versi Baru dari Ini".
        </div>
      )}

      {/* Hero */}
      <div className="hasil-hero">
        <div className="hasil-eyebrow">Total Kebutuhan Tenaga Kesehatan</div>
        <div className="hasil-num">{h.total_sdmk}</div>
        <div className="hasil-sub">Orang &nbsp;·&nbsp; dibulatkan ke atas dari {h.total_raw}</div>
      </div>

      {/* Metrics */}
      <div className="metrics-strip" style={{ marginBottom:'1.25rem' }}>
        <div className="metric-cell"><div className="metric-val">{fmt(h.wkt.wkt_menit)}</div><div className="metric-lbl">WKT menit/tahun</div></div>
        <div className="metric-cell"><div className="metric-val">{h.jkt}</div><div className="metric-lbl">JKT</div></div>
        <div className="metric-cell"><div className="metric-val">{h.ftp_total}%</div><div className="metric-lbl">FTP Total</div></div>
        <div className="metric-cell"><div className="metric-val">{h.stp}</div><div className="metric-lbl">STP</div></div>
      </div>

      {/* Detail Tugas Pokok */}
      <div className="result-table-wrap">
        <div className="rtbl-head">
          <span>Detail Tugas Pokok</span>
          <span style={{ fontWeight:400, color:'var(--ink-m)' }}>{h.detail_pokok.length} kegiatan</span>
        </div>
        <table>
          <thead><tr>
            <th>Kegiatan</th><th className="r">Norma (mnt)</th>
            <th className="r">Capaian</th><th className="r">SBK</th><th className="r">Kebutuhan SDMK</th>
          </tr></thead>
          <tbody>
            {h.detail_pokok.map((r, i) => (
              <tr key={i}>
                <td>{r.kegiatan || '—'}</td>
                <td className="r">{r.norma_waktu}</td>
                <td className="r">{(r.capaian_tahun || 0).toLocaleString('id-ID')}</td>
                <td className="r">{r.sbk.toLocaleString('id-ID')}</td>
                <td className="r"><span className="tbl-badge">{r.kebutuhan}</span></td>
              </tr>
            ))}
            <tr className="tbl-total"><td colSpan={4}>Jumlah Kebutuhan Tenaga (JKT)</td><td className="r">{h.jkt}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Detail Tugas Penunjang */}
      <div className="result-table-wrap">
        <div className="rtbl-head">
          <span>Detail Tugas Penunjang</span>
          <span style={{ fontWeight:400, color:'var(--ink-m)' }}>÷ WKT {fmt(h.wkt.wkt_menit)} menit/tahun</span>
        </div>
        <table>
          <thead><tr>
            <th>Kegiatan</th><th className="r">Waktu (mnt/hari)</th>
            <th className="r">Total mnt/tahun <span style={{ fontWeight:400 }}>(× HKT {h.wkt.hkt})</span></th>
            <th className="r">FTP (%)</th>
          </tr></thead>
          <tbody>
            {h.detail_penunjang.length === 0
              ? <tr><td colSpan={4} style={{ textAlign:'center', color:'var(--ink-m)', padding:'1rem' }}>Tidak ada tugas penunjang.</td></tr>
              : h.detail_penunjang.map((r, i) => (
                  <tr key={i}>
                    <td>{r.kegiatan || '—'}</td>
                    <td className="r">{r.waktu_menit_hari}</td>
                    <td className="r">{(r.menit_tahun || 0).toLocaleString('id-ID')}</td>
                    <td className="r">{r.ftp}%</td>
                  </tr>
                ))
            }
            <tr className="tbl-total">
              <td colSpan={3}>Total FTP → STP = 1 ÷ (1 − {(h.ftp_total / 100).toFixed(4)})</td>
              <td className="r">{h.ftp_total}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Formula */}
      <div className="formula-box">
        <div className="formula-title">Ringkasan Rumus</div>
        <div className="formula-line">
          HKT = {p.hari_kerja||261} − ({p.cuti||0}+{p.libur||0}+{p.pelatihan||0}+{p.absen||0}) = <strong>{h.wkt.hkt} hari</strong><br/>
          WKT = {h.wkt.hkt} × {p.jam_kerja||8} jam × {p.efektivitas||80}% = <strong>{fmt(h.wkt.wkt_jam)} jam</strong> = <strong>{fmt(h.wkt.wkt_menit)} menit/tahun</strong><br/>
          SBK = WKT ÷ norma waktu &nbsp;|&nbsp; Kebutuhan = capaian ÷ SBK<br/>
          JKT = Σ kebutuhan seluruh tugas pokok = <strong>{h.jkt}</strong><br/>
          FTP per kegiatan = (waktu × HKT) ÷ WKT × 100 → Total FTP = <strong>{h.ftp_total}%</strong><br/>
          STP = 1 ÷ (1 − {(h.ftp_total/100).toFixed(4)}) = <strong>{h.stp}</strong><br/>
          <strong>Total SDMK = {h.jkt} × {h.stp} = {h.total_raw} ≈ {h.total_sdmk} orang</strong>
        </div>
      </div>

      <div style={{ fontSize:12, color:'var(--ink-m)', textAlign:'right' }}>
        Dihitung pada: {h.dihitung_pada ? new Date(h.dihitung_pada).toLocaleString('id-ID') : '—'}
      </div>
    </>
  );
}
