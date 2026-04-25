import React, { useState, useEffect } from 'react';
import { sessionsAPI, usersAPI, coursesAPI } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { useApi } from '../../hooks/useApi';
import { format } from 'date-fns';

const EMPTY = { student_id:'',teacher_id:'',course_id:'',scheduled_at:'',meeting_link:'',notes:'' };

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [modal, setModal] = useState({open:false,mode:'create',data:null});
  const [form, setForm] = useState(EMPTY);
  const { execute, loading:saving } = useApi();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s,st,te,c] = await Promise.all([
        sessionsAPI.getAll(filter?{status:filter}:{}),
        usersAPI.getStudents(),
        usersAPI.getTeachers(),
        coursesAPI.getAll({is_active:'true'}),
      ]);
      setSessions(s.data.data); setStudents(st.data.data); setTeachers(te.data.data); setCourses(c.data.data);
    } catch{} finally{setLoading(false);}
  };

  useEffect(()=>{fetchAll();},[filter]);

  const handleSubmit = async e => {
    e.preventDefault();
    await execute(
      ()=>modal.mode==='create'?sessionsAPI.create(form):sessionsAPI.update(modal.data.id,form),
      {successMsg:modal.mode==='create'?'Session created!':'Session updated!',onSuccess:()=>{setModal(m=>({...m,open:false}));fetchAll();}}
    );
  };

  const handleDelete = async id => {
    if(!window.confirm('Delete this session?'))return;
    await execute(()=>sessionsAPI.delete(id),{successMsg:'Session deleted.',onSuccess:fetchAll});
  };

  const columns = [
    { key:'student_name', label:'Student', render:(v,row)=><div><div className="font-semibold">{v}</div><div className="text-xs text-gray-400">{row.student_email}</div></div> },
    { key:'teacher_name', label:'Teacher', render:(v,row)=><div><div className="font-semibold">{v}</div><div className="text-xs text-gray-400">{row.course_name||'General'}</div></div> },
    { key:'scheduled_at', label:'Date & Time', render:v=>format(new Date(v),'MMM d, yyyy h:mm a') },
    { key:'status', label:'Status', render:v=><span className={`badge ${v==='upcoming'?'badge-info':v==='completed'?'badge-success':'badge-error'}`}>{v}</span> },
    { key:'meeting_link', label:'Link', render:v=>v?<a href={v} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm">Join</a>:'—' },
    { key:'actions', label:'', render:(_,row)=>(
      <div className="flex gap-2">
        <button onClick={()=>{setForm({student_id:'',teacher_id:'',course_id:row.course_id||'',scheduled_at:row.scheduled_at?.slice(0,16)||'',meeting_link:row.meeting_link||'',notes:row.notes||'',status:row.status});setModal({open:true,mode:'edit',data:row});}} className="text-primary hover:underline text-sm">Edit</button>
        <button onClick={()=>handleDelete(row.id)} className="text-red-500 hover:underline text-sm">Delete</button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-primary">Sessions</h1>
        <button onClick={()=>{setForm(EMPTY);setModal({open:true,mode:'create',data:null});}} className="btn-primary text-sm">+ Schedule Session</button>
      </div>
      <div className="card">
        <div className="flex gap-3 mb-4">
          {['','upcoming','completed','cancelled'].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filter===s?'bg-primary text-white':'bg-gray-100 text-secondary hover:bg-gray-200'}`}>
              {s?s.charAt(0).toUpperCase()+s.slice(1):'All'}
            </button>
          ))}
        </div>
        <DataTable columns={columns} data={sessions} loading={loading} emptyMessage="No sessions found." />
      </div>

      <Modal isOpen={modal.open} onClose={()=>setModal(m=>({...m,open:false}))} title={modal.mode==='create'?'Schedule Session':'Edit Session'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {modal.mode==='create' && (
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Student *</label>
                <select className="input" value={form.student_id} onChange={e=>setForm(f=>({...f,student_id:e.target.value}))} required>
                  <option value="">Select student</option>
                  {students.map(s=><option key={s.student_id} value={s.student_id}>{s.name}</option>)}
                </select>
              </div>
              <div><label className="label">Teacher *</label>
                <select className="input" value={form.teacher_id} onChange={e=>setForm(f=>({...f,teacher_id:e.target.value}))} required>
                  <option value="">Select teacher</option>
                  {teachers.map(t=><option key={t.teacher_id} value={t.teacher_id}>{t.name}</option>)}
                </select>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Course</label>
              <select className="input" value={form.course_id} onChange={e=>setForm(f=>({...f,course_id:e.target.value}))}>
                <option value="">Select course (optional)</option>
                {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="label">Date & Time *</label>
              <input type="datetime-local" className="input" value={form.scheduled_at} onChange={e=>setForm(f=>({...f,scheduled_at:e.target.value}))} required />
            </div>
          </div>
          <div><label className="label">Meeting Link</label><input className="input" value={form.meeting_link} onChange={e=>setForm(f=>({...f,meeting_link:e.target.value}))} placeholder="https://zoom.us/j/..." /></div>
          {modal.mode==='edit' && (
            <div><label className="label">Status</label>
              <select className="input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                {['upcoming','completed','cancelled'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          )}
          <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={()=>setModal(m=>({...m,open:false}))} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving?'Saving...':modal.mode==='create'?'Schedule':'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
