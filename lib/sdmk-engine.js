/**
 * sdmk-engine.js
 * Seluruh kalkulasi SDMK dijalankan di frontend.
 * Logika identik 100% dengan runHitung() yang dulu ada di Code.gs.
 */

function round4(n) {
  return Math.round(n * 10000) / 10000;
}

/** Hitung WKT dari parameter waktu kerja */
export function calcWKT(param) {
  const { hari_kerja = 261, cuti = 0, libur = 0, pelatihan = 0, absen = 0, jam_kerja = 8, efektivitas = 80 } = param;
  const hkt       = hari_kerja - (cuti + libur + pelatihan + absen);
  const jke       = jam_kerja * (efektivitas / 100);
  const wkt_jam   = hkt * jke;
  const wkt_menit = wkt_jam * 60;
  return { hkt, jke: round4(jke), wkt_jam: round4(wkt_jam), wkt_menit: Math.round(wkt_menit) };
}

/**
 * Jalankan perhitungan SDMK penuh — identik dengan runHitung() di Code.gs lama.
 * Returns { ok, hasil } atau { ok: false, error }.
 */
export function runHitung(param, pokok, penunjang) {
  const w = calcWKT(param);
  const { hkt, jke, wkt_jam, wkt_menit } = w;

  if (wkt_menit <= 0) return { ok: false, error: 'WKT tidak valid. Periksa parameter waktu kerja.' };

  const detail_pokok = pokok.map((p, i) => {
    const sbk       = wkt_menit / (p.norma_waktu || 1);
    const kebutuhan = (p.capaian_tahun || 0) / sbk;
    return {
      urutan: i + 1, kegiatan: p.kegiatan,
      norma_waktu: p.norma_waktu, capaian_tahun: p.capaian_tahun,
      sbk: round4(sbk), kebutuhan: round4(kebutuhan),
    };
  });
  const jkt = detail_pokok.reduce((s, r) => s + r.kebutuhan, 0);

  const detail_penunjang = penunjang.map((p, i) => {
    const menit_tahun = p.waktu_menit_hari * hkt;
    const ftp         = (menit_tahun / wkt_menit) * 100;
    return {
      urutan: i + 1, kegiatan: p.kegiatan,
      waktu_menit_hari: p.waktu_menit_hari,
      menit_tahun: Math.round(menit_tahun), ftp: round4(ftp),
    };
  });
  const ftp_total = detail_penunjang.reduce((s, r) => s + r.ftp, 0);

  if (ftp_total >= 100) return { ok: false, error: 'FTP total >= 100%. Periksa input tugas penunjang.' };

  const stp        = 1 / (1 - ftp_total / 100);
  const total_raw  = jkt * stp;
  const total_sdmk = Math.ceil(total_raw);

  return {
    ok: true,
    hasil: {
      wkt: { hkt, jke, wkt_jam, wkt_menit },
      jkt: round4(jkt), ftp_total: round4(ftp_total),
      stp: round4(stp), total_raw: round4(total_raw), total_sdmk,
      detail_pokok, detail_penunjang, param,
      dihitung_pada: new Date().toISOString(),
    },
  };
}

export const DEFAULT_PARAM = {
  hari_kerja: 261, cuti: 12, libur: 16, pelatihan: 3,
  absen: 2, jam_kerja: 8, efektivitas: 80,
};
