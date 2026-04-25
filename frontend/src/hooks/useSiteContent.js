import { useState, useEffect } from 'react';
import { siteContentAPI } from '../services/api';

export const useSiteContent = (page) => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!page) { setLoading(false); return; }
    siteContentAPI.getByPage(page)
      .then(r => setContent(r.data.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  // Helper: get value with fallback
  const get = (pageName, section, key, fallback = '') => {
    return content?.[pageName]?.[section]?.[key]?.value
      || content?.['global']?.[section]?.[key]?.value
      || fallback;
  };

  return { content, loading, get };
};
