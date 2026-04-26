import React, { useState, useEffect, useRef, useCallback } from 'react';
import { mediaAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { mediaUrl } from '../../utils/config';

function bytesToSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Recursively read all files from a FileSystemDirectoryEntry
function readDirectoryEntry(entry, basePath = '') {
  return new Promise((resolve) => {
    const results = [];
    const reader = entry.createReader();
    const readBatch = () => {
      reader.readEntries(async (entries) => {
        if (!entries.length) { resolve(results); return; }
        for (const e of entries) {
          if (e.isFile) {
            await new Promise((res) => {
              e.file((file) => {
                // Attach the relative folder path to each file
                file._folderPath = basePath || entry.name;
                results.push(file);
                res();
              });
            });
          } else if (e.isDirectory) {
            const sub = await readDirectoryEntry(e, `${basePath || entry.name}/${e.name}`);
            results.push(...sub);
          }
        }
        readBatch(); // read next batch (readEntries only returns 100 at a time)
      });
    };
    readBatch();
  });
}

// Extract all files + folder paths from a DataTransfer drop event
async function extractDroppedItems(dataTransfer) {
  const items = [];
  const dtItems = [...dataTransfer.items];

  for (const item of dtItems) {
    if (item.kind !== 'file') continue;
    const entry = item.webkitGetAsEntry?.();
    if (!entry) {
      const file = item.getAsFile();
      if (file) { file._folderPath = 'general'; items.push(file); }
      continue;
    }
    if (entry.isFile) {
      await new Promise((res) => {
        entry.file((file) => { file._folderPath = 'general'; items.push(file); res(); });
      });
    } else if (entry.isDirectory) {
      const files = await readDirectoryEntry(entry);
      items.push(...files);
    }
  }
  return items;
}

const ACCEPTED_MIME = ['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','video/mp4','video/webm','video/quicktime','application/pdf'];

export default function AdminMediaLibrary() {
  const [files,        setFiles]        = useState([]);
  const [folders,      setFolders]      = useState([]);
  const [activeFolder, setActiveFolder] = useState('all');
  const [typeFilter,   setTypeFilter]   = useState('all');
  const [loading,      setLoading]      = useState(true);
  const [selected,     setSelected]     = useState(null);
  const [dragOver,     setDragOver]     = useState(false);

  // Upload state
  const [uploadQueue,  setUploadQueue]  = useState([]);   // { id, file, folder, status, progress }
  const [uploading,    setUploading]    = useState(false);
  const [manualFolder, setManualFolder] = useState('');

  const fileInputRef   = useRef();
  const folderInputRef = useRef();

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeFolder !== 'all') params.folder = activeFolder;
      if (typeFilter   !== 'all') params.type   = typeFilter;
      const [filesRes, foldersRes] = await Promise.all([
        mediaAPI.getAll(params),
        mediaAPI.getFolders(),
      ]);
      setFiles(filesRes.data.data   || []);
      setFolders(foldersRes.data.data || []);
    } catch { toast.error('Failed to load media.'); }
    finally  { setLoading(false); }
  }, [activeFolder, typeFilter]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  // ── Queue files for upload ─────────────────────────────────────────────────
  const queueFiles = (rawFiles) => {
    const override = manualFolder.trim();
    const valid = rawFiles.filter(f => ACCEPTED_MIME.includes(f.type));
    const invalid = rawFiles.length - valid.length;
    if (invalid > 0) toast.error(`${invalid} file(s) skipped — unsupported type.`);
    if (!valid.length) return;

    const items = valid.map(f => ({
      id:       Math.random().toString(36).slice(2),
      file:     f,
      folder:   override || f._folderPath || 'general',
      status:   'pending',   // pending | uploading | done | error
      progress: 0,
    }));

    setUploadQueue(q => [...q, ...items]);
  };

  // ── Process the queue ──────────────────────────────────────────────────────
  const processQueue = useCallback(async () => {
    setUploadQueue(q => {
      const pending = q.filter(i => i.status === 'pending');
      if (!pending.length) return q;

      // Group by folder so we do one request per folder batch
      const byFolder = pending.reduce((acc, item) => {
        (acc[item.folder] = acc[item.folder] || []).push(item);
        return acc;
      }, {});

      setUploading(true);

      (async () => {
        for (const [folder, items] of Object.entries(byFolder)) {
          // Mark as uploading
          setUploadQueue(q2 => q2.map(i =>
            items.find(x => x.id === i.id) ? { ...i, status:'uploading' } : i
          ));

          const fd = new FormData();
          fd.append('folder', folder);
          items.forEach(i => fd.append('files', i.file));

          try {
            await mediaAPI.upload(fd);
            setUploadQueue(q2 => q2.map(i =>
              items.find(x => x.id === i.id) ? { ...i, status:'done', progress:100 } : i
            ));
          } catch {
            setUploadQueue(q2 => q2.map(i =>
              items.find(x => x.id === i.id) ? { ...i, status:'error' } : i
            ));
            toast.error(`Failed to upload files to folder: ${folder}`);
          }
        }

        setUploading(false);
        fetchFiles();
        toast.success('Upload complete! 🎉');
      })();

      return q; // state update happens inside async above
    });
  }, [fetchFiles]);

  // Auto-start processing when queue grows
  useEffect(() => {
    if (!uploading && uploadQueue.some(i => i.status === 'pending')) {
      processQueue();
    }
  }, [uploadQueue, uploading, processQueue]);

  // ── Drop handler ───────────────────────────────────────────────────────────
  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const extracted = await extractDroppedItems(e.dataTransfer);
    if (!extracted.length) { toast.error('No supported files found.'); return; }
    queueFiles(extracted);
    toast(`Queued ${extracted.length} file(s) for upload…`);
  };

  // ── Input handlers ─────────────────────────────────────────────────────────
  const handleFileInput = (e) => {
    const raw = Array.from(e.target.files || []);
    raw.forEach(f => { f._folderPath = manualFolder.trim() || 'general'; });
    queueFiles(raw);
    e.target.value = '';
  };

  const handleFolderInput = (e) => {
    const raw = Array.from(e.target.files || []);
    raw.forEach(f => {
      // webkitRelativePath = "FolderName/sub/file.jpg"
      const parts = f.webkitRelativePath?.split('/') || [];
      const folder = manualFolder.trim() || (parts.length > 1 ? parts.slice(0,-1).join('/') : 'general');
      f._folderPath = folder;
    });
    queueFiles(raw);
    e.target.value = '';
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this file permanently?')) return;
    try {
      await mediaAPI.delete(id);
      toast.success('File deleted.');
      setSelected(null);
      fetchFiles();
    } catch { toast.error('Delete failed.'); }
  };

  const copyUrl = (fileUrl) => {
    navigator.clipboard.writeText(mediaUrl(fileUrl))
      .then(() => toast.success('URL copied to clipboard!'))
      .catch(() => toast.error('Copy failed.'));
  };

  const isImage = m => m?.mime_type?.startsWith('image/');
  const isVideo = m => m?.mime_type?.startsWith('video/');

  const queueDone    = uploadQueue.filter(i => i.status === 'done').length;
  const queueTotal   = uploadQueue.filter(i => i.status !== 'done').length + queueDone;
  const queuePending = uploadQueue.filter(i => i.status === 'pending' || i.status === 'uploading').length;

  const allFolderTabs = [{ folder:'all', count: files.length }, ...folders];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Media Library</h1>
        <p className="text-secondary/60 text-sm mt-0.5">Upload images, videos, and folders — drag & drop supported</p>
      </div>

      {/* ── Upload Zone ── */}
      <div
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer
          ${dragOver ? 'border-primary bg-primary-50 scale-[1.01]' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          <div className="text-5xl mb-3 transition-transform duration-200">{dragOver ? '📂' : '☁️'}</div>
          <p className="font-display font-bold text-primary text-xl mb-1">
            {dragOver ? 'Drop your files or folders here!' : 'Drag & drop files or entire folders'}
          </p>
          <p className="text-secondary/60 text-sm mb-6">
            Supports images, videos (up to 50MB each). Drop a whole folder to preserve its structure.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary text-sm px-5"
            >
              📎 Choose Files
            </button>
            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="btn-secondary text-sm px-5"
            >
              📁 Upload Folder
            </button>
          </div>

          {/* Folder name override */}
          <div className="flex items-center justify-center gap-2 text-sm" onClick={e => e.stopPropagation()}>
            <span className="text-secondary/60 font-medium">Save to folder:</span>
            <input
              className="input py-1.5 text-sm w-44"
              value={manualFolder}
              onChange={e => setManualFolder(e.target.value)}
              placeholder="auto (from folder name)"
            />
            {manualFolder && (
              <button onClick={() => setManualFolder('')} className="text-gray-400 hover:text-red-500 text-xs">✕ clear</button>
            )}
          </div>

          {/* Hidden inputs */}
          <input ref={fileInputRef}   type="file" multiple accept="image/*,video/*,.pdf" className="hidden" onChange={handleFileInput} />
          <input ref={folderInputRef} type="file" multiple accept="image/*,video/*,.pdf" className="hidden" onChange={handleFolderInput}
            // @ts-ignore
            webkitdirectory="true" directory="true" mozdirectory="true"
          />
        </div>

        {/* Upload progress overlay */}
        {queueTotal > 0 && (
          <div className="border-t border-gray-100 bg-white/80 backdrop-blur-sm rounded-b-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-primary">
                {queuePending > 0
                  ? `⏫ Uploading… ${queueDone}/${queueTotal} files`
                  : `✅ All ${queueTotal} files uploaded`}
              </span>
              {queuePending === 0 && (
                <button onClick={() => setUploadQueue([])} className="text-xs text-gray-400 hover:text-red-500">Clear</button>
              )}
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: queueTotal > 0 ? `${(queueDone / queueTotal) * 100}%` : '0%' }}
              />
            </div>
            {/* File list preview */}
            <div className="mt-3 max-h-32 overflow-y-auto space-y-1">
              {uploadQueue.slice(0, 50).map(item => (
                <div key={item.id} className="flex items-center gap-2 text-xs">
                  <span className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px]
                    ${item.status==='done'?'bg-green-500':item.status==='error'?'bg-red-500':item.status==='uploading'?'bg-blue-500 animate-pulse':'bg-gray-300'}`}>
                    {item.status==='done'?'✓':item.status==='error'?'✕':item.status==='uploading'?'↑':'…'}
                  </span>
                  <span className="text-gray-500 truncate flex-1">{item.file.name}</span>
                  <span className="text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono flex-shrink-0">{item.folder}</span>
                </div>
              ))}
              {uploadQueue.length > 50 && (
                <p className="text-xs text-gray-400 text-center">+{uploadQueue.length - 50} more files</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        {/* Folder tabs */}
        <div className="flex flex-wrap gap-2">
          {allFolderTabs.map(f => (
            <button key={f.folder} onClick={() => setActiveFolder(f.folder)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5
                ${activeFolder===f.folder?'bg-primary text-white shadow-md':'bg-gray-100 text-secondary hover:bg-gray-200'}`}>
              📁 {f.folder === 'all' ? 'All Folders' : f.folder}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeFolder===f.folder?'bg-white/20 text-white':'bg-gray-200 text-gray-500'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
        {/* Type filter */}
        <div className="flex gap-2">
          {[['all','All'],['image','🖼️ Images'],['video','🎬 Videos']].map(([v,l]) => (
            <button key={v} onClick={() => setTypeFilter(v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${typeFilter===v?'bg-primary text-white':'bg-gray-100 text-secondary hover:bg-gray-200'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid + Detail Panel ── */}
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
            </div>
          ) : files.length === 0 ? (
            <div className="card text-center py-20 text-gray-400">
              <div className="text-6xl mb-4">📂</div>
              <p className="font-medium text-lg">No files here yet</p>
              <p className="text-sm mt-1">Drag & drop files or folders above to upload</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {files.map(file => (
                <div key={file.id}
                  onClick={() => setSelected(selected?.id === file.id ? null : file)}
                  className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all group aspect-square
                    ${selected?.id===file.id ? 'border-primary shadow-lg scale-[1.02]' : 'border-transparent hover:border-primary/50 hover:shadow-md'}`}>
                  {isImage(file) ? (
                    <img src={mediaUrl(file.file_url)} alt={file.alt_text || file.original_name}
                      className="w-full h-full object-cover"/>
                  ) : isVideo(file) ? (
                    <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center gap-2">
                      <span className="text-4xl">🎬</span>
                      <span className="text-white text-xs px-2 text-center truncate w-full leading-tight">{file.original_name}</span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center gap-2">
                      <span className="text-4xl">📄</span>
                      <span className="text-gray-500 text-xs px-2 text-center truncate w-full">{file.original_name}</span>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"/>
                  {/* Selected check */}
                  {selected?.id === file.id && (
                    <div className="absolute top-2 right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">✓</div>
                  )}
                  {/* Folder badge */}
                  {file.folder && file.folder !== 'general' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1 truncate">
                      📁 {file.folder}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Detail Panel ── */}
        {selected && (
          <div className="w-72 flex-shrink-0">
            <div className="card sticky top-6 space-y-4">
              {/* Preview */}
              <div className="rounded-xl overflow-hidden bg-gray-100 aspect-video flex items-center justify-center">
                {isImage(selected) ? (
                  <img src={mediaUrl(selected.file_url)} alt={selected.original_name}
                    className="max-w-full max-h-full object-contain"/>
                ) : isVideo(selected) ? (
                  <video src={mediaUrl(selected.file_url)} controls className="max-w-full max-h-full"/>
                ) : (
                  <span className="text-6xl">📄</span>
                )}
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm">
                <div className="font-semibold text-primary break-all">{selected.original_name}</div>
                <div className="flex items-center gap-2 text-gray-400">
                  <span>📁</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{selected.folder}</span>
                </div>
                <div className="text-gray-400">📦 {bytesToSize(selected.file_size)}</div>
                <div className="text-gray-400">🗓 {new Date(selected.created_at).toLocaleDateString()}</div>
              </div>

              {/* URL copy */}
              <div>
                <label className="label text-xs mb-1">File URL</label>
                <div className="flex gap-1.5">
                  <input readOnly className="input text-xs py-1.5 flex-1 bg-gray-50 font-mono"
                    value={mediaUrl(selected.file_url)}/>
                  <button onClick={() => copyUrl(selected.file_url)}
                    className="btn-secondary text-xs py-1.5 px-2.5 whitespace-nowrap">Copy</button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => handleDelete(selected.id)}
                  className="flex-1 text-sm text-red-500 hover:bg-red-50 py-2 rounded-lg font-semibold transition-colors">
                  🗑 Delete
                </button>
                <button onClick={() => setSelected(null)}
                  className="flex-1 btn-secondary text-sm py-2">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
