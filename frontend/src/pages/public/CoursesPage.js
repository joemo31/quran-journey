import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../../services/api';
import { useSiteContent } from '../../context/SiteContentContext';
import ContactForm from '../../components/common/ContactForm';
import EnrollButton from '../../components/common/EnrollButton';
import { backgroundImageStyle } from '../../utils/config';

const LEVEL_COLORS = { 'Beginner':'bg-green-50 text-green-700','Intermediate':'bg-blue-50 text-blue-700','Advanced':'bg-purple-50 text-purple-700','All Levels':'bg-amber-50 text-amber-700' };
const COURSE_ICONS = ['📖','🎵','📿','🗣️','☪️','📚'];
const CURRICULUM = {
  'Noor Al-Bayan Course':       ['Arabic alphabet mastery','Vowel signs & pronunciation','Connecting letters fluently','Basic Quran reading','Tajweed fundamentals','Progress assessments'],
  'Tajweed Course':             ['Makhaarij al-Huroof','Sifaat al-Huroof','Rules of Noon Saakin','Rules of Meem Saakin','Madd (elongation) rules','Advanced recitation'],
  'Quran Memorization Program': ['Structured hifz methodology','Daily review system','Retention techniques','Weak spot correction','Ijazah preparation','Lifelong revision plan'],
  'Arabic Language Course':     ['Modern Standard Arabic','Quranic vocabulary','Grammar essentials','Reading comprehension','Conversational practice','Islamic text reading'],
  'Islamic Studies':            ['Fundamentals of Aqeedah','Islamic jurisprudence basics','Seerah of the Prophet ﷺ','Hadith sciences intro','Ethics & character','Contemporary issues'],
};

export default function CoursesPage() {
  const { get } = useSiteContent();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');

  const heroTitle = get('courses','hero','title',   'Find the Perfect Course for You');
  const heroSub   = get('courses','hero','subtitle','Expert-led programs from absolute beginner to advanced scholar.');
  const heroBg    = get('courses','hero','bg_image','');
  const ctaTitle  = get('courses','cta','title',   'Ready to Start?');
  const ctaSub    = get('courses','cta','subtitle','Fill in your details and we\'ll contact you within 24 hours.');
  const badges    = [1,2,3,4,5,6].map(n => get('courses','features',`badge${n}`,'')).filter(Boolean);

  useEffect(() => {
    coursesAPI.getAll({ is_active:'true' }).then(r => setCourses(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const levels = ['All', ...new Set(courses.map(c => c.level).filter(Boolean))];
  const filtered = filter === 'All' ? courses : courses.filter(c => c.level === filter);

  return (
    <div className="pt-24">
      <section className="bg-gray-50 border-b border-gray-100 py-16 relative"
        style={backgroundImageStyle(heroBg)}>
        {heroBg && <div className="absolute inset-0 bg-white/80"/>}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge badge-info mb-4">All Programs</span>
              <h1 className="font-display text-5xl font-bold text-primary mb-4 leading-tight">{heroTitle}</h1>
              <p className="text-secondary/70 text-lg leading-relaxed mb-6">{heroSub}</p>
              <div className="flex gap-4">
                <a href="#courses-grid" className="btn-primary">Browse Courses</a>
                <Link to="/pricing" className="btn-secondary">See Pricing →</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(badges.length ? badges : ['Live 1-on-1 sessions','Students in 60+ countries','Flexible scheduling','Free trial class','Ijazah certification','Arabic-speaking teachers']).map(b => (
                <div key={b} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                  <span className="text-xl">✓</span>
                  <span className="text-sm font-semibold text-secondary">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section id="courses-grid" className="py-6 bg-white border-b border-gray-100 sticky top-[72px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-2 items-center">
          <span className="text-sm font-semibold text-secondary mr-2">Filter:</span>
          {levels.map(l => (
            <button key={l} onClick={() => setFilter(l)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter===l?'bg-primary text-white shadow-md':'bg-gray-100 text-secondary hover:bg-primary-50 hover:text-primary'}`}>
              {l}
            </button>
          ))}
        </div>
      </section>

      {/* Course cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>
          ) : (
            <div className="space-y-6">
              {filtered.map((course, i) => {
                const curriculum = CURRICULUM[course.name] || [];
                const isOpen = selected === course.id;
                return (
                  <div key={course.id} className={`card border-2 transition-all duration-300 ${isOpen?'border-primary shadow-card-hover':'border-transparent'}`}>
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">{COURSE_ICONS[i%COURSE_ICONS.length]}</div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h2 className="font-display text-2xl font-bold text-primary">{course.name}</h2>
                            <span className={`badge text-xs ${LEVEL_COLORS[course.level]||'bg-gray-50 text-gray-600'}`}>{course.level||'All Levels'}</span>
                          </div>
                          <p className="text-secondary/70 leading-relaxed mb-3">{course.description}</p>
                          {course.duration_weeks && <span className="text-sm text-gray-400">⏱ {course.duration_weeks} weeks</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-3xl font-bold text-primary font-display">${course.price}</div>
                          <div className="text-sm text-gray-400">/month</div>
                        </div>
                        <EnrollButton courseName={course.name} label="Enroll Now" scrollTo="enroll" className="btn-primary text-sm whitespace-nowrap"/>
                        <button onClick={() => setSelected(isOpen?null:course.id)} className="text-sm text-primary font-semibold hover:underline">
                          {isOpen?'▲ Hide curriculum':'▼ View curriculum'}
                        </button>
                      </div>
                    </div>
                    {isOpen && curriculum.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <h4 className="font-semibold text-primary mb-3">What you'll learn:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {curriculum.map(item => <div key={item} className="flex items-center gap-2 text-sm text-secondary"><span className="text-green-500 font-bold">✓</span>{item}</div>)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section id="enroll" className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="section-title mb-2">{ctaTitle}</h2>
            <p className="text-secondary/70">{ctaSub}</p>
          </div>
          <div className="card shadow-card-hover"><ContactForm title="" subtitle=""/></div>
        </div>
      </section>
    </div>
  );
}
