import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { submissionsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function EnrollButton({
  courseName,
  className,
  label    = 'Enroll Now',
  scrollTo = 'contact',
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  // ── Block admin and teacher ────────────────────────────────────────────────
  if (user && (user.role === 'admin' || user.role === 'teacher')) {
    return (
      <span
        title="Admin and teacher accounts cannot enroll in courses"
        className={`inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 text-gray-400 rounded-xl font-semibold text-sm cursor-not-allowed select-none ${className || ''}`}
      >
        🔒 Not Available
      </span>
    );
  }

  // ── Already done ───────────────────────────────────────────────────────────
  if (done) {
    return (
      <span className={`inline-flex items-center justify-center gap-2 px-5 py-3 bg-green-500 text-white rounded-xl font-semibold text-sm cursor-default ${className || ''}`}>
        ✅ Request Sent!
      </span>
    );
  }

  const handleClick = async (e) => {
    e.preventDefault();

    // Not logged in — scroll to form
    if (!user) {
      const el = document.getElementById(scrollTo);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.transition = 'box-shadow 0.3s';
        el.style.boxShadow  = '0 0 0 4px rgba(3,52,85,0.3)';
        setTimeout(() => { el.style.boxShadow = ''; }, 2500);
      } else {
        window.location.href = `/contact?course=${encodeURIComponent(courseName || '')}`;
      }
      toast('Please fill in the form below to enroll 👇', { icon: '📋', duration: 3000 });
      return;
    }

    // Student — auto-submit
    setLoading(true);
    try {
      await submissionsAPI.create({
        name:            user.name,
        email:           user.email,
        phone:           user.phone   || '',
        country:         user.country || 'Not specified',
        message:         `Enrollment request for: ${courseName || 'a course'}`,
        course_interest: courseName   || '',
      });

      setDone(true);

      toast.success(
        `✅ Enrollment request sent for "${courseName}"! Our team has been notified and will contact you soon.`,
        { duration: 6000 }
      );
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className || 'btn-primary text-sm'}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Sending...
        </span>
      ) : label}
    </button>
  );
}
