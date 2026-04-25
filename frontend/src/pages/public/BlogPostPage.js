import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogAPI } from '../../services/api';
import { useSiteContent } from '../../context/SiteContentContext';
import ContactForm from '../../components/common/ContactForm';
import MediaEmbed from '../../components/common/MediaEmbed';
import { format } from 'date-fns';

export default function BlogPostPage() {
  const { slug } = useParams();
  const { get } = useSiteContent();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const ctaTitle = get('blog','cta','title','Start Your Quran Journey');
  const ctaSub   = get('blog','cta','subtitle','Ready to begin? Book your free trial class today.');

  useEffect(() => {
    blogAPI.getBySlug(slug).then(r=>setPost(r.data.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-24"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>;
  if (!post) return (
    <div className="min-h-screen flex items-center justify-center text-center pt-24">
      <div><div className="text-6xl mb-4">😔</div><h2 className="text-2xl font-display font-bold text-primary mb-4">Post not found</h2><Link to="/blog" className="btn-primary">Back to Blog</Link></div>
    </div>
  );

  return (
    <div className="pt-24">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to="/blog" className="inline-flex items-center gap-2 text-primary font-semibold mb-8 hover:underline">← Back to Blog</Link>

        {/* Smart media embed */}
        <MediaEmbed
          url={post.image_url || post.video_url}
          youtubeUrl={post.youtube_url}
          imageUrl={post.image_url}
          mediaType={post.youtube_url ? 'youtube' : post.media_type}
          alt={post.title}
          className="mb-10"
        />

        <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
          <span className="font-medium text-secondary">{post.author_name}</span>
          <span>•</span>
          <time>{format(new Date(post.created_at),'MMMM d, yyyy')}</time>
          {post.tags?.length > 0 && <>
            <span>•</span>
            <div className="flex flex-wrap gap-2">{post.tags.map(t=><span key={t} className="badge bg-primary-50 text-primary">{t}</span>)}</div>
          </>}
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-8 leading-tight">{post.title}</h1>
        <div className="prose prose-lg max-w-none text-secondary/80 leading-relaxed"
          style={{lineHeight:'1.9'}} dangerouslySetInnerHTML={{__html:post.content}}/>
      </article>

      <section className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="card shadow-card-hover"><ContactForm title={ctaTitle} subtitle={ctaSub}/></div>
        </div>
      </section>
    </div>
  );
}
