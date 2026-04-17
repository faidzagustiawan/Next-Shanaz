/** Format angka ke locale Indonesia, dibulatkan */
export function fmt(n) {
  return Math.round(n).toLocaleString('id-ID');
}

/** Escape HTML untuk mencegah XSS */
export function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
