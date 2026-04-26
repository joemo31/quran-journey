import React, { useState, useEffect, useCallback } from 'react';
import { siteContentAPI, mediaAPI } from '../../services/api';
import { useSiteContent } from '../../context/SiteContentContext';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { mediaUrl } from '../../utils/config';

const PAGES = [
  { key: 'global',   label: '🌐 Global', desc: 'Logo, contact info, footer — applies to ALL pages' },
  { key: 'home',     label: '🏠 Home',     desc: 'Hero, stats, programs, CTA, contact section' },
  { key: 'about',    label: 'ℹ️ About',    desc: 'Hero, mission text, stats, team section' },
  { key: 'courses',  label: '📚 Courses',  desc: 'Hero, feature badges, CTA section' },
  { key: 'pricing',  label: '💳 Pricing',  desc: 'Hero, offers strip, FAQ, CTA section' },
  { key: 'blog',     label: '✍️ Blog',     desc: 'Hero title, subtitle, CTA section' },
  { key: 'contact',  label: '📞 Contact',  desc: 'Hero, form title, info section' },
  { key: 'feedback', label: '⭐ Feedback', desc: 'Hero, video section, reviews section, CTA' },
];

const TYPE_ICON = { text: '✏️', html: '📝', image: '🖼️', video: '🎬' };

export default function AdminSiteEditor() {
  const [selectedPage, setSelectedPage] = useState('global');
  const [allRows,  setAllRows]  = useState([]);   // all rows from DB
  const [edits,    setEdits]    = useState({});   // id → edited value
  const [dirty,    setDirty]    = useState(false);
  const [mediaList,setMediaList]= useState([]);
  const [mediaPicker,setMediaPicker] = useState({ open:false, rowId:null });
  const [loading,  setLoading]  = useState(true);
  const { refresh: refreshGlobal } = useSiteContent();
  const { execute, loading: saving } = useApi();

  // ── Fetch ALL content once ────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const r = await siteContentAPI.getAll();
      const rows = r.data.data || [];
      setAllRows(rows);
      const e = {};
      rows.forEach(row => { e[row.id] = row.value || ''; });
      setEdits(e);
      setDirty(false);
    } catch { toast.error('Failed to load site content.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Filter rows for selected page tab
  const pageRows = allRows.filter(r => r.page === selectedPage);

  // Group by section
  const sections = pageRows.reduce((acc, row) => {
    if (!acc[row.section]) acc[row.section] = [];
    acc[row.section].push(row);
    return acc;
  }, {});

  const handleChange = (id, value) => {
    setEdits(e => ({ ...e, [id]: value }));
    setDirty(true);
  };

  // ── Save ALL changes for selected page ────────────────────────────────────
  const handleSave = async () => {
    const updates = pageRows.map(row => ({
      page:    row.page,
      section: row.section,
      key:     row.key,
      value:   edits[row.id] ?? row.value ?? '',
      type:    row.type,
      label:   row.label,
    }));
    await execute(
      () => siteContentAPI.bulkUpdate(updates),
      {
        successMsg: '✅ Changes saved and live on the website!',
        onSuccess: () => {
          setDirty(false);
          refreshGlobal();   // update header/footer/etc immediately
        }
      }
    );
  };

  // ── Media picker ─────────────────────────────────────────────────────────
  const openPicker = async (rowId) => {
    try {
      const r = await mediaAPI.getAll({ type: 'image' });
      setMediaList(r.data.data || []);
    } catch {}
    setMediaPicker({ open: true, rowId });
  };

  const pickMedia = (file) => {
    const url = mediaUrl(file.file_url);
    handleChange(mediaPicker.rowId, url);
    setMediaPicker({ open: false, rowId: null });
    toast.success('Image selected!');
  };

  const pageInfo = PAGES.find(p => p.key === selectedPage);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Site Editor</h1>
          <p className="text-secondary/60 text-sm mt-0.5">Edit any text, image, or content on your website — changes go live instantly</p>
        </div>
        <button onClick={handleSave} disabled={saving || !dirty}
          className={`btn-primary text-sm transition-all ${!dirty && !saving ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {saving
            ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Saving...</span>
            : dirty ? '💾 Save Changes' : '✓ All Saved'}
        </button>
      </div>

      {/* Page tabs */}
      <div className="flex flex-wrap gap-2">
        {PAGES.map(p => (
          <button key={p.key} onClick={() => setSelectedPage(p.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap
              ${selectedPage === p.key
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-secondary hover:bg-primary-50 hover:text-primary border border-gray-200'}`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Page description */}
      {pageInfo && (
        <div className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-2
          ${selectedPage === 'global' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-primary-50 border-primary-100 text-primary'}`}>
          <span>{selectedPage === 'global' ? '⚠️' : 'ℹ️'}</span>
          <span>{pageInfo.desc}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : pageRows.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📄</div>
          <p className="font-medium">No editable content for this page.</p>
          <p className="text-sm mt-1">Make sure you've run the database migration: <code className="bg-gray-100 px-2 py-0.5 rounded">npm run migrate</code></p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(sections).map(([section, rows]) => (
            <div key={section} className="card">
              <h3 className="font-display font-bold text-primary text-lg mb-1 pb-3 border-b border-gray-100 capitalize">
                {section.replace(/_/g, ' ')}
              </h3>
              <div className="space-y-5 mt-4">
                {rows.map(row => (
                  <div key={row.id}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base" title={row.type}>{TYPE_ICON[row.type] || '✏️'}</span>
                      <label className="label mb-0 text-sm">{row.label || row.key}</label>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{row.type}</span>
                    </div>

                    {/* IMAGE field */}
                    {row.type === 'image' && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            className="input flex-1 text-sm"
                            value={edits[row.id] || ''}
                            onChange={e => handleChange(row.id, e.target.value)}
                            placeholder="Paste image URL or pick from Media Library..."
                          />
                          <button type="button" onClick={() => openPicker(row.id)}
                            className="btn-secondary text-sm whitespace-nowrap px-3">
                            📁 Pick
                          </button>
                        </div>
                        {edits[row.id] && (
                          <div className="flex items-start gap-3">
                            <img src={mediaUrl(edits[row.id])} alt="preview"
                              className="h-20 w-auto max-w-xs rounded-lg object-cover border border-gray-200"
                              onError={e => { e.target.style.display='none'; }}
                            />
                            <button type="button" onClick={() => handleChange(row.id, '')}
                              className="text-xs text-red-500 hover:underline mt-1">✕ Remove</button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* VIDEO field */}
                    {row.type === 'video' && (
                      <div className="flex gap-2">
                        <input
                          className="input flex-1 text-sm"
                          value={edits[row.id] || ''}
                          onChange={e => handleChange(row.id, e.target.value)}
                          placeholder="Paste video URL..."
                        />
                      </div>
                    )}

                    {/* HTML field */}
                    {row.type === 'html' && (
                      <textarea
                        className="input resize-y font-mono text-sm"
                        rows={5}
                        value={edits[row.id] || ''}
                        onChange={e => handleChange(row.id, e.target.value)}
                        placeholder="HTML content..."
                      />
                    )}

                    {/* TEXT field */}
                    {row.type === 'text' && (
                      (edits[row.id]?.length > 80 || row.label?.toLowerCase().includes('text') || row.label?.toLowerCase().includes('body') || row.label?.toLowerCase().includes('subtitle'))
                        ? <textarea
                            className="input resize-y text-sm"
                            rows={2}
                            value={edits[row.id] || ''}
                            onChange={e => handleChange(row.id, e.target.value)}
                            placeholder={`Enter ${row.label || row.key}...`}
                          />
                        : <input
                            className="input text-sm"
                            value={edits[row.id] || ''}
                            onChange={e => handleChange(row.id, e.target.value)}
                            placeholder={`Enter ${row.label || row.key}...`}
                          />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sticky save button (bottom) when dirty */}
      {dirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button onClick={handleSave} disabled={saving}
            className="btn-primary px-8 py-3.5 shadow-2xl text-base flex items-center gap-2">
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Saving...</>
              : <>💾 Save All Changes</>}
          </button>
        </div>
      )}

      {/* ── Media Picker Modal ── */}
      {mediaPicker.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMediaPicker({ open:false, rowId:null })}/>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-display font-bold text-primary text-xl">Pick from Media Library</h3>
              <button onClick={() => setMediaPicker({ open:false, rowId:null })} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 text-xl">✕</button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              {mediaList.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <div className="text-5xl mb-3">🖼️</div>
                  <p className="font-medium">No images uploaded yet.</p>
                  <p className="text-sm mt-1">Go to <strong>Media Library</strong> to upload images first.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mediaList.map(file => {
                    const url = mediaUrl(file.file_url);
                    return (
                      <button key={file.id} onClick={() => pickMedia(file)}
                        className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-all group relative bg-gray-100">
                        <img src={url} alt={file.alt_text || file.original_name} className="w-full h-full object-cover"/>
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/30 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 text-white font-bold text-sm bg-primary/80 px-2 py-1 rounded-lg">Select</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
