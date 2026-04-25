import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { siteContentAPI } from '../services/api';

const SiteContentContext = createContext({});

export const SiteContentProvider = ({ children }) => {
  // allContent is a flat map: "page.section.key" → value
  const [allContent, setAllContent] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch ALL site_content rows at once and build the map
  const fetchAll = useCallback(async () => {
    try {
      const r = await siteContentAPI.getAll();
      const rows = r.data.data || [];
      const map = {};
      rows.forEach(row => {
        map[`${row.page}.${row.section}.${row.key}`] = row.value || '';
      });
      setAllContent(map);
    } catch (e) {
      console.error('SiteContent fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // get(page, section, key, fallback)
  const get = useCallback((page, section, key, fallback = '') => {
    // Check page-specific first, then global fallback
    const pageVal = allContent[`${page}.${section}.${key}`];
    if (pageVal !== undefined && pageVal !== '') return pageVal;
    const globalVal = allContent[`global.${section}.${key}`];
    if (globalVal !== undefined && globalVal !== '') return globalVal;
    return fallback;
  }, [allContent]);

  // Convenience globals object (always up to date)
  const globals = {
    logoUrl:       allContent['global.nav.logo_url']         || '',
    logoText:      allContent['global.nav.logo_text']        || 'Quran Journey',
    logoSubtitle:  allContent['global.nav.logo_subtitle']    || 'Academy',
    whatsapp:      allContent['global.contact.whatsapp']     || '+201508018609',
    whatsappLink:  allContent['global.contact.whatsapp_link']|| 'https://wa.me/201508018609',
    email:         allContent['global.contact.email']        || 'info@quranjourney.com',
    footerTagline: allContent['global.footer.tagline']       || 'Excellence in Quranic Education',
    footerAbout:   allContent['global.footer.about_text']    || 'Learn Quran, Tajweed, Arabic, and Islamic Studies with native Arabic teachers from Al-Azhar University.',
    siteName:      allContent['global.seo.site_name']        || 'Quran Journey Academy',
  };

  return (
    <SiteContentContext.Provider value={{ allContent, loading, get, globals, refresh: fetchAll }}>
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => useContext(SiteContentContext);
