import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ADMIN_NAV = [
  { label: 'Dashboard', path: '/admin', icon: '📊', exact: true },
  { label: 'Students', path: '/admin/students', icon: '🎓' },
  { label: 'Teachers', path: '/admin/teachers', icon: '👨‍🏫' },
  { label: 'Courses', path: '/admin/courses', icon: '📚' },
  { label: 'Sessions', path: '/admin/sessions', icon: '📅' },
  { label: 'Payments', path: '/admin/payments', icon: '💳' },
  { label: 'Blog', path: '/admin/blog', icon: '✍️' },
  { label: 'Testimonials', path: '/admin/testimonials', icon: '⭐' },
  { label: 'Form Leads', path: '/admin/submissions', icon: '📩' },
  { divider: true },
  { label: 'Site Editor', path: '/admin/site-editor', icon: '🎨' },
  { label: 'Media Library', path: '/admin/media', icon: '🖼️' },
];

const STUDENT_NAV = [
  { label: 'Dashboard', path: '/student', icon: '🏠', exact: true },
];

const TEACHER_NAV = [
  { label: 'Dashboard', path: '/teacher', icon: '🏠', exact: true },
];

export default function DashboardLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = role === 'admin' ? ADMIN_NAV : role === 'teacher' ? TEACHER_NAV : STUDENT_NAV;
  const isActive = (item) => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
  const handleLogout = () => { logout(); navigate('/login'); };

  const currentLabel = navItems.find(i => !i.divider && isActive(i))?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white text-xl font-display font-bold">ق</div>
            <div>
              <div className="font-display font-bold text-white text-sm leading-tight">Quran Journey</div>
              <div className="text-white/50 text-xs capitalize">{role} Panel</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item, i) => {
            if (item.divider) return (
              <div key={`div-${i}`} className="pt-3 pb-2">
                <div className="border-t border-white/10 mb-2"/>
                <p className="text-white/30 text-xs font-bold uppercase px-4 tracking-wider">Content</p>
              </div>
            );
            return (
              <Link key={item.path} to={item.path}
                className={`sidebar-link ${isActive(item) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}>
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
              <div className="text-white/50 text-xs capitalize">{user?.role}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="flex-1 text-center text-xs text-white/60 hover:text-white py-1.5 rounded-lg hover:bg-white/10 transition-colors font-medium">🌐 Website</Link>
            <button onClick={handleLogout} className="flex-1 text-center text-xs text-white/60 hover:text-white py-1.5 rounded-lg hover:bg-white/10 transition-colors font-medium">🚪 Logout</button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-secondary hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <h1 className="text-lg font-bold text-primary font-display flex-1">{currentLabel}</h1>
          <div className="text-sm text-gray-400 hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
