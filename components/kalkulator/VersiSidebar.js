'use client';

/**
 * Sidebar riwayat versi perhitungan.
 * Props: versi[], activeId, perhitungan (master info), onSelect(versi)
 */
export function VersiSidebar({ versi, activeId, perhitungan, onSelect }) {
  function fmtDateTime(str) {
    if (!str) return '—';
    return new Date(str).toLocaleString('id-ID', {
      day:'2-digit', month:'short', year:'numeric',
      hour:'2-digit', minute:'2-digit',
    });
  }

  // Urutkan terbaru di atas
  const sorted = [...versi].reverse();

  return (
    <aside style={{
      background: 'white',
      border: '0.5px solid var(--border)',
      borderRadius: 'var(--r)',
      boxShadow: 'var(--shadow)',
      position: 'sticky',
      top: 78,
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '0.5px solid var(--border-l)',
        background: 'var(--cream)',
      }}>
        <div style={{ fontSize:10, fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-m)', marginBottom:4 }}>
          Riwayat Versi
        </div>
        <div style={{ fontSize:12, color:'var(--ink-l)', fontWeight:500 }}>
          {perhitungan?.judul}
        </div>
        <div style={{ fontSize:11, color:'var(--ink-m)', marginTop:2 }}>
          Dibuat oleh <strong>{perhitungan?.created_by_name}</strong>
        </div>
      </div>

      {/* Version list */}
      <div style={{ padding:'8px 0' }}>
        {sorted.length === 0 && (
          <div style={{ padding:'1rem', fontSize:12, color:'var(--ink-m)', textAlign:'center' }}>
            Belum ada versi.
          </div>
        )}
        {sorted.map((v, idx) => {
          const isActive  = v.id === activeId;
          const isLatest  = idx === 0;
          const isFirst   = v.versi_num === 1;

          return (
            <button
              key={v.id}
              onClick={() => onSelect(v)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 14px',
                border: 'none',
                borderLeft: isActive ? '3px solid var(--teal)' : '3px solid transparent',
                background: isActive ? 'var(--teal-p)' : 'none',
                cursor: 'pointer',
                transition: 'all .12s',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {/* Badge row */}
              <div style={{ display:'flex', gap:4, alignItems:'center', marginBottom:4 }}>
                <span style={{
                  background: isActive ? 'var(--teal)' : 'var(--cream-d)',
                  color: isActive ? 'white' : 'var(--ink-m)',
                  borderRadius: 99, padding:'1px 8px',
                  fontSize: 11, fontWeight: 700,
                }}>
                  v{v.versi_num}
                </span>
                {isLatest && (
                  <span style={{ background:'#1a1916', color:'#f7f4ef', borderRadius:99, padding:'1px 7px', fontSize:10, fontWeight:600 }}>
                    Terbaru
                  </span>
                )}
                {isFirst && (
                  <span style={{ background:'var(--amber-p)', color:'var(--amber)', borderRadius:99, padding:'1px 7px', fontSize:10, fontWeight:600 }}>
                    Awal
                  </span>
                )}
              </div>

              {/* Penulis */}
              <div style={{ fontSize:12, fontWeight:600, color: isActive ? 'var(--teal-d)' : 'var(--ink-l)', marginBottom:2 }}>
                {isFirst ? '✨ ' : '✏️ '}{v.username}
              </div>

              {/* Tanggal */}
              <div style={{ fontSize:11, color:'var(--ink-m)', lineHeight:1.4 }}>
                {fmtDateTime(v.saved_at)}
              </div>

              {/* Preview hasil */}
              {v.hasil && (
                <div style={{
                  marginTop: 6, padding:'4px 8px',
                  background: isActive ? 'rgba(27,107,90,.12)' : 'var(--cream-d)',
                  borderRadius: 4, fontSize:12,
                  color: isActive ? 'var(--teal-d)' : 'var(--ink-l)',
                  fontWeight: 600,
                }}>
                  {v.hasil.total_sdmk} orang SDMK
                </div>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
