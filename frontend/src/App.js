import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteContentProvider } from './context/SiteContentContext';

// Public pages
import HomePage      from './pages/public/HomePage';
import CoursesPage   from './pages/public/CoursesPage';
import BlogPage      from './pages/public/BlogPage';
import BlogPostPage  from './pages/public/BlogPostPage';
import PricingPage   from './pages/public/PricingPage';
import AboutPage     from './pages/public/AboutPage';
import ContactPage   from './pages/public/ContactPage';
import FeedbackPage  from './pages/public/FeedbackPage';
import LoginPage     from './pages/public/LoginPage';
import RegisterPage  from './pages/public/RegisterPage';

// Admin pages
import AdminDashboard    from './pages/admin/AdminDashboard';
import AdminStudents     from './pages/admin/AdminStudents';
import AdminTeachers     from './pages/admin/AdminTeachers';
import AdminCourses      from './pages/admin/AdminCourses';
import AdminSessions     from './pages/admin/AdminSessions';
import AdminBlog         from './pages/admin/AdminBlog';
import AdminPayments     from './pages/admin/AdminPayments';
import AdminSubmissions  from './pages/admin/AdminSubmissions';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminSiteEditor   from './pages/admin/AdminSiteEditor';
import AdminMediaLibrary from './pages/admin/AdminMediaLibrary';

// Role dashboards
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';
import PublicLayout    from './components/layout/PublicLayout';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'admin')   return <Navigate to="/admin"   replace />;
  if (user?.role === 'teacher') return <Navigate to="/teacher" replace />;
  return <Navigate to="/student" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"          element={<PublicLayout><HomePage    /></PublicLayout>} />
      <Route path="/courses"   element={<PublicLayout><CoursesPage /></PublicLayout>} />
      <Route path="/pricing"   element={<PublicLayout><PricingPage /></PublicLayout>} />
      <Route path="/blog"      element={<PublicLayout><BlogPage    /></PublicLayout>} />
      <Route path="/blog/:slug"element={<PublicLayout><BlogPostPage/></PublicLayout>} />
      <Route path="/about"     element={<PublicLayout><AboutPage   /></PublicLayout>} />
      <Route path="/contact"   element={<PublicLayout><ContactPage /></PublicLayout>} />
      <Route path="/feedback"  element={<PublicLayout><FeedbackPage/></PublicLayout>} />
      <Route path="/login"     element={<LoginPage />} />
      <Route path="/register"  element={<RegisterPage />} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout role="admin"/></ProtectedRoute>}>
        <Route index              element={<AdminDashboard    />} />
        <Route path="students"    element={<AdminStudents     />} />
        <Route path="teachers"    element={<AdminTeachers     />} />
        <Route path="courses"     element={<AdminCourses      />} />
        <Route path="sessions"    element={<AdminSessions     />} />
        <Route path="payments"    element={<AdminPayments     />} />
        <Route path="blog"        element={<AdminBlog         />} />
        <Route path="submissions" element={<AdminSubmissions  />} />
        <Route path="testimonials"element={<AdminTestimonials />} />
        <Route path="site-editor" element={<AdminSiteEditor   />} />
        <Route path="media"       element={<AdminMediaLibrary />} />
      </Route>

      {/* Student */}
      <Route path="/student" element={<ProtectedRoute roles={['student']}><DashboardLayout role="student"/></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
      </Route>

      {/* Teacher */}
      <Route path="/teacher" element={<ProtectedRoute roles={['teacher']}><DashboardLayout role="teacher"/></ProtectedRoute>}>
        <Route index element={<TeacherDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SiteContentProvider>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{
            duration: 4000,
            style: { background: '#033455', color: '#fff', borderRadius: '10px', fontFamily: 'Nunito, sans-serif', fontWeight: '600' }
          }}/>
        </SiteContentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
