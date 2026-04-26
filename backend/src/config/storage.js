const fs = require('fs');
const path = require('path');

const supabaseUrl = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const supabaseStorageBucket = (process.env.SUPABASE_STORAGE_BUCKET || '').trim();

const isSupabaseStorageEnabled = () =>
  Boolean(supabaseUrl && supabaseServiceRoleKey && supabaseStorageBucket);

const normalizeFolder = (folder) => {
  const normalized = String(folder || '')
    .replace(/\\/g, '/')
    .split('/')
    .map((segment) => segment.trim().replace(/[^a-zA-Z0-9_-]+/g, '-'))
    .filter(Boolean)
    .join('/');

  return normalized || 'general';
};

const encodeObjectPath = (objectPath) =>
  objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

const getSupabasePublicUrl = (objectPath) =>
  `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(supabaseStorageBucket)}/${encodeObjectPath(objectPath)}`;

const buildLocalFileUrl = (folder, filename) => {
  const normalizedFolder = normalizeFolder(folder);
  return `/${path.posix.join('uploads', normalizedFolder, filename)}`;
};

const uploadLocalFileToSupabase = async (file, folder) => {
  if (typeof fetch !== 'function') {
    throw new Error('Global fetch is not available in this Node runtime.');
  }

  const normalizedFolder = normalizeFolder(folder);
  const objectPath = `${normalizedFolder}/${file.filename}`;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${encodeURIComponent(supabaseStorageBucket)}/${encodeObjectPath(objectPath)}`;
  const fileBuffer = await fs.promises.readFile(file.path);

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        apikey: supabaseServiceRoleKey,
        'Content-Type': file.mimetype || 'application/octet-stream',
        'cache-control': '3600',
        'x-upsert': 'false',
      },
      body: fileBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase upload failed (${response.status}): ${errorText}`);
    }

    return {
      filePath: objectPath,
      fileUrl: getSupabasePublicUrl(objectPath),
      folder: normalizedFolder,
    };
  } finally {
    await fs.promises.unlink(file.path).catch(() => {});
  }
};

const isSupabasePublicFile = (fileUrl) => {
  if (!supabaseUrl || !supabaseStorageBucket || !fileUrl) return false;
  const prefix = `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(supabaseStorageBucket)}/`;
  return fileUrl.startsWith(prefix);
};

const removeManagedFile = async (filePath, fileUrl) => {
  if (typeof fetch === 'function' && isSupabasePublicFile(fileUrl)) {
    const objectPath = String(filePath || '').replace(/^\/+/, '');

    if (objectPath) {
      const deleteUrl = `${supabaseUrl}/storage/v1/object/${encodeURIComponent(supabaseStorageBucket)}/${encodeObjectPath(objectPath)}`;
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${supabaseServiceRoleKey}`,
          apikey: supabaseServiceRoleKey,
        },
      });

      if (!response.ok && response.status !== 404) {
        const errorText = await response.text();
        throw new Error(`Supabase delete failed (${response.status}): ${errorText}`);
      }
    }

    return;
  }

  if (filePath && fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath).catch(() => {});
  }
};

module.exports = {
  buildLocalFileUrl,
  getSupabasePublicUrl,
  isSupabaseStorageEnabled,
  normalizeFolder,
  removeManagedFile,
  uploadLocalFileToSupabase,
};
