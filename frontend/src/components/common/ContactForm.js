import React, { useState, useEffect } from 'react';
import { submissionsAPI, coursesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const COUNTRIES = ["Afghanistan","Albania","Algeria","Argentina","Australia","Austria","Bahrain","Bangladesh","Belgium","Brazil","Canada","China","Denmark","Egypt","Ethiopia","Finland","France","Germany","Ghana","Greece","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Japan","Jordan","Kenya","Kuwait","Lebanon","Libya","Malaysia","Maldives","Mauritania","Mexico","Morocco","Netherlands","New Zealand","Nigeria","Norway","Oman","Pakistan","Palestine","Philippines","Poland","Portugal","Qatar","Romania","Russia","Saudi Arabia","Senegal","Singapore","Somalia","South Africa","South Korea","Spain","Sudan","Sweden","Switzerland","Syria","Tanzania","Thailand","Tunisia","Turkey","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Yemen","Other"];

export default function ContactForm({
  title = "Book Your Free Trial Class",
  subtitle = "Start your Quranic journey today",
  preselectedCourse = '',
}) {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', country: '', message: '', course_interest: preselectedCourse,
  });

  // ── Auto-fill from logged-in user (including country) ──────────────────────
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name:    f.name    || user.name    || '',
        email:   f.email   || user.email   || '',
        phone:   f.phone   || user.phone   || '',
        country: f.country || user.country || '',   // ← auto-fill country
      }));
    }
  }, [user]);

  useEffect(() => {
    if (preselectedCourse) setForm(f => ({ ...f, course_interest: preselectedCourse }));
  }, [preselectedCourse]);

  useEffect(() => {
    coursesAPI.getAll({ is_active: 'true' }).then(r => setCourses(r.data.data || [])).catch(() => {});
  }, []);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  // Block admin and teacher accounts from submitting enrollment forms
  if (user && (user.role === 'admin' || user.role === 'teacher')) {
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-3">🔒</div>
        <h3 className="font-display font-bold text-primary text-xl mb-2">Not Available</h3>
        <p className="text-secondary/70 text-sm">Admin and teacher accounts cannot submit enrollment forms.</p>
      </div>
    );
  }

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email) { toast.error('Name and email are required.'); return; }
    if (!form.country) { toast.error('Please select your country.'); return; }
    setLoading(true);
    try {
      await submissionsAPI.create(form);
      setSubmitted(true);
      toast.success("Message sent! We'll contact you soon. 🎉");
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send. Please try again.');
    } finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-display font-bold text-primary mb-2">Thank You!</h3>
        <p className="text-secondary">We've received your message and will contact you within 24 hours.</p>
        <button onClick={() => { setSubmitted(false); setForm(f => ({ ...f, message: '', course_interest: preselectedCourse })); }}
          className="mt-6 btn-secondary text-sm">Send Another Message</button>
      </div>
    );
  }

  const isLoggedIn = !!user;

  // Which fields were auto-filled
  const autoFilled = {
    name:    isLoggedIn && !!user?.name,
    email:   isLoggedIn && !!user?.email,
    phone:   isLoggedIn && !!user?.phone,
    country: isLoggedIn && !!user?.country,
  };

  const inputClass = (field) =>
    `input ${autoFilled[field] ? 'bg-green-50 border-green-200 focus:border-green-400' : ''}`;

  return (
    <div>
      {(title || subtitle) && (
        <div className="mb-6">
          {title    && <h3 className="text-2xl font-display font-bold text-primary mb-1">{title}</h3>}
          {subtitle && <p className="text-secondary/70 text-sm">{subtitle}</p>}
        </div>
      )}

      {/* Auto-fill notice */}
      {isLoggedIn && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2 text-sm text-green-800">
          <span className="mt-0.5 flex-shrink-0">✅</span>
          <span>Your details have been filled in automatically from your account. Just pick a course and send!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">
              Full Name *
              {autoFilled.name && <span className="ml-2 text-green-600 text-xs font-normal">✓ auto-filled</span>}
            </label>
            <input name="name" value={form.name} onChange={e => set('name', e.target.value)}
              className={inputClass('name')} placeholder="Ahmad Al-Farsi" required />
          </div>
          <div>
            <label className="label">
              Email Address *
              {autoFilled.email && <span className="ml-2 text-green-600 text-xs font-normal">✓ auto-filled</span>}
            </label>
            <input name="email" type="email" value={form.email} onChange={e => set('email', e.target.value)}
              className={inputClass('email')} placeholder="ahmad@email.com" required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">
              Phone Number
              {autoFilled.phone && <span className="ml-2 text-green-600 text-xs font-normal">✓ auto-filled</span>}
            </label>
            <input name="phone" value={form.phone} onChange={e => set('phone', e.target.value)}
              className={inputClass('phone')} placeholder="+1 234 567 8900" />
          </div>
          <div>
            <label className="label">
              Country *
              {autoFilled.country && <span className="ml-2 text-green-600 text-xs font-normal">✓ auto-filled</span>}
            </label>
            <select name="country" value={form.country} onChange={e => set('country', e.target.value)}
              className={inputClass('country')} required>
              <option value="">Select your country</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">
            Course of Interest
            {preselectedCourse && <span className="ml-2 text-green-600 text-xs font-normal">✓ pre-selected</span>}
          </label>
          <select name="course_interest" value={form.course_interest} onChange={e => set('course_interest', e.target.value)} className="input">
            <option value="">Select a course (optional)</option>
            {courses.map(c => <option key={c.id} value={c.name}>{c.name} — ${c.price}/mo</option>)}
          </select>
        </div>

        <div>
          <label className="label">Message</label>
          <textarea name="message" value={form.message} onChange={e => set('message', e.target.value)}
            className="input resize-none" rows={3}
            placeholder="Tell us about your goals or any questions you have..." />
        </div>

        <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 text-base">
          {loading
            ? <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Sending...
              </span>
            : isLoggedIn ? '🚀 Send Enrollment Request' : "✨ Send Message — It's Free!"}
        </button>
        <p className="text-xs text-center text-gray-400">🔒 Your information is secure and will never be shared.</p>
      </form>
    </div>
  );
}
