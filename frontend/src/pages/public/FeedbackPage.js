import React, { useState, useEffect } from 'react';
import { testimonialsAPI } from '../../services/api';
import { useSiteContent } from '../../context/SiteContentContext';
import ContactForm from '../../components/common/ContactForm';
import { backgroundImageStyle, mediaUrl } from '../../utils/config';

const StarRating = ({ rating=5 }) => (
  <div className="flex gap-0.5">{[1,2,3,4,5].map(s=><span key={s} className={`text-lg ${s<=rating?'text-yellow-400':'text-gray-200'}`}>★</span>)}</div>
);

export default function FeedbackPage() {
  const { get } = useSiteContent();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const heroTitle    = get('feedback','hero','title',     'Student Feedback');
  const heroSub      = get('feedback','hero','subtitle',  'Real stories from our global community of learners');
  const heroBg       = get('feedback','hero','bg_image',  '');
  const videosTitle  = get('feedback','videos','title',   'Video Testimonials');
  const videosSub    = get('feedback','videos','subtitle','Watch what our students have to say');
  const reviewsTitle = get('feedback','reviews','title',  'What Our Students Say');
  const reviewsSub   = get('feedback','reviews','subtitle','Feedback from learners around the world');
  const ctaTitle     = get('feedback','cta','title',      'Join Our Growing Community');
  const ctaSub       = get('feedback','cta','subtitle',   'Start your Quran journey today with a free trial class');
  const formTitle    = get('feedback','form','title',     'Book Your Free Trial');
  const formSub      = get('feedback','form','subtitle',  'Join thousands of satisfied students.');

  useEffect(() => {
    testimonialsAPI.getAll({ is_published:'true' }).then(r => setTestimonials(r.data.data||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const videos   = testimonials.filter(t => t.media_type==='video' && t.video_url);
  const textOnly = testimonials.filter(t => t.media_type!=='video' || !t.video_url);

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-primary py-20 relative overflow-hidden"
        style={backgroundImageStyle(heroBg)}>
        {heroBg && <div className="absolute inset-0 bg-primary/90"/>}
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm font-medium px-4 py-2 rounded-full mb-6">⭐ Real Stories from Real Students</div>
          <h1 className="font-display text-5xl font-bold text-white mb-4">{heroTitle}</h1>
          <p className="text-white/70 text-xl">{heroSub}</p>
          <div className="grid grid-cols-3 gap-6 mt-12 max-w-xl mx-auto">
            {[['5,000+','Students Worldwide'],['15+','Years Teaching'],['4.9/5','Average Rating']].map(([v,l])=>(
              <div key={l} className="text-center">
                <div className="text-3xl font-bold font-display text-white">{v}</div>
                <div className="text-white/60 text-sm mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video testimonials */}
      {videos.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="section-title text-center mb-3">{videosTitle}</h2>
            <p className="text-center text-secondary/60 mb-10">{videosSub}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map(t => (
                <div key={t.id} className="card overflow-hidden p-0">
                  <div className="aspect-video bg-gray-900">
                    <video src={mediaUrl(t.video_url)} controls className="w-full h-full object-cover"/>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      {t.student_avatar_url
                        ? <img src={mediaUrl(t.student_avatar_url)} alt={t.student_name} className="w-10 h-10 rounded-full object-cover"/>
                        : <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">{t.student_name?.charAt(0)}</div>
                      }
                      <div>
                        <div className="font-semibold text-primary text-sm">{t.student_name}</div>
                        {t.student_country && <div className="text-xs text-gray-400">{t.student_country}</div>}
                      </div>
                    </div>
                    <StarRating rating={t.rating}/>
                    {t.content && <p className="text-secondary/70 text-sm mt-2 line-clamp-2">{t.content}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Text reviews */}
      {textOnly.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="section-title text-center mb-3">{reviewsTitle}</h2>
            <p className="text-center text-secondary/60 mb-10">{reviewsSub}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {textOnly.map(t => (
                <div key={t.id} className="card relative">
                  <div className="text-6xl font-display text-primary/10 leading-none absolute top-4 right-4">"</div>
                  <StarRating rating={t.rating}/>
                  <p className="text-secondary/80 leading-relaxed mt-3 mb-5 relative z-10">{t.content}</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    {t.student_avatar_url
                      ? <img src={mediaUrl(t.student_avatar_url)} alt={t.student_name} className="w-11 h-11 rounded-full object-cover"/>
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
          </div>
        </section>
      )}

      {loading && <div className="py-24 flex justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>}
      {!loading && testimonials.length===0 && (
        <div className="py-24 text-center text-gray-400"><div className="text-6xl mb-4">⭐</div><p className="text-xl font-medium">Testimonials coming soon.</p></div>
      )}

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-3">{ctaTitle}</h2>
          <p className="text-white/70 mb-8">{ctaSub}</p>
          <a href="#enroll" className="btn-primary bg-white !text-primary hover:bg-gray-100 px-8 py-4">Book Free Trial Class</a>
        </div>
      </section>

      <section id="enroll" className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="card shadow-card-hover">
            <ContactForm title={formTitle} subtitle={formSub}/>
          </div>
        </div>
      </section>
    </div>
  );
}
