// src/profile.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth.js');
const pool = require('../configs/postgres'); // ✅ 改用共用連線池

router.get('/', authMiddleware, async (req, res) => {
  try {
    // 從 token 拿出登入使用者 ID
    const userId = req.user.id;

    // 查詢會員資料
    const memberResult = await pool.query(
      'SELECT id, username, email, city FROM member WHERE id = $1',
      [userId]
    );

    if (memberResult.rows.length === 0) {
      return res.status(404).json({ error: '找不到會員資料' });
    }

    const user = memberResult.rows[0];

    // 查詢該會員的貼文
    const postsResult = await pool.query(
      'SELECT id, content, created_at FROM post WHERE username = $1 ORDER BY created_at DESC',
      [user.username]
    );

    const posts = postsResult.rows;

    // 查詢留言（如果有貼文的話）
    let comments = [];
    if (posts.length > 0) {
      const postIds = posts.map(p => p.id);
      const commentQuery = `
        SELECT id, post_id, username, content, created_at
        FROM comment
        WHERE post_id = ANY($1)
        ORDER BY created_at ASC
      `;
      const commentsResult = await pool.query(commentQuery, [postIds]);
      comments = commentsResult.rows;
    }

    res.json({
      message: '會員資料載入成功',
      user,
      posts,
      comments
    });

  } catch (err) {
    console.error('取得會員資料失敗:', err.message);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;
