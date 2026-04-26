const { query } = require('../config/database');

const normalizeMediaType = (mediaType, youtubeUrl) => {
  if (mediaType === 'youtube' || youtubeUrl) {
    return 'video';
  }

  return mediaType || 'image';
};

const getAllPosts = async (req, res, next) => {
  try {
    const { is_published, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    let where = '1=1'; const params = [];
    if (is_published !== undefined) { where += ' AND is_published=$1'; params.push(is_published === 'true'); }
    params.push(limit, offset);
    const li = params.length - 1, oi = params.length;
    const countRes = await query(`SELECT COUNT(*) FROM blog_posts WHERE ${where}`, params.slice(0, -2));
    const result = await query(
      `SELECT id,title,slug,excerpt,content,image_url,video_url,youtube_url,media_type,
              is_published,author_name,tags,created_at,updated_at
       FROM blog_posts WHERE ${where} ORDER BY created_at DESC LIMIT $${li} OFFSET $${oi}`,
      params
    );
    res.json({ success:true, data:result.rows, pagination:{ total:parseInt(countRes.rows[0].count), page:+page, limit:+limit } });
  } catch(e){ next(e); }
};

const getPostBySlug = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM blog_posts WHERE slug=$1 AND is_published=true', [req.params.slug]);
    if (!result.rows.length) return res.status(404).json({ success:false, message:'Post not found.' });
    res.json({ success:true, data:result.rows[0] });
  } catch(e){ next(e); }
};

const createPost = async (req, res, next) => {
  try {
    const { title, content, excerpt, image_url, video_url, youtube_url, media_type='image', is_published=false, author_name, tags } = req.body;
    const normalizedMediaType = normalizeMediaType(media_type, youtube_url);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') + '-' + Date.now();
    const result = await query(
      `INSERT INTO blog_posts (title,slug,content,excerpt,image_url,video_url,youtube_url,media_type,is_published,author_name,tags,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW()) RETURNING *`,
      [title, slug, content, excerpt, image_url, video_url, youtube_url||null, normalizedMediaType, is_published, author_name, tags]
    );
    res.status(201).json({ success:true, data:result.rows[0] });
  } catch(e){ next(e); }
};

const updatePost = async (req, res, next) => {
  try {
    const { title, content, excerpt, image_url, video_url, youtube_url, media_type, is_published, author_name, tags } = req.body;
    const normalizedMediaType = normalizeMediaType(media_type, youtube_url);
    const result = await query(
      `UPDATE blog_posts SET title=COALESCE($1,title), content=COALESCE($2,content),
       excerpt=COALESCE($3,excerpt), image_url=COALESCE($4,image_url), video_url=COALESCE($5,video_url),
       youtube_url=COALESCE($6,youtube_url), media_type=COALESCE($7,media_type),
       is_published=COALESCE($8,is_published), author_name=COALESCE($9,author_name),
       tags=COALESCE($10,tags), updated_at=NOW() WHERE id=$11 RETURNING *`,
      [title,content,excerpt,image_url,video_url,youtube_url||null,normalizedMediaType,is_published,author_name,tags,req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success:false, message:'Post not found.' });
    res.json({ success:true, data:result.rows[0] });
  } catch(e){ next(e); }
};

const deletePost = async (req, res, next) => {
  try {
    await query('DELETE FROM blog_posts WHERE id=$1', [req.params.id]);
    res.json({ success:true, message:'Post deleted.' });
  } catch(e){ next(e); }
};

module.exports = { getAllPosts, getPostBySlug, createPost, updatePost, deletePost };
