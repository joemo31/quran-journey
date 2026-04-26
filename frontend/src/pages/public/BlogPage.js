import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI } from '../../services/api';
import { useSiteContent } from '../../context/SiteContentContext';
import ContactForm from '../../components/common/ContactForm';
import MediaEmbed from '../../components/common/MediaEmbed';
import { format } from 'date-fns';
import { backgroundImageStyle } from '../../utils/config';

export default function BlogPage() {
  const { get } = useSiteContent();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const heroTitle = get('blog','hero','title',   'Academy Blog');
  const heroSub   = get('blog','hero','subtitle','Insights, guidance, and knowledge from our scholars');
  const heroBg    = get('blog','hero','bg_image','');
  const ctaTitle  = get('blog','cta','title',   'Start Your Quran Journey');
  const ctaSub    = get('blog','cta','subtitle','Ready to begin? Book your free trial class today.');

  useEffect(() => {
    blogAPI.getAll({ is_published:'true' }).then(r => setPosts(r.data.data||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

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

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-gray-400"><div className="text-6xl mb-4">✍️</div><p className="text-xl">No posts published yet.</p></div>
          ) : (
            <div className="space-y-16">
              {posts.map(post => (
                <article key={post.id} className="border-b border-gray-100 pb-16 last:border-0">
                  {/* Smart media — handles YouTube, images, videos */}
                  <MediaEmbed
                    url={post.image_url || post.video_url}
                    youtubeUrl={post.youtube_url}
                    imageUrl={post.image_url}
                    mediaType={post.youtube_url ? 'youtube' : post.media_type}
                    alt={post.title}
                    className="mb-8"
                  />
                  <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                    <span className="font-medium text-secondary">{post.author_name}</span>
                    <span>•</span>
                    <time>{format(new Date(post.created_at),'MMMM d, yyyy')}</time>
                    {post.tags?.length > 0 && <>
                      <span>•</span>
                      <div className="flex gap-2">{post.tags.slice(0,3).map(t=><span key={t} className="badge bg-primary-50 text-primary">{t}</span>)}</div>
                    </>}
                  </div>
                  <h2 className="font-display text-3xl font-bold text-primary mb-4">
                    <Link to={`/blog/${post.slug}`} className="hover:text-primary-700 transition-colors">{post.title}</Link>
                  </h2>
                  {post.excerpt && <p className="text-secondary/70 text-lg leading-relaxed mb-6">{post.excerpt}</p>}
                  <Link to={`/blog/${post.slug}`} className="btn-primary text-sm">Read Full Article →</Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="card shadow-card-hover"><ContactForm title={ctaTitle} subtitle={ctaSub}/></div>
        </div>
      </section>
    </div>
  );
}
