import React, { useState, useEffect } from 'react';
import { testimonialsAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';

const EMPTY = { student_name:'', student_country:'', student_avatar_url:'', content:'', video_url:'', media_type:'text', rating:5, is_published:true, sort_order:0 };

export default function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open:false, mode:'create', data:null });
  const [form, setForm] = useState(EMPTY);
  const { execute, loading:saving } = useApi();

  const fetch = async () => {
    setLoading(true);
    try { const r = await testimonialsAPI.getAll(); setItems(r.data.data || []); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setForm(EMPTY); setModal({ open:true, mode:'create', data:null }); };
  const openEdit = row => {
    setForm({ student_name:row.student_name, student_country:row.student_country||'', student_avatar_url:row.student_avatar_url||'', content:row.content, video_url:row.video_url||'', media_type:row.media_type||'text', rating:row.rating||5, is_published:row.is_published, sort_order:row.sort_order||0 });
    setModal({ open:true, mode:'edit', data:row });
  };
  const handleSubmit = async e => {
    e.preventDefault();
    await execute(
      () => modal.mode==='create' ? testimonialsAPI.create(form) : testimonialsAPI.update(modal.data.id, form),
      { successMsg: modal.mode==='create' ? 'Testimonial added!' : 'Updated!', onSuccess: () => { setModal(m=>({...m,open:false})); fetch(); } }
    );
  };
  const handleDelete = async id => {
    if (!window.confirm('Delete this testimonial?')) return;
    await execute(() => testimonialsAPI.delete(id), { successMsg:'Deleted.', onSuccess:fetch });
  };
  const togglePublish = async row => {
    await execute(() => testimonialsAPI.update(row.id, { is_published:!row.is_published }),
      { successMsg: row.is_published ? 'Unpublished.' : 'Published!', onSuccess:fetch }
    );
  };

  const StarPicker = ({ value, onChange }) => (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button" onClick={() => onChange(s)}
          className={`text-2xl transition-transform hover:scale-110 ${s<=value?'text-yellow-400':'text-gray-200'}`}>★</button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Testimonials</h1>
          <p className="text-secondary/60 text-sm mt-0.5">Manage student feedback shown on the website</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">+ Add Testimonial</button>
      </div>

      {loading ? <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.length === 0 && <div className="card col-span-2 text-center py-12 text-gray-400"><div className="text-5xl mb-3">⭐</div><p>No testimonials yet. Add your first one!</p></div>}
          {items.map(t => (
            <div key={t.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {t.student_avatar_url
                    ? <img src={t.student_avatar_url} alt={t.student_name} className="w-12 h-12 rounded-full object-cover"/>
                    : <div className="w-12 h-12 rounded-full bg-primary-50 border-2 border-primary flex items-center justify-center text-primary font-bold text-lg">{t.student_name?.charAt(0)}</div>
                  }
                  <div>
                    <div className="font-semibold text-primary">{t.student_name}</div>
                    <div className="text-xs text-gray-400">{t.student_country || 'Country not set'}</div>
                    <div className="flex gap-0.5 mt-0.5">{[1,2,3,4,5].map(s=><span key={s} className={`text-sm ${s<=t.rating?'text-yellow-400':'text-gray-200'}`}>★</span>)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {t.media_type==='video' && <span className="badge badge-info text-xs">📹 Video</span>}
                  <span className={`badge text-xs ${t.is_published?'badge-success':'badge-warning'}`}>{t.is_published?'Published':'Draft'}</span>
                </div>
              </div>
              <p className="text-secondary/70 text-sm leading-relaxed line-clamp-3 mb-4">{t.content}</p>
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button onClick={() => togglePublish(t)} className={`flex-1 text-sm py-1.5 rounded-lg font-semibold transition-colors ${t.is_published?'text-yellow-600 bg-yellow-50 hover:bg-yellow-100':'text-green-600 bg-green-50 hover:bg-green-100'}`}>
                  {t.is_published?'Unpublish':'Publish'}
                </button>
                <button onClick={() => openEdit(t)} className="flex-1 btn-secondary text-sm py-1.5">Edit</button>
                <button onClick={() => handleDelete(t.id)} className="flex-1 text-sm text-red-500 hover:bg-red-50 py-1.5 rounded-lg font-semibold transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal.open} onClose={() => setModal(m=>({...m,open:false}))} title={modal.mode==='create'?'Add Testimonial':'Edit Testimonial'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Student Name *</label><input className="input" value={form.student_name} onChange={e=>setForm(f=>({...f,student_name:e.target.value}))} required /></div>
            <div><label className="label">Country</label><input className="input" value={form.student_country} onChange={e=>setForm(f=>({...f,student_country:e.target.value}))} placeholder="e.g. United States" /></div>
          </div>
          <div><label className="label">Avatar Image URL</label><input className="input" value={form.student_avatar_url} onChange={e=>setForm(f=>({...f,student_avatar_url:e.target.value}))} placeholder="https://..." /></div>
          <div>
            <label className="label">Type</label>
            <div className="flex gap-3">
              {['text','video'].map(t => (
                <button key={t} type="button" onClick={() => setForm(f=>({...f,media_type:t}))}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all capitalize ${form.media_type===t?'border-primary bg-primary text-white':'border-gray-200 text-secondary hover:border-primary hover:text-primary'}`}>
                  {t==='text'?'💬 Text Review':'📹 Video Testimonial'}
                </button>
              ))}
            </div>
          </div>
          {form.media_type==='video' && <div><label className="label">Video URL</label><input className="input" value={form.video_url} onChange={e=>setForm(f=>({...f,video_url:e.target.value}))} placeholder="https://... (mp4, YouTube embed, etc.)" /></div>}
          <div><label className="label">Comment / Description *</label><textarea className="input resize-none" rows={4} value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} required /></div>
          <div>
            <label className="label">Rating</label>
            <StarPicker value={form.rating} onChange={v => setForm(f=>({...f,rating:v}))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Sort Order</label><input type="number" className="input" value={form.sort_order} onChange={e=>setForm(f=>({...f,sort_order:+e.target.value}))} /></div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={e=>setForm(f=>({...f,is_published:e.target.checked}))} className="w-4 h-4 accent-primary"/>
                <span className="font-semibold text-secondary">Published</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={()=>setModal(m=>({...m,open:false}))} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving?'Saving...':modal.mode==='create'?'Add Testimonial':'Save Changes'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
