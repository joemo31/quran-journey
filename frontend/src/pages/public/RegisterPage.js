import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const COUNTRIES = ["Afghanistan","Albania","Algeria","Argentina","Australia","Austria","Bahrain","Bangladesh","Belgium","Brazil","Canada","China","Denmark","Egypt","Ethiopia","Finland","France","Germany","Ghana","Greece","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Japan","Jordan","Kenya","Kuwait","Lebanon","Libya","Malaysia","Maldives","Mauritania","Mexico","Morocco","Netherlands","New Zealand","Nigeria","Norway","Oman","Pakistan","Palestine","Philippines","Poland","Portugal","Qatar","Romania","Russia","Saudi Arabia","Senegal","Singapore","Somalia","South Africa","South Korea","Spain","Sudan","Sweden","Switzerland","Syria","Tanzania","Thailand","Tunisia","Turkey","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Yemen","Other"];

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', phone: '', country: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = v => setForm(f => ({ ...f, ...v }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match.'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    if (!form.country) { toast.error('Please select your country.'); return; }
    setLoading(true);
    try {
      const res = await authAPI.register({
        name: form.name, email: form.email, password: form.password,
        role: form.role, phone: form.phone, country: form.country,
      });
      const { user, token } = res.data.data;
      localStorage.setItem('qja_token', token);
      localStorage.setItem('qja_user', JSON.stringify(user));
      toast.success(`Welcome, ${user.name}! 🎉`);
      if (user.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white text-2xl font-display font-bold">ق</div>
            <div className="text-left">
              <div className="font-display font-bold text-xl text-primary">Quran Journey</div>
              <div className="text-xs text-secondary">Academy</div>
            </div>
          </Link>
          <h1 className="font-display text-3xl font-bold text-primary">Create Account</h1>
          <p className="text-secondary/70 mt-2">Join thousands of learners worldwide</p>
        </div>

        <div className="card shadow-card-hover">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role selector */}
            <div>
              <label className="label">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {[['student','🎓 Student'],['teacher','👨‍🏫 Teacher']].map(([r,l]) => (
                  <button key={r} type="button" onClick={() => set({ role: r })}
                    className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all
                      ${form.role===r ? 'border-primary bg-primary text-white' : 'border-gray-200 text-secondary hover:border-primary hover:text-primary'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="label">Full Name *</label>
              <input className="input" placeholder="Your full name" value={form.name}
                onChange={e => set({ name: e.target.value })} required />
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address *</label>
              <input type="email" className="input" placeholder="your@email.com" value={form.email}
                onChange={e => set({ email: e.target.value })} required />
            </div>

            {/* Phone + Country */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
                <input className="input" placeholder="+1 234 567 8900" value={form.phone}
                  onChange={e => set({ phone: e.target.value })} />
              </div>
              <div>
                <label className="label">Country *</label>
                <select className="input" value={form.country} onChange={e => set({ country: e.target.value })} required>
                  <option value="">Select country</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Password *</label>
                <input type="password" className="input" placeholder="Min 8 characters" value={form.password}
                  onChange={e => set({ password: e.target.value })} required minLength={8} />
              </div>
              <div>
                <label className="label">Confirm Password *</label>
                <input type="password" className="input" placeholder="Repeat password" value={form.confirmPassword}
                  onChange={e => set({ confirmPassword: e.target.value })} required />
              </div>
            </div>

            {/* Password strength indicator */}
            {form.password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[
                    form.password.length >= 8,
                    /[A-Z]/.test(form.password),
                    /[0-9]/.test(form.password),
                    /[^A-Za-z0-9]/.test(form.password),
                  ].map((ok, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${ok ? 'bg-green-500' : 'bg-gray-200'}`}/>
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  {form.password.length < 8 ? 'Too short' :
                   !(/[A-Z]/.test(form.password)) ? 'Add uppercase letter' :
                   !(/[0-9]/.test(form.password)) ? 'Add a number' :
                   !(/[^A-Za-z0-9]/.test(form.password)) ? 'Add a symbol for strong password' :
                   '✅ Strong password'}
                </p>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 text-base mt-2">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    Creating Account...
                  </span>
                : 'Create My Account'}
            </button>
          </form>

          <p className="text-center text-sm text-secondary/60 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
          </p>
        </div>

        <p className="text-center mt-4 text-xs text-gray-400">
          By registering you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
