import React from 'react';
import ContactForm from '../../components/common/ContactForm';
import { useSiteContent } from '../../context/SiteContentContext';
import { backgroundImageStyle } from '../../utils/config';

export default function ContactPage() {
  const { get, globals } = useSiteContent();

  const heroTitle  = get('contact','hero','title',   'Contact Us');
  const heroSub    = get('contact','hero','subtitle',"We're here to help you start your journey");
  const heroBg     = get('contact','hero','bg_image','');
  const infoTitle  = get('contact','info','title',   'Get In Touch');
  const formTitle  = get('contact','form','title',   'Send Us a Message');
  const formSub    = get('contact','form','subtitle',"Fill out the form and we'll respond within 24 hours.");

  const waLink = globals.whatsappLink || `https://wa.me/${(globals.whatsapp||'').replace(/\D/g,'')}`;

  return (
    <div className="pt-24">
      <section className="bg-primary py-20 relative"
        style={backgroundImageStyle(heroBg)}>
        {heroBg && <div className="absolute inset-0 bg-primary/90"/>}
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-display text-5xl font-bold text-white mb-4">{heroTitle}</h1>
          <p className="text-white/70 text-xl">{heroSub}</p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <h2 className="section-title mb-4">{infoTitle}</h2>
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center text-3xl group-hover:bg-primary transition-colors">📱</div>
                <div>
                  <div className="font-bold text-primary">WhatsApp</div>
                  <div className="text-secondary text-sm">{globals.whatsapp}</div>
                </div>
              </a>
              <a href={`mailto:${globals.email}`}
                className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center text-3xl group-hover:bg-primary transition-colors">✉️</div>
                <div>
                  <div className="font-bold text-primary">Email</div>
                  <div className="text-secondary text-sm">{globals.email}</div>
                </div>
              </a>
            </div>
            <div className="card shadow-card-hover">
              <ContactForm title={formTitle} subtitle={formSub}/>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
