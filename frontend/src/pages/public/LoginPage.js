import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}! 👋`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white text-2xl font-display font-bold">ق</div>
            <div className="text-left">
              <div className="font-display font-bold text-xl text-primary">Quran Journey</div>
              <div className="text-xs text-secondary">Academy</div>
            </div>
          </Link>
          <h1 className="font-display text-3xl font-bold text-primary">Welcome Back</h1>
          <p className="text-secondary/70 mt-2">Sign in to your account</p>
        </div>

        <div className="card shadow-card-hover">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="your@email.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 text-base">
              {loading
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing In...</span>
                : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-secondary/60 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">Register here</Link>
          </p>
        </div>

        <p className="text-center mt-4">
          <Link to="/" className="text-primary font-semibold text-sm hover:underline">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
