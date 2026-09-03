/**
 * Aspekte B1+ Cloud Sync backend
 * Deploy as a Google Apps Script Web App:
 *   Execute as: Me
 *   Who has access: Anyone
 * The client uses a long private sync key. The key itself is never used as a Drive filename.
 */
const ASPEKTE_B1_SYNC_FOLDER = 'Aspekte B1 Cloud Sync';
const ASPEKTE_B1_BACKEND_VERSION = '1.0';

function doGet(e) {
  const p = (e && e.parameter) || {};
  const callback = String(p.callback || '');
  try {
    const action = String(p.action || 'ping').toLowerCase();
    if (action === 'ping') {
      return respond_({ ok: true, app: 'Aspekte B1 Cloud Sync', version: ASPEKTE_B1_BACKEND_VERSION }, callback);
    }
    if (action === 'pull') {
      const key = validateKey_(p.key);
      const record = readRecord_(key);
      return respond_({ ok: true, found: !!record, record: record || null }, callback);
    }
    return respond_({ ok: false, error: 'Unknown action.' }, callback);
  } catch (err) {
    return respond_({ ok: false, error: String(err && err.message || err) }, callback);
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (String(body.action || '').toLowerCase() !== 'push') {
      return respond_({ ok: false, error: 'Unknown action.' }, '');
    }
    const key = validateKey_(body.key);
    if (!body.state || typeof body.state !== 'object') throw new Error('Missing progress state.');
    const incomingAt = Number(body.updatedAt || Date.now());
    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      const existing = readRecord_(key);
      if (existing && Number(existing.updatedAt || 0) > incomingAt) {
        return respond_({ ok: true, saved: false, reason: 'newer-cloud-copy-exists', updatedAt: existing.updatedAt }, '');
      }
      const record = {
        app: 'Aspekte B1+',
        schema: 1,
        updatedAt: incomingAt,
        savedAt: new Date().toISOString(),
        state: body.state
      };
      writeRecord_(key, record);
      return respond_({ ok: true, saved: true, updatedAt: incomingAt }, '');
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return respond_({ ok: false, error: String(err && err.message || err) }, '');
  }
}

function validateKey_(value) {
  const key = String(value || '').trim();
  if (key.length < 16 || key.length > 160) throw new Error('Invalid sync key.');
  if (!/^[A-Za-z0-9._~-]+$/.test(key)) throw new Error('Sync key contains unsupported characters.');
  return key;
}

function folder_() {
  const it = DriveApp.getFoldersByName(ASPEKTE_B1_SYNC_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(ASPEKTE_B1_SYNC_FOLDER);
}

function fileName_(key) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, key, Utilities.Charset.UTF_8);
  return 'progress-' + Utilities.base64EncodeWebSafe(digest).replace(/=+$/g, '') + '.json';
}

function readRecord_(key) {
  const files = folder_().getFilesByName(fileName_(key));
  if (!files.hasNext()) return null;
  try {
    return JSON.parse(files.next().getBlob().getDataAsString('UTF-8'));
  } catch (err) {
    throw new Error('Stored cloud progress is unreadable.');
  }
}

function writeRecord_(key, record) {
  const folder = folder_();
  const name = fileName_(key);
  const content = JSON.stringify(record);
  const files = folder.getFilesByName(name);
  if (files.hasNext()) {
    const file = files.next();
    file.setContent(content);
    while (files.hasNext()) files.next().setTrashed(true);
  } else {
    folder.createFile(name, content, MimeType.PLAIN_TEXT);
  }
}

function respond_(obj, callback) {
  const json = JSON.stringify(obj);
  if (callback) {
    if (!/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Invalid callback.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
