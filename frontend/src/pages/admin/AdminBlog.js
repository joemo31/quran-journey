import React, { useState, useEffect } from 'react';
import { blogAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import MediaEmbed from '../../components/common/MediaEmbed';
import { useApi } from '../../hooks/useApi';
import { format } from 'date-fns';

const EMPTY = {
  title:'', content:'', excerpt:'', image_url:'', video_url:'', youtube_url:'',
  media_type:'image', is_published:false, author_name:'Quran Journey Team', tags:''
};

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open:false, mode:'create', data:null });
  const [form, setForm] = useState(EMPTY);
  const [preview, setPreview] = useState(false);
  const { execute, loading:saving } = useApi();

  const fetch = async () => {
    setLoading(true);
    try { const r = await blogAPI.getAll(); setPosts(r.data.data || []); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setForm(EMPTY); setPreview(false); setModal({ open:true, mode:'create', data:null }); };
  const openEdit = row => {
    setForm({
      title: row.title, content: row.content||'', excerpt: row.excerpt||'',
      image_url: row.image_url||'', video_url: row.video_url||'', youtube_url: row.youtube_url||'',
      media_type: row.media_type||'image', is_published: row.is_published,
      author_name: row.author_name||'', tags: row.tags?.join(',')||''
    });
    setPreview(false);
    setModal({ open:true, mode:'edit', data:row });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : [] };
    await execute(
      () => modal.mode==='create' ? blogAPI.create(payload) : blogAPI.update(modal.data.id, payload),
      { successMsg: modal.mode==='create'?'Post created!':'Post updated!', onSuccess: () => { setModal(m=>({...m,open:false})); fetch(); } }
    );
  };

  const handleDelete  = async id => {
    if (!window.confirm('Delete this post permanently?')) return;
    await execute(() => blogAPI.delete(id), { successMsg:'Post deleted.', onSuccess:fetch });
  };
  const togglePublish = async row => {
    await execute(() => blogAPI.update(row.id,{is_published:!row.is_published}),
      { successMsg: row.is_published?'Unpublished.':'Post published!', onSuccess:fetch });
  };

  const f = v => setForm(p => ({...p, ...v}));

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Blog Posts</h1>
          <p className="text-secondary/60 text-sm mt-0.5">{posts.length} posts total</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">+ New Post</button>
      </div>

      {loading ? <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div> : (
        <div className="space-y-4">
          {posts.length === 0 && <div className="card text-center py-12 text-gray-400"><div className="text-5xl mb-3">✍️</div><p>No blog posts yet.</p></div>}
          {posts.map(p => (
            <div key={p.id} className="card flex gap-4 items-start">
              {/* Thumbnail */}
              <div className="w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                <MediaEmbed url={p.image_url} youtubeUrl={p.youtube_url} videoUrl={p.video_url} mediaType={p.media_type} alt={p.title} aspectRatio="auto" className="w-full h-full"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge ${p.is_published?'badge-success':'badge-warning'}`}>{p.is_published?'Published':'Draft'}</span>
                  {p.youtube_url && <span className="badge bg-red-50 text-red-600 text-xs">📺 YouTube</span>}
                  {p.media_type==='video' && !p.youtube_url && <span className="badge badge-info text-xs">🎬 Video</span>}
                  <span className="text-xs text-gray-400">{format(new Date(p.created_at),'MMM d, yyyy')}</span>
                </div>
                <h3 className="font-display font-bold text-primary text-lg mb-1 truncate">{p.title}</h3>
                <p className="text-sm text-secondary/70 line-clamp-2">{p.excerpt}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={()=>togglePublish(p)} className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${p.is_published?'text-yellow-600 bg-yellow-50 hover:bg-yellow-100':'text-green-600 bg-green-50 hover:bg-green-100'}`}>
                  {p.is_published?'Unpublish':'Publish'}
                </button>
                <button onClick={()=>openEdit(p)} className="btn-secondary text-sm py-1.5 px-3">Edit</button>
                <button onClick={()=>handleDelete(p.id)} className="text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg font-semibold">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal.open} onClose={()=>setModal(m=>({...m,open:false}))} title={modal.mode==='create'?'New Blog Post':'Edit Post'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e=>f({title:e.target.value})} required/></div>
          <div><label className="label">Excerpt (short summary)</label><textarea className="input resize-none" rows={2} value={form.excerpt} onChange={e=>f({excerpt:e.target.value})} placeholder="Short summary shown in blog list..."/></div>

          {/* Media type selector */}
          <div>
            <label className="label">Media Type</label>
            <div className="flex gap-2">
              {[['image','🖼️ Image'],['video','🎬 Video'],['youtube','📺 YouTube']].map(([t,l])=>(
                <button key={t} type="button" onClick={()=>f({media_type:t})}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${form.media_type===t?'border-primary bg-primary text-white':'border-gray-200 text-secondary hover:border-primary hover:text-primary'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Media URL fields */}
          {form.media_type==='image' && (
            <div>
              <label className="label">Image URL</label>
              <input className="input" value={form.image_url} onChange={e=>f({image_url:e.target.value})} placeholder="https://images.unsplash.com/... or any image URL"/>
              {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 h-24 rounded-lg object-cover border border-gray-200" onError={e=>e.target.style.display='none'}/>}
            </div>
          )}
          {form.media_type==='video' && (
            <div>
              <label className="label">Video URL (.mp4, .webm, etc.)</label>
              <input className="input" value={form.video_url} onChange={e=>f({video_url:e.target.value})} placeholder="https://example.com/video.mp4"/>
            </div>
          )}
          {form.media_type==='youtube' && (
            <div>
              <label className="label">YouTube URL</label>
              <input className="input" value={form.youtube_url} onChange={e=>f({youtube_url:e.target.value})}
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."/>
              <p className="text-xs text-gray-400 mt-1">✅ Supports: youtube.com/watch?v=, youtu.be/, youtube.com/shorts/, youtube.com/embed/</p>
              {form.youtube_url && (
                <div className="mt-2 aspect-video rounded-xl overflow-hidden">
                  <MediaEmbed youtubeUrl={form.youtube_url} alt="YouTube preview"/>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Content (HTML supported)</label>
              <button type="button" onClick={()=>setPreview(!preview)} className="text-xs text-primary hover:underline font-medium">
                {preview?'✏️ Edit':'👁 Preview'}
              </button>
            </div>
            {preview ? (
              <div className="input prose prose-sm max-w-none min-h-[200px] overflow-auto"
                dangerouslySetInnerHTML={{__html:form.content}}/>
            ) : (
              <textarea className="input resize-y font-mono text-sm" rows={10} value={form.content}
                onChange={e=>f({content:e.target.value})} placeholder="Write your content here. HTML tags like <h2>, <p>, <strong>, <ul> are supported..."/>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Author Name</label><input className="input" value={form.author_name} onChange={e=>f({author_name:e.target.value})}/></div>
            <div><label className="label">Tags (comma-separated)</label><input className="input" value={form.tags} onChange={e=>f({tags:e.target.value})} placeholder="Tajweed, Quran, Arabic"/></div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id="pub" checked={form.is_published} onChange={e=>f({is_published:e.target.checked})} className="w-4 h-4 accent-primary"/>
            <label htmlFor="pub" className="font-semibold text-secondary text-sm cursor-pointer">Publish immediately</label>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={()=>setModal(m=>({...m,open:false}))} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving?'Saving...':modal.mode==='create'?'Create Post':'Save Changes'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
