// src/searchPost.js
const pool = require('../configs/postgres'); // ✅ 改用共用連線池

async function searchPost(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: '請輸入會員名稱' });
  }

  try {
    // 查詢貼文
    const postResult = await pool.query(
      'SELECT id, username, content, created_at FROM post WHERE username = $1 ORDER BY created_at DESC',
      [username]
    );

    const posts = postResult.rows;

    if (posts.length === 0) {
      return res.status(404).json({ error: '該帳號尚無貼文' });
    }

    // 查詢留言
    const postIds = posts.map(p => p.id);
    let comments = [];

    if (postIds.length > 0) {
      const commentQuery = `
        SELECT content, post_id, username, created_at
        FROM comment
        WHERE post_id = ANY($1)
        ORDER BY created_at ASC
      `;
      const commentResult = await pool.query(commentQuery, [postIds]);
      comments = commentResult.rows;
    }

    res.status(200).json({
      message: '查詢成功',
      posts,
      comments,
    });

  } catch (err) {
    console.error('查詢失敗:', err.message);
    res.status(500).json({ error: '伺服器錯誤' });
  }
}

module.exports = { searchPost };
