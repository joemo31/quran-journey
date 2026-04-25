import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../../services/api';
import { useSiteContent } from '../../context/SiteContentContext';
import ContactForm from '../../components/common/ContactForm';
import EnrollButton from '../../components/common/EnrollButton';

const INCLUDED = ['Live 1-on-1 sessions','Native Arabic teacher','Flexible scheduling','Progress tracking','Recorded session replays','WhatsApp teacher access'];
const HIGHLIGHTS = [
  { icon:'🆓', title:'Free Trial',         desc:'Start with a no-commitment free trial class' },
  { icon:'🔄', title:'Flexible Rescheduling',desc:'Reschedule up to 24 hours before your session' },
  { icon:'👨‍👩‍👧', title:'Family Discount',   desc:'Enroll siblings and save 30% on every additional child' },
  { icon:'👥', title:'Referral Reward',     desc:'Refer 3 friends and get 1 month completely free' },
];

export default function PricingPage() {
  const { get } = useSiteContent();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');

  const heroTitle    = get('pricing','hero','title',    'Simple, Honest Pricing');
  const heroSub      = get('pricing','hero','subtitle', 'All plans include live 1-on-1 sessions. Start with a free trial — no card required.');
  const heroBg       = get('pricing','hero','bg_image', '');
  const offer1       = get('pricing','offers','offer1', '🎁 Early Bird: 10% off first 3 months');
  const offer2       = get('pricing','offers','offer2', '👨‍👩‍👧 Sibling Discount: 30% off additional children');
  const offer3       = get('pricing','offers','offer3', '👥 Referral: 3 friends = 1 month free');
  const includedTitle= get('pricing','included','title','Everything Included in Every Plan');
  const faqTitle     = get('pricing','faq','title',     'Frequently Asked Questions');
  const ctaTitle     = get('pricing','cta','title',     'Start Your Journey Today');
  const ctaSub       = get('pricing','cta','subtitle',  "Fill in your details and we'll reach out within 24 hours.");

  useEffect(() => {
    coursesAPI.getAll({ is_active:'true' }).then(r => setCourses(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-primary py-20 relative"
        style={heroBg ? { backgroundImage:`url(${heroBg})`, backgroundSize:'cover', backgroundPosition:'center' } : {}}>
        {heroBg && <div className="absolute inset-0 bg-primary/90"/>}
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm font-medium px-4 py-2 rounded-full mb-6">💎 Transparent Pricing — No Hidden Fees</span>
          <h1 className="font-display text-5xl font-bold text-white mb-4">{heroTitle}</h1>
          <p className="text-white/70 text-xl mb-8">{heroSub}</p>
          <div className="flex flex-wrap justify-center gap-4 text-white/80 text-sm">
            {['No contracts','Cancel anytime','Free trial included','Al-Azhar certified teachers'].map(b => (
              <span key={b} className="flex items-center gap-1.5"><span className="text-green-400">✓</span>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Offers strip */}
      <section className="bg-amber-50 border-y border-amber-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-amber-800">
            <span>{offer1}</span><span>{offer2}</span><span>{offer3}</span>
          </div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Choose Your Program</h2>
            <p className="text-secondary/60 text-lg">Every plan includes all standard features listed below</p>
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {courses.map((course, i) => {
                  const popular = i === 2;
                  return (
                    <div key={course.id} className={`rounded-2xl border-2 overflow-hidden transition-all hover:shadow-card-hover ${popular?'border-primary shadow-card-hover scale-105':'border-gray-100 shadow-card'}`}>
                      {popular && <div className="bg-primary py-2 text-center text-white text-xs font-bold tracking-wide uppercase">⭐ Most Popular</div>}
                      <div className="p-6">
                        <h3 className="font-display font-bold text-xl text-primary mb-1">{course.name}</h3>
                        <span className="badge bg-gray-100 text-secondary text-xs mb-4 block w-fit">{course.level||'All Levels'}</span>
                        <div className="flex items-end gap-1 mb-1">
                          <span className="text-4xl font-bold font-display text-primary">${course.price}</span>
                          <span className="text-secondary pb-1">/month</span>
                        </div>
                        {course.duration_weeks && <p className="text-sm text-gray-400 mb-4">{course.duration_weeks}-week program</p>}
                        <p className="text-secondary/70 text-sm leading-relaxed mb-6">{course.description}</p>
                        <EnrollButton
                          courseName={course.name}
                          label="Get Started"
                          scrollTo="enroll-form"
                          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${popular?'btn-primary':'btn-secondary'}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* What's included */}
              <div className="bg-gray-50 rounded-2xl p-8 mb-16">
                <h3 className="font-display text-2xl font-bold text-primary text-center mb-8">{includedTitle}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {INCLUDED.map(f => (
                    <div key={f} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold flex-shrink-0">✓</div>
                      <span className="text-sm font-semibold text-secondary">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {HIGHLIGHTS.map(h => (
                  <div key={h.title} className="text-center p-6">
                    <div className="text-4xl mb-3">{h.icon}</div>
                    <h4 className="font-display font-bold text-primary mb-2">{h.title}</h4>
                    <p className="text-secondary/70 text-sm leading-relaxed">{h.desc}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="section-title text-center mb-10">{faqTitle}</h2>
          <div className="space-y-4">
            {[
              ['How does the free trial work?','Book a free trial class with no commitment. You\'ll have a full session with one of our teachers to experience our teaching style firsthand.'],
              ['Can I change my plan later?','Yes! You can switch between programs at any time. We\'ll adjust your next billing cycle accordingly.'],
              ['What if I need to cancel?','You can cancel at any time with no penalty. Your access continues until the end of your paid period.'],
              ['Do you offer discounts for multiple courses?','Yes — family discounts, sibling pricing, and referral rewards are all available. Contact us for details.'],
            ].map(([q,a]) => (
              <details key={q} className="card group">
                <summary className="font-semibold text-primary cursor-pointer list-none flex items-center justify-between">
                  {q}<span className="text-xl text-gray-400 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-secondary/70 mt-3 text-sm leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Enroll form */}
      <section id="enroll-form" className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="section-title mb-2">{ctaTitle}</h2>
            <p className="text-secondary/70">{ctaSub}</p>
          </div>
          <div className="card shadow-card-hover">
            <ContactForm title="" subtitle="" preselectedCourse={selectedCourse}/>
          </div>
        </div>
      </section>
    </div>
  );
}
