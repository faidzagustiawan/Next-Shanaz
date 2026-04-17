// ── CONFIG ──
// Set NEXT_PUBLIC_APPS_SCRIPT_URL di .env.local
const API_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

/**
 * Kirim request ke Google Apps Script backend.
 * Token diambil otomatis dari localStorage.
 */
export async function api(payload) {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('sdmk_token')
      : null;

  const res = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ ...payload, token }),
  });

  const text = await res.text();
  return JSON.parse(text);
}
