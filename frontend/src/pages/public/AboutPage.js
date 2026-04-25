import React from 'react';
import ContactForm from '../../components/common/ContactForm';
import { useSiteContent } from '../../context/SiteContentContext';

export default function AboutPage() {
  const { get } = useSiteContent();

  const heroTitle   = get('about','hero','title',   'About Quran Journey Academy');
  const heroSub     = get('about','hero','subtitle','Learn, Connect, and Grow with the Qur\'an');
  const heroBg      = get('about','hero','bg_image','');
  const missionTitle= get('about','mission','title','Our Mission');
  const missionBody = get('about','mission','body', 'At Qur\'an Journey Institute, we\'re passionate about making Qur\'anic education accessible, engaging, and transformative. With over 15 years of experience, our certified teachers guide students of all ages on their journey to connect with the Holy Qur\'an.');
  const missionBody2= get('about','mission','body2','Our teachers are Al-Azhar certified scholars with verified Ijazah, ensuring authentic and traditional transmission of Quranic knowledge.');
  const missionImg  = get('about','mission','image','');
  const statStudents= get('about','stats','students',  '5,000+');
  const statExp     = get('about','stats','experience','15+');
  const statTeachers= get('about','stats','teachers',  '100%');
  const statLearn   = get('about','stats','learning',  '24/7');
  const ctaTitle    = get('about','cta','title',   'Ready to Start Your Journey?');
  const ctaSub      = get('about','cta','subtitle','Join thousands of students learning the Quran online.');

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-primary py-20 relative overflow-hidden"
        style={heroBg ? { backgroundImage:`url(${heroBg})`, backgroundSize:'cover', backgroundPosition:'center' } : {}}>
        <div className="absolute inset-0 bg-primary/90"/>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-display text-5xl font-bold text-white mb-4">{heroTitle}</h1>
          <p className="text-white/70 text-xl">{heroSub}</p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="section-title mb-6">{missionTitle}</h2>
              <div className="text-secondary/70 text-lg leading-relaxed mb-4"
                dangerouslySetInnerHTML={{ __html: missionBody }} />
              {missionBody2 && <p className="text-secondary/70 text-lg leading-relaxed">{missionBody2}</p>}
            </div>
            <div>
              {missionImg
                ? <img src={missionImg} alt="Our Mission" className="rounded-2xl w-full object-cover shadow-card-hover"/>
                : (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      [statStudents,'Students Worldwide'],
                      [statExp,     'Years Experience'],
                      [statTeachers,'Teachers Certified'],
                      [statLearn,   'Flexible Learning'],
                    ].map(([val,lbl]) => (
                      <div key={lbl} className="card text-center">
                        <div className="text-4xl font-bold text-primary font-display mb-1">{val}</div>
                        <div className="text-sm text-secondary font-medium">{lbl}</div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-12 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              [statStudents,'Students'],
              [statExp,     'Years'],
              [statTeachers,'Certified'],
              [statLearn,   'Available'],
            ].map(([v,l]) => (
              <div key={l}>
                <div className="text-4xl font-bold font-display text-white mb-1">{v}</div>
                <div className="text-white/60 text-sm">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="section-title mb-2">{ctaTitle}</h2>
            <p className="text-secondary/70">{ctaSub}</p>
          </div>
          <div className="card shadow-card-hover">
            <ContactForm title="Get in Touch" subtitle="" />
          </div>
        </div>
      </section>
    </div>
  );
}
