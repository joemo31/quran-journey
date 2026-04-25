import React, { useState, useEffect } from 'react';
import { paymentsAPI, usersAPI, coursesAPI } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { useApi } from '../../hooks/useApi';
import { format } from 'date-fns';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [modal, setModal] = useState({open:false,mode:'create',data:null});
  const [form, setForm] = useState({student_id:'',course_id:'',amount:'',currency:'USD',status:'pending',notes:''});
  const { execute, loading:saving } = useApi();

  const fetchAll = async()=>{
    setLoading(true);
    try{
      const [p,s,c]=await Promise.all([paymentsAPI.getAll(filter?{status:filter}:{}),usersAPI.getStudents(),coursesAPI.getAll({is_active:'true'})]);
      setPayments(p.data.data);setStudents(s.data.data);setCourses(c.data.data);
    }catch{}finally{setLoading(false);}
  };
  useEffect(()=>{fetchAll();},[filter]);

  const handleSubmit = async e=>{
    e.preventDefault();
    await execute(
      ()=>modal.mode==='create'?paymentsAPI.create(form):paymentsAPI.update(modal.data.id,form),
      {successMsg:modal.mode==='create'?'Payment recorded!':'Payment updated!',onSuccess:()=>{setModal(m=>({...m,open:false}));fetchAll();}}
    );
  };

  const quickStatus = async(id,status)=>{
    await execute(()=>paymentsAPI.update(id,{status}),{successMsg:`Marked as ${status}.`,onSuccess:fetchAll});
  };

  const columns = [
    { key:'student_name', label:'Student', render:(v,row)=><div><div className="font-semibold">{v}</div><div className="text-xs text-gray-400">{row.student_email}</div></div> },
    { key:'course_name', label:'Course', render:v=>v||'—' },
    { key:'amount', label:'Amount', render:(v,row)=><span className="font-bold text-primary">${v} {row.currency}</span> },
    { key:'status', label:'Status', render:(v,row)=>(
      <div className="flex items-center gap-2">
        <span className={`badge ${v==='paid'?'badge-success':v==='pending'?'badge-warning':v==='refunded'?'badge-info':'badge-error'}`}>{v}</span>
        {v==='pending'&&<button onClick={()=>quickStatus(row.id,'paid')} className="text-xs text-green-600 hover:underline">→ Mark Paid</button>}
      </div>
    )},
    { key:'created_at', label:'Date', render:v=>format(new Date(v),'MMM d, yyyy') },
    { key:'actions', label:'', render:(_,row)=>(
      <button onClick={()=>{setForm({student_id:'',course_id:row.course_id||'',amount:row.amount,currency:row.currency,status:row.status,notes:row.notes||''});setModal({open:true,mode:'edit',data:row});}} className="text-primary hover:underline text-sm">Edit</button>
    )},
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-primary">Payments</h1>
        <button onClick={()=>{setForm({student_id:'',course_id:'',amount:'',currency:'USD',status:'pending',notes:''});setModal({open:true,mode:'create',data:null});}} className="btn-primary text-sm">+ Record Payment</button>
      </div>
      <div className="card">
        <div className="flex gap-3 mb-4">
          {['','pending','paid','refunded','cancelled'].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filter===s?'bg-primary text-white':'bg-gray-100 text-secondary hover:bg-gray-200'}`}>
              {s?s.charAt(0).toUpperCase()+s.slice(1):'All'}
            </button>
          ))}
        </div>
        <DataTable columns={columns} data={payments} loading={loading} emptyMessage="No payments found." />
      </div>

      <Modal isOpen={modal.open} onClose={()=>setModal(m=>({...m,open:false}))} title={modal.mode==='create'?'Record Payment':'Update Payment'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {modal.mode==='create'&&(
            <div><label className="label">Student *</label>
              <select className="input" value={form.student_id} onChange={e=>setForm(f=>({...f,student_id:e.target.value}))} required>
                <option value="">Select student</option>
                {students.map(s=><option key={s.student_id} value={s.student_id}>{s.name}</option>)}
              </select>
            </div>
          )}
          <div><label className="label">Course</label>
            <select className="input" value={form.course_id} onChange={e=>setForm(f=>({...f,course_id:e.target.value}))}>
              <option value="">Select course (optional)</option>
              {courses.map(c=><option key={c.id} value={c.id}>{c.name} — ${c.price}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Amount ($) *</label><input type="number" className="input" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} required min="0"/></div>
            <div><label className="label">Status</label>
              <select className="input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                {['pending','paid','refunded','cancelled'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={()=>setModal(m=>({...m,open:false}))} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving?'Saving...':modal.mode==='create'?'Record':'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
