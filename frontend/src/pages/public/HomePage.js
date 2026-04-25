import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ContactForm from '../../components/common/ContactForm';
import EnrollButton from '../../components/common/EnrollButton';
import { coursesAPI, testimonialsAPI } from '../../services/api';
import { useSiteContent } from '../../context/SiteContentContext';

const StarRating = ({ rating=5 }) => (
  <div className="flex gap-0.5">{[1,2,3,4,5].map(s=><span key={s} className={`text-base ${s<=rating?'text-yellow-400':'text-gray-200'}`}>★</span>)}</div>
);

const FEATURES = [
  { icon:'🎓', title:'Expert Teachers',      desc:'Native Arabic teachers certified from Al-Azhar University' },
  { icon:'🌟', title:'Engaging Methods',      desc:'Fun and interactive learning methods for both kids and adults' },
  { icon:'⏰', title:'Flexible Schedule',     desc:'Convenient timings for students from around the world' },
  { icon:'👤', title:'Personalized Learning', desc:'One-on-one attention tailored to your needs' },
  { icon:'💎', title:'Affordable Packages',   desc:'Competitive pricing with a free trial lesson' },
  { icon:'📜', title:'Certification',         desc:'Earn recognized certification and Ijazah for advanced students' },
];

export default function HomePage() {
  const { get, globals } = useSiteContent();
  const [courses,      setCourses]      = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    coursesAPI.getAll({ is_active:'true' }).then(r=>setCourses(r.data.data||[])).catch(()=>{});
    testimonialsAPI.getAll({ is_published:'true' }).then(r=>setTestimonials(r.data.data||[])).catch(()=>{});
  }, []);

  // ── Read all text from DB ──
  const heroTitle     = get('home','hero','title',     "Start Your Qur'an Journey Today 🌟");
  const heroSubtitle  = get('home','hero','subtitle',  "Learn Qur'an, Tajweed, Arabic, and Islamic Studies with native Arabic teachers from Al-Azhar University.");
  const heroCta1      = get('home','hero','cta_primary',   'Book Your Free Trial Class');
  const heroCta2      = get('home','hero','cta_secondary', 'Explore Courses');
  const heroBg        = get('home','hero','bg_image',  '');
  const heroImage     = get('home','hero','hero_image','');   // ← right-side image
  const heroBadge     = get('home','hero','badge_text','Al-Azhar Certified Teachers');
  const statStudents  = get('home','stats','students', '5,000+');
  const statExp       = get('home','stats','experience','15+');
  const statCert      = get('home','stats','certified','100%');
  const statAvail     = get('home','stats','availability','24/7');
  const whyTitle      = get('home','why_us','title',   'Why Choose Us?');
  const whySub        = get('home','why_us','subtitle','We\'re committed to providing the best Quranic education');
  const progTitle     = get('home','programs','title', 'Our Programs');
  const progSub       = get('home','programs','subtitle','Choose the perfect course to begin your journey');
  const testTitle     = get('home','testimonials','title', 'What Our Students Say');
  const testSub       = get('home','testimonials','subtitle','Real feedback from our global community of learners');
  const ctaTitle      = get('home','cta','title',      "Begin Your Journey with the Qur'an Today!");
  const ctaSub        = get('home','cta','subtitle',   "Take your first step towards a stronger connection with the Qur'an.");
  const ctaBtn1       = get('home','cta','button_primary',   'Book Free Trial');
  const ctaBtn2       = get('home','cta','button_secondary', 'WhatsApp Us');
  const contactTitle  = get('home','contact','title',  'Get In Touch');
  const contactSub    = get('home','contact','subtitle',"Have questions? We're here to help.");
  const formTitle     = get('home','contact','form_title','Book Your Free Trial Class');

  const waLink = globals.whatsappLink || `https://wa.me/${(globals.whatsapp||'').replace(/\D/g,'')}`;

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative min-h-screen bg-primary flex items-center overflow-hidden"
        style={heroBg?{backgroundImage:`url(${heroBg})`,backgroundSize:'cover',backgroundPosition:'center'}:{}}>
        <div className="absolute inset-0 bg-primary/90"/>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4"/>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full translate-y-1/4 -translate-x-1/4"/>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — text */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm font-medium px-4 py-2 rounded-full mb-6">
              <span>🌟</span> {heroBadge}
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {heroTitle}
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg">{heroSubtitle}</p>
            <div className="flex flex-wrap gap-4">
              <a href="#contact" className="btn-primary bg-white !text-primary hover:bg-gray-100 text-base px-8 py-4">
                📚 {heroCta1}
              </a>
              <Link to="/courses" className="btn-secondary border-white text-white hover:bg-white hover:text-primary text-base px-8 py-4">
                {heroCta2} →
              </Link>
            </div>
          </div>

          {/* Right — hero image OR floating card */}
          <div className="hidden lg:flex justify-center items-center">
            {heroImage ? (
              /* Custom uploaded/linked image */
              <div className="relative w-full max-w-md">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
                  <img
                    src={heroImage}
                    alt="Quran Journey Academy"
                    className="w-full h-auto object-cover max-h-[480px]"
                    onError={e => { e.target.style.display='none'; e.target.parentElement.innerHTML='<div class="flex items-center justify-center h-64 text-white/40 text-6xl font-arabic">ق</div>'; }}
                  />
                </div>
                {/* Floating stats */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{statStudents}</div>
                  <div className="text-xs text-secondary font-medium">Happy Students</div>
                </div>
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{statExp}</div>
                  <div className="text-xs text-secondary font-medium">Years Teaching</div>
                </div>
              </div>
            ) : (
              /* Default decorative */
              <div className="relative">
                <div className="w-80 h-80 mx-auto bg-white/10 rounded-full flex items-center justify-center animate-float">
                  <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="font-arabic text-9xl text-white/80">ق</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-white rounded-2xl shadow-xl p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{statStudents}</div>
                  <div className="text-xs text-secondary font-medium">Happy Students</div>
                </div>
                <div className="absolute bottom-4 left-4 bg-white rounded-2xl shadow-xl p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{statExp}</div>
                  <div className="text-xs text-secondary font-medium">Years of Excellence</div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{clipPath:'ellipse(60% 100% at 50% 100%)'}}/>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value:statStudents, label:'Students Worldwide' },
              { value:statExp,      label:'Years Experience' },
              { value:statCert,     label:'Certified Teachers' },
              { value:statAvail,    label:'Flexible Learning' },
            ].map(s=>(
              <div key={s.label} className="text-center p-6 rounded-2xl bg-primary-50">
                <div className="text-4xl font-display font-bold text-primary mb-1">{s.value}</div>
                <div className="text-sm font-semibold text-secondary">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">{whyTitle}</h2>
            <p className="text-secondary/70 text-lg max-w-2xl mx-auto">{whySub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f=>(
              <div key={f.title} className="card group">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">{f.icon}</div>
                <h3 className="font-display font-bold text-xl text-primary mb-2">{f.title}</h3>
                <p className="text-secondary/70 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRAMS — with EnrollButton ── */}
      <section id="programs" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">{progTitle}</h2>
            <p className="text-secondary/70 text-lg max-w-2xl mx-auto">{progSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(courses.length ? courses : [
              { id:'1', name:'Noor Al-Bayan Course',  description:'Learn to read Arabic and Quran from scratch.', price:49, level:'Beginner' },
              { id:'2', name:'Tajweed Course',        description:'Beautify your recitation step by step.',        price:59, level:'Intermediate' },
              { id:'3', name:'Quran Memorization',    description:'Build a lifelong connection with the Quran.',   price:79, level:'All Levels' },
            ]).map(course=>(
              <div key={course.id} className="card group border-2 border-transparent hover:border-primary transition-all duration-300 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="badge bg-primary-50 text-primary text-xs">{course.level||'All Levels'}</span>
                  <span className="font-bold text-primary text-xl font-display">${course.price}<span className="text-sm text-gray-400 font-normal">/mo</span></span>
                </div>
                <h3 className="font-display font-bold text-xl text-primary mb-2">{course.name}</h3>
                <p className="text-secondary/70 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">{course.description}</p>
                <EnrollButton courseName={course.name} label="Enroll Now →" scrollTo="contact" className="btn-primary text-sm w-full text-center"/>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/pricing" className="btn-secondary">View All Courses & Pricing →</Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="section-title mb-4">{testTitle}</h2>
              <p className="text-secondary/70 text-lg max-w-2xl mx-auto">{testSub}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.slice(0,6).map(t=>(
                <div key={t.id} className="card relative">
                  <div className="text-6xl font-display text-primary/10 leading-none absolute top-4 right-4">"</div>
                  <StarRating rating={t.rating}/>
                  <p className="text-secondary/80 leading-relaxed mt-3 mb-5 relative z-10 line-clamp-4">{t.content}</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    {t.student_avatar_url
                      ? <img src={t.student_avatar_url} alt={t.student_name} className="w-11 h-11 rounded-full object-cover"/>
                      : <div className="w-11 h-11 rounded-full bg-primary-50 border-2 border-primary flex items-center justify-center text-primary font-bold">{t.student_name?.charAt(0)}</div>
                    }
                    <div>
                      <div className="font-semibold text-primary text-sm">{t.student_name}</div>
                      {t.student_country && <div className="text-xs text-gray-400">📍 {t.student_country}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/feedback" className="btn-secondary">View All Feedback & Videos →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA BANNER ── */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E")`}}/>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-4">{ctaTitle}</h2>
          <p className="text-white/70 text-lg mb-8">{ctaSub}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#contact" className="btn-primary bg-white !text-primary hover:bg-gray-100 px-8 py-4">📚 {ctaBtn1}</a>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-secondary border-white text-white hover:bg-white hover:text-primary px-8 py-4">{ctaBtn2}</a>
          </div>
        </div>
      </section>

      {/* ── CONTACT FORM ── */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title mb-4">{contactTitle}</h2>
              <p className="text-secondary/70 text-lg mb-8">{contactSub}</p>
              <div className="space-y-4">
                <a href={waLink} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl">📱</div>
                  <div><div className="font-semibold text-primary">WhatsApp</div><div className="text-secondary text-sm">{globals.whatsapp}</div></div>
                </a>
                <a href={`mailto:${globals.email}`} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl">✉️</div>
                  <div><div className="font-semibold text-primary">Email</div><div className="text-secondary text-sm">{globals.email}</div></div>
                </a>
              </div>
            </div>
            <div className="card shadow-card-hover">
              <ContactForm title={formTitle}/>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
