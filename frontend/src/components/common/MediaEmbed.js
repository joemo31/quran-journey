import React from 'react';

// Extracts YouTube video ID from any YouTube URL format
function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^/?]+)/,
    /youtu\.be\/([^/?]+)/,
    /youtube\.com\/shorts\/([^/?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// Check if a URL is a YouTube link
function isYouTubeUrl(url) {
  return url && (url.includes('youtube.com') || url.includes('youtu.be'));
}

// Check if URL is a direct video file
function isVideoFile(url) {
  return url && /\.(mp4|webm|mov|avi|mkv|ogv)(\?|$)/i.test(url);
}

// Check if URL is an image
function isImageUrl(url) {
  return url && /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?|$)/i.test(url);
}

/**
 * Smart media embed — handles:
 * - YouTube URLs (any format) → iframe embed
 * - Direct video files → <video> tag
 * - Image URLs → <img> tag
 * - Falls back to a link
 *
 * Props:
 *   url          - the media URL
 *   youtubeUrl   - explicit YouTube URL (overrides url for video)
 *   imageUrl     - explicit image URL
 *   mediaType    - 'image' | 'video' | 'youtube' (hint)
 *   alt          - alt text for images
 *   className    - wrapper class
 *   aspectRatio  - 'video' (16:9) | 'square' | 'auto' (default: video)
 */
export default function MediaEmbed({
  url,
  youtubeUrl,
  imageUrl,
  mediaType,
  alt = 'Media',
  className = '',
  aspectRatio = 'video',
}) {
  const aspectClass = {
    video:  'aspect-video',
    square: 'aspect-square',
    auto:   '',
  }[aspectRatio] || 'aspect-video';

  const wrapClass = `${aspectClass} rounded-2xl overflow-hidden bg-gray-100 ${className}`;

  // Determine what to show — priority order:
  // 1. Explicit youtubeUrl prop
  // 2. url that looks like YouTube
  // 3. Explicit imageUrl prop
  // 4. url that looks like a video file
  // 5. url that looks like an image
  // 6. Fallback

  const ytUrl = youtubeUrl || (isYouTubeUrl(url) ? url : null);
  const ytId  = getYouTubeId(ytUrl);

  if (ytId) {
    return (
      <div className={wrapClass}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
          title={alt}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          loading="lazy"
        />
      </div>
    );
  }

  const imgUrl = imageUrl || (isImageUrl(url) ? url : null);
  if (imgUrl || mediaType === 'image') {
    return (
      <div className={wrapClass}>
        {imgUrl
          ? <img src={imgUrl} alt={alt} className="w-full h-full object-cover"
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
            />
          : null
        }
        <div className="w-full h-full hidden items-center justify-center bg-primary-50">
          <span className="text-6xl">📖</span>
        </div>
      </div>
    );
  }

  const vidUrl = isVideoFile(url) ? url : (mediaType === 'video' ? url : null);
  if (vidUrl) {
    return (
      <div className={wrapClass}>
        <video src={vidUrl} controls className="w-full h-full object-cover" preload="metadata"/>
      </div>
    );
  }

  // No valid URL
  return (
    <div className={`${wrapClass} flex items-center justify-center`}>
      <span className="text-6xl">📖</span>
    </div>
  );
}
