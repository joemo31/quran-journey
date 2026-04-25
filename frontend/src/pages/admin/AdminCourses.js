import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import { useApi } from '../../hooks/useApi';

const EMPTY = { name:'',description:'',price:'',currency:'USD',duration_weeks:'',level:'',is_active:true,sort_order:0 };

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open:false, mode:'create', data:null });
  const [form, setForm] = useState(EMPTY);
  const { execute, loading:saving } = useApi();

  const fetch = async () => { setLoading(true); try { const r=await coursesAPI.getAll(); setCourses(r.data.data); }catch{} finally{setLoading(false);} };
  useEffect(()=>{fetch();},[]);

  const openCreate = () => { setForm(EMPTY); setModal({open:true,mode:'create',data:null}); };
  const openEdit = row => {
    setForm({name:row.name,description:row.description||'',price:row.price,currency:row.currency,duration_weeks:row.duration_weeks||'',level:row.level||'',is_active:row.is_active,sort_order:row.sort_order});
    setModal({open:true,mode:'edit',data:row});
  };
  const handleSubmit = async e => {
    e.preventDefault();
    await execute(
      ()=>modal.mode==='create'?coursesAPI.create(form):coursesAPI.update(modal.data.id,form),
      {successMsg:modal.mode==='create'?'Course created!':'Course updated!',onSuccess:()=>{setModal(m=>({...m,open:false}));fetch();}}
    );
  };
  const handleDelete = async id => {
    if(!window.confirm('Deactivate this course?'))return;
    await execute(()=>coursesAPI.delete(id),{successMsg:'Course deactivated.',onSuccess:fetch});
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-primary">Courses</h1>
        <button onClick={openCreate} className="btn-primary text-sm">+ Add Course</button>
      </div>
      {loading ? <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(c => (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <span className={`badge ${c.is_active?'badge-success':'badge-error'}`}>{c.is_active?'Active':'Inactive'}</span>
                <span className="text-2xl font-bold text-primary font-display">${c.price}</span>
              </div>
              <h3 className="font-display font-bold text-lg text-primary mb-1">{c.name}</h3>
              {c.level && <span className="badge badge-info mb-2">{c.level}</span>}
              <p className="text-secondary/70 text-sm leading-relaxed mb-4 line-clamp-3">{c.description}</p>
              {c.duration_weeks && <p className="text-xs text-gray-400 mb-4">{c.duration_weeks} weeks</p>}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button onClick={()=>openEdit(c)} className="flex-1 btn-secondary text-sm py-2">Edit</button>
                <button onClick={()=>handleDelete(c.id)} className="flex-1 text-center text-sm py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-semibold">Deactivate</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal isOpen={modal.open} onClose={()=>setModal(m=>({...m,open:false}))} title={modal.mode==='create'?'Add Course':'Edit Course'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Course Name</label><input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required /></div>
          <div><label className="label">Description</label><textarea className="input resize-none" rows={4} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Price ($)</label><input type="number" className="input" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} required min="0" /></div>
            <div><label className="label">Duration (weeks)</label><input type="number" className="input" value={form.duration_weeks} onChange={e=>setForm(f=>({...f,duration_weeks:e.target.value}))} /></div>
            <div><label className="label">Sort Order</label><input type="number" className="input" value={form.sort_order} onChange={e=>setForm(f=>({...f,sort_order:e.target.value}))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Level</label>
              <select className="input" value={form.level} onChange={e=>setForm(f=>({...f,level:e.target.value}))}>
                <option value="">Select level</option>
                {['Beginner','Intermediate','Advanced','All Levels'].map(l=><option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))} className="w-4 h-4 accent-primary" />
                <span className="font-semibold text-secondary">Active</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={()=>setModal(m=>({...m,open:false}))} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving?'Saving...':modal.mode==='create'?'Create':'Save Changes'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
