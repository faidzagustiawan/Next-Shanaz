// ============================================================
//  KALKULATOR SDMK — Google Apps Script Backend v2
//  Kalkulasi sepenuhnya di frontend.
//  Backend hanya: autentikasi + penyimpanan data + versioning.
// ============================================================

const SHEET_USERS       = 'Users';
const SHEET_PERHITUNGAN = 'Perhitungan';
const SHEET_VERSI       = 'Versi';
const SHEET_LOG         = 'Log';
const SECRET_KEY        = 'SDMK_SECRET_2024';

// ── ENTRY POINT ──────────────────────────────────────────────

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action  = payload.action;
    const token   = payload.token || null;

    if (action === 'login')    return respond(handleLogin(payload));
    if (action === 'register') return respond(handleRegister(payload));

    const user = verifyToken(token);
    if (!user) return respond({ ok: false, error: 'Sesi tidak valid. Silakan login kembali.' });

    switch (action) {
      case 'getProfile':          return respond(getProfile(user));
      case 'updateProfile':       return respond(updateProfile(user, payload));
      case 'changePassword':      return respond(changePassword(user, payload));
      case 'listPerhitungan':     return respond(listPerhitungan(user));
      case 'getPerhitungan':      return respond(getPerhitungan(user, payload));
      case 'createPerhitungan':   return respond(createPerhitungan(user, payload));
      case 'saveVersi':           return respond(saveVersi(user, payload));
      case 'deletePerhitungan':   return respond(deletePerhitungan(user, payload));
      default: return respond({ ok: false, error: 'Action tidak dikenal.' });
    }
  } catch (err) {
    return respond({ ok: false, error: 'Server error: ' + err.message });
  }
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── INISIALISASI SPREADSHEET ─────────────────────────────────

function initSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  function ensureSheet(name, headers) {
    let sh = ss.getSheetByName(name);
    if (!sh) {
      sh = ss.insertSheet(name);
      sh.appendRow(headers);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, headers.length)
        .setBackground('#1B6B5A')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
    }
    return sh;
  }

  ensureSheet(SHEET_USERS, [
    'id','username','name','email','password_hash','role','unit_kerja','created_at','last_login'
  ]);

  // Master perhitungan — hanya metadata, tidak menyimpan data isi
  ensureSheet(SHEET_PERHITUNGAN, [
    'id','judul','unit_kerja','tahun',
    'created_by_id','created_by_name','created_at'
  ]);

  // Setiap simpan/modifikasi = 1 baris baru di sini
  ensureSheet(SHEET_VERSI, [
    'id','perhitungan_id','versi_num',
    'user_id','username',
    'param_json','pokok_json','penunjang_json','hasil_json',
    'saved_at'
  ]);

  ensureSheet(SHEET_LOG, [
    'id','user_id','username','action','detail','timestamp'
  ]);

  // Seed admin default
  const usersSheet = ss.getSheetByName(SHEET_USERS);
  if (usersSheet.getLastRow() <= 1) {
    const now = new Date().toISOString();
    usersSheet.appendRow([
      generateId(),'admin','Administrator','admin@sdmk.local',
      hashPassword('admin123'),'admin','Manajemen',now,''
    ]);
  }
}

// ── AUTH ─────────────────────────────────────────────────────

function handleLogin(payload) {
  const { username, password } = payload;
  if (!username || !password) return { ok: false, error: 'Username dan password wajib diisi.' };

  const user = findUserByUsername(username.toLowerCase().trim());
  if (!user) return { ok: false, error: 'Username tidak ditemukan.' };
  if (user.password_hash !== hashPassword(password)) return { ok: false, error: 'Password salah.' };

  updateUserField(user.id, 'last_login', new Date().toISOString());
  writeLog(user.id, user.username, 'LOGIN', 'Login berhasil');

  return {
    ok: true,
    token: createToken(user.id, user.username, user.role),
    user: { id: user.id, username: user.username, name: user.name, role: user.role, unit_kerja: user.unit_kerja }
  };
}

function handleRegister(payload) {
  const { username, name, email, password, unit_kerja } = payload;
  if (!username || !name || !password) return { ok: false, error: 'Data tidak lengkap.' };
  if (password.length < 6) return { ok: false, error: 'Password minimal 6 karakter.' };

  const existing = findUserByUsername(username.toLowerCase().trim());
  if (existing) return { ok: false, error: 'Username sudah digunakan.' };

  const id = generateId();
  const now = new Date().toISOString();
  getSheet(SHEET_USERS).appendRow([
    id, username.toLowerCase().trim(), name, email || '',
    hashPassword(password), 'user', unit_kerja || '', now, ''
  ]);

  writeLog(id, username, 'REGISTER', 'Akun baru dibuat');
  return {
    ok: true,
    token: createToken(id, username, 'user'),
    user: { id, username, name, role: 'user', unit_kerja: unit_kerja || '' }
  };
}

// ── PROFILE ──────────────────────────────────────────────────

function getProfile(user) {
  const u = findUserById(user.id);
  if (!u) return { ok: false, error: 'User tidak ditemukan.' };
  return {
    ok: true,
    profile: {
      id: u.id, username: u.username, name: u.name,
      email: u.email, role: u.role, unit_kerja: u.unit_kerja,
      created_at: u.created_at, last_login: u.last_login
    }
  };
}

function updateProfile(user, payload) {
  const { name, email, unit_kerja } = payload;
  const sh   = getSheet(SHEET_USERS);
  const rows = sh.getDataRange().getValues();
  const h    = rows[0];
  const idx  = rows.findIndex((r, i) => i > 0 && r[h.indexOf('id')] === user.id);
  if (idx < 0) return { ok: false, error: 'User tidak ditemukan.' };

  const rn = idx + 1;
  if (name !== undefined)       sh.getRange(rn, h.indexOf('name') + 1).setValue(name);
  if (email !== undefined)      sh.getRange(rn, h.indexOf('email') + 1).setValue(email);
  if (unit_kerja !== undefined) sh.getRange(rn, h.indexOf('unit_kerja') + 1).setValue(unit_kerja);

  writeLog(user.id, user.username, 'UPDATE_PROFILE', 'Profil diperbarui');
  return { ok: true };
}

function changePassword(user, payload) {
  const { old_password, new_password } = payload;
  const u = findUserById(user.id);
  if (!u) return { ok: false, error: 'User tidak ditemukan.' };
  if (u.password_hash !== hashPassword(old_password)) return { ok: false, error: 'Password lama salah.' };
  if (!new_password || new_password.length < 6) return { ok: false, error: 'Password baru minimal 6 karakter.' };

  updateUserField(user.id, 'password_hash', hashPassword(new_password));
  writeLog(user.id, user.username, 'CHANGE_PASSWORD', 'Password diubah');
  return { ok: true };
}

// ── PERHITUNGAN ───────────────────────────────────────────────

/**
 * List semua perhitungan (bisa diakses semua user).
 * Sertakan info versi terakhir untuk preview.
 */
function listPerhitungan(user) {
  const shP = getSheet(SHEET_PERHITUNGAN);
  const shV = getSheet(SHEET_VERSI);

  const pRows = shP.getDataRange().getValues();
  const vRows = shV.getDataRange().getValues();

  if (pRows.length <= 1) return { ok: true, data: [] };

  const pH = pRows[0];
  const vH = vRows[0];

  // Bangun map: perhitungan_id → versi terakhir
  const latestVersi = {};
  if (vRows.length > 1) {
    vRows.slice(1).forEach(r => {
      const pid = r[vH.indexOf('perhitungan_id')];
      const vn  = r[vH.indexOf('versi_num')];
      if (!latestVersi[pid] || vn > latestVersi[pid].versi_num) {
        latestVersi[pid] = {
          versi_num:    vn,
          username:     r[vH.indexOf('username')],
          saved_at:     r[vH.indexOf('saved_at')],
          hasil_json:   r[vH.indexOf('hasil_json')]
        };
      }
    });
  }

  const list = pRows.slice(1).map(r => {
    const id  = r[pH.indexOf('id')];
    const lv  = latestVersi[id] || null;
    const hasil = lv && lv.hasil_json ? JSON.parse(lv.hasil_json) : null;
    return {
      id,
      judul:            r[pH.indexOf('judul')],
      unit_kerja:       r[pH.indexOf('unit_kerja')],
      tahun:            r[pH.indexOf('tahun')],
      created_by_id:    r[pH.indexOf('created_by_id')],
      created_by_name:  r[pH.indexOf('created_by_name')],
      created_at:       r[pH.indexOf('created_at')],
      versi_count:      lv ? lv.versi_num : 0,
      last_modified_by: lv ? lv.username : null,
      last_modified_at: lv ? lv.saved_at : null,
      hasil
    };
  }).sort((a, b) => new Date(b.last_modified_at || b.created_at) - new Date(a.last_modified_at || a.created_at));

  return { ok: true, data: list };
}

/**
 * Get 1 perhitungan beserta semua versinya.
 * Semua user bisa akses.
 */
function getPerhitungan(user, payload) {
  const { id } = payload;
  const shP = getSheet(SHEET_PERHITUNGAN);
  const shV = getSheet(SHEET_VERSI);

  const pRows = shP.getDataRange().getValues();
  const pH    = pRows[0];
  const pRow  = pRows.slice(1).find(r => r[pH.indexOf('id')] === id);
  if (!pRow) return { ok: false, error: 'Perhitungan tidak ditemukan.' };

  const vRows = shV.getDataRange().getValues();
  const vH    = vRows[0];

  const versi = vRows.length > 1
    ? vRows.slice(1)
        .filter(r => r[vH.indexOf('perhitungan_id')] === id)
        .map(r => ({
          id:          r[vH.indexOf('id')],
          versi_num:   r[vH.indexOf('versi_num')],
          user_id:     r[vH.indexOf('user_id')],
          username:    r[vH.indexOf('username')],
          param:       r[vH.indexOf('param_json')]   ? JSON.parse(r[vH.indexOf('param_json')])   : {},
          pokok:       r[vH.indexOf('pokok_json')]   ? JSON.parse(r[vH.indexOf('pokok_json')])   : [],
          penunjang:   r[vH.indexOf('penunjang_json')] ? JSON.parse(r[vH.indexOf('penunjang_json')]) : [],
          hasil:       r[vH.indexOf('hasil_json')]   ? JSON.parse(r[vH.indexOf('hasil_json')])   : null,
          saved_at:    r[vH.indexOf('saved_at')]
        }))
        .sort((a, b) => a.versi_num - b.versi_num)
    : [];

  return {
    ok: true,
    perhitungan: {
      id,
      judul:           pRow[pH.indexOf('judul')],
      unit_kerja:      pRow[pH.indexOf('unit_kerja')],
      tahun:           pRow[pH.indexOf('tahun')],
      created_by_id:   pRow[pH.indexOf('created_by_id')],
      created_by_name: pRow[pH.indexOf('created_by_name')],
      created_at:      pRow[pH.indexOf('created_at')]
    },
    versi
  };
}

/**
 * Buat perhitungan baru (master + versi pertama).
 */
function createPerhitungan(user, payload) {
  const { judul, unit_kerja, tahun, param, pokok, penunjang, hasil } = payload;
  const now   = new Date().toISOString();
  const id    = generateId();
  const vId   = generateId();

  getSheet(SHEET_PERHITUNGAN).appendRow([
    id,
    judul || 'Perhitungan Baru',
    unit_kerja || '',
    tahun || new Date().getFullYear(),
    user.id,
    user.name || user.username,
    now
  ]);

  getSheet(SHEET_VERSI).appendRow([
    vId, id, 1,
    user.id, user.username,
    JSON.stringify(param || {}),
    JSON.stringify(pokok || []),
    JSON.stringify(penunjang || []),
    hasil ? JSON.stringify(hasil) : '',
    now
  ]);

  writeLog(user.id, user.username, 'CREATE', `Buat perhitungan: ${id}`);
  return { ok: true, id, versi_num: 1 };
}

/**
 * Simpan versi baru dari perhitungan yang sudah ada.
 * Semua user yang login bisa melakukan ini.
 */
function saveVersi(user, payload) {
  const { perhitungan_id, param, pokok, penunjang, hasil } = payload;
  const now = new Date().toISOString();

  // Cek perhitungan exist
  const shP   = getSheet(SHEET_PERHITUNGAN);
  const pRows = shP.getDataRange().getValues();
  const pH    = pRows[0];
  const pRow  = pRows.slice(1).find(r => r[pH.indexOf('id')] === perhitungan_id);
  if (!pRow) return { ok: false, error: 'Perhitungan tidak ditemukan.' };

  // Cari nomor versi terakhir
  const shV   = getSheet(SHEET_VERSI);
  const vRows = shV.getDataRange().getValues();
  const vH    = vRows[0];

  let maxVersi = 0;
  if (vRows.length > 1) {
    vRows.slice(1).forEach(r => {
      if (r[vH.indexOf('perhitungan_id')] === perhitungan_id) {
        maxVersi = Math.max(maxVersi, r[vH.indexOf('versi_num')]);
      }
    });
  }

  const newVersiNum = maxVersi + 1;
  const vId = generateId();

  shV.appendRow([
    vId, perhitungan_id, newVersiNum,
    user.id, user.username,
    JSON.stringify(param || {}),
    JSON.stringify(pokok || []),
    JSON.stringify(penunjang || []),
    hasil ? JSON.stringify(hasil) : '',
    now
  ]);

  writeLog(user.id, user.username, 'SAVE_VERSI', `Versi ${newVersiNum} pada perhitungan ${perhitungan_id}`);
  return { ok: true, versi_num: newVersiNum, versi_id: vId };
}

/**
 * Hapus seluruh perhitungan beserta semua versinya.
 * Hanya pembuat atau admin.
 */
function deletePerhitungan(user, payload) {
  const { id } = payload;

  const shP   = getSheet(SHEET_PERHITUNGAN);
  const pRows = shP.getDataRange().getValues();
  const pH    = pRows[0];
  const idx   = pRows.findIndex((r, i) => i > 0 && r[pH.indexOf('id')] === id);
  if (idx < 0) return { ok: false, error: 'Perhitungan tidak ditemukan.' };

  const pRow = pRows[idx];
  if (pRow[pH.indexOf('created_by_id')] !== user.id && user.role !== 'admin')
    return { ok: false, error: 'Hanya pembuat atau admin yang bisa menghapus.' };

  // Hapus master
  shP.deleteRow(idx + 1);

  // Hapus semua versi
  const shV   = getSheet(SHEET_VERSI);
  const vRows = shV.getDataRange().getValues();
  const vH    = vRows[0];
  for (let i = vRows.length - 1; i >= 1; i--) {
    if (vRows[i][vH.indexOf('perhitungan_id')] === id) shV.deleteRow(i + 1);
  }

  writeLog(user.id, user.username, 'DELETE', `Hapus perhitungan: ${id}`);
  return { ok: true };
}

// ── USER HELPERS ──────────────────────────────────────────────

function findUserByUsername(username) {
  const sh   = getSheet(SHEET_USERS);
  const rows = sh.getDataRange().getValues();
  const h    = rows[0];
  const row  = rows.slice(1).find(r => r[h.indexOf('username')] === username);
  return row ? rowToObj(h, row) : null;
}

function findUserById(id) {
  const sh   = getSheet(SHEET_USERS);
  const rows = sh.getDataRange().getValues();
  const h    = rows[0];
  const row  = rows.slice(1).find(r => r[h.indexOf('id')] === id);
  return row ? rowToObj(h, row) : null;
}

function updateUserField(userId, field, value) {
  const sh   = getSheet(SHEET_USERS);
  const rows = sh.getDataRange().getValues();
  const h    = rows[0];
  const idx  = rows.findIndex((r, i) => i > 0 && r[h.indexOf('id')] === userId);
  if (idx >= 0) sh.getRange(idx + 1, h.indexOf(field) + 1).setValue(value);
}

// ── TOKEN ─────────────────────────────────────────────────────

function createToken(userId, username, role) {
  const payload = { userId, username, role, exp: Date.now() + 8 * 60 * 60 * 1000 };
  return Utilities.base64Encode(JSON.stringify(payload) + '|' + SECRET_KEY);
}

function verifyToken(token) {
  if (!token) return null;
  try {
    const decoded = Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString();
    const parts   = decoded.split('|');
    if (parts[1] !== SECRET_KEY) return null;
    const payload = JSON.parse(parts[0]);
    if (Date.now() > payload.exp) return null;
    return { id: payload.userId, username: payload.username, role: payload.role };
  } catch (e) { return null; }
}

// ── UTILITIES ─────────────────────────────────────────────────

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) { initSheets(); sh = ss.getSheetByName(name); }
  return sh;
}

function rowToObj(headers, row) {
  const obj = {};
  headers.forEach((h, i) => { obj[h] = row[i]; });
  return obj;
}

function generateId() {
  return Utilities.getUuid().replace(/-/g, '').substring(0, 16);
}

function hashPassword(pw) {
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pw + SECRET_KEY);
  return raw.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function writeLog(userId, username, action, detail) {
  try {
    getSheet(SHEET_LOG).appendRow([generateId(), userId, username, action, detail, new Date().toISOString()]);
  } catch (e) {}
}
