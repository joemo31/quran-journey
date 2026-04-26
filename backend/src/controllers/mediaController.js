const { query } = require('../config/database');
const {
  buildLocalFileUrl,
  isSupabaseStorageEnabled,
  normalizeFolder,
  removeManagedFile,
  uploadLocalFileToSupabase,
} = require('../config/storage');

const upload = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }
    const folder = normalizeFolder(req.body.folder);
    const results = [];
    for (const file of req.files) {
      let filePath = file.path;
      let fileUrl = buildLocalFileUrl(folder, file.filename);

      if (isSupabaseStorageEnabled()) {
        const uploaded = await uploadLocalFileToSupabase(file, folder);
        filePath = uploaded.filePath;
        fileUrl = uploaded.fileUrl;
      }

      const result = await query(
        `INSERT INTO media_library (filename, original_name, file_path, file_url, mime_type, file_size, folder, uploaded_by, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()) RETURNING *`,
        [file.filename, file.originalname, filePath, fileUrl, file.mimetype, file.size, folder, req.user.id]
      );
      results.push(result.rows[0]);
    }
    res.status(201).json({ success: true, data: results });
  } catch (e) { next(e); }
};

const getAll = async (req, res, next) => {
  try {
    const { folder, type } = req.query;
    let where = '1=1';
    const params = [];
    let idx = 1;
    if (folder) { where += ` AND folder=$${idx++}`; params.push(folder); }
    if (type === 'image') { where += ` AND mime_type LIKE $${idx++}`; params.push('image/%'); }
    if (type === 'video') { where += ` AND mime_type LIKE $${idx++}`; params.push('video/%'); }
    const result = await query(`SELECT * FROM media_library WHERE ${where} ORDER BY created_at DESC`, params);
    res.json({ success: true, data: result.rows });
  } catch (e) { next(e); }
};

const getFolders = async (req, res, next) => {
  try {
    const result = await query('SELECT DISTINCT folder, COUNT(*) as count FROM media_library GROUP BY folder ORDER BY folder');
    res.json({ success: true, data: result.rows });
  } catch (e) { next(e); }
};

const updateAlt = async (req, res, next) => {
  try {
    const { alt_text } = req.body;
    const result = await query('UPDATE media_library SET alt_text=$1 WHERE id=$2 RETURNING *', [alt_text, req.params.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    const result = await query('SELECT file_path, file_url FROM media_library WHERE id=$1', [req.params.id]);
    if (result.rows.length) {
      await removeManagedFile(result.rows[0].file_path, result.rows[0].file_url);
    }
    await query('DELETE FROM media_library WHERE id=$1', [req.params.id]);
    res.json({ success: true, message: 'File deleted.' });
  } catch (e) { next(e); }
};

module.exports = { upload, getAll, getFolders, updateAlt, remove };
