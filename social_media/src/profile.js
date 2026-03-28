// src/profile.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth.js');

router.get('/', authMiddleware, async (req, res) => {
  const sql = req.app.locals.sql;

  try {
    const userId = req.user.id;

    // 🔍 1. 查詢會員資料
    const members = await sql`
      SELECT id, username, email, city FROM member WHERE id = ${userId}
    `;

    if (members.length === 0) {
      return res.status(404).json({ error: '找不到會員資料' });
    }

    const user = members[0];

    // 🔍 2. 查詢該會員的貼文
    const posts = await sql`
      SELECT id, content, created_at FROM post 
      WHERE username = ${user.username} 
      ORDER BY created_at DESC
    `;

    // 🔍 3. 查詢留言
    let comments = [];
    if (posts.length > 0) {
      const postIds = posts.map(p => p.id);
      
      // ✅ 修正重點：使用 sql(postIds) 語法，並且不要加括號 ()
      // postgres.js 會自動幫你把陣列轉成 (1, 2, 3) 這種格式
      comments = await sql`
        SELECT id, post_id, username, content, created_at
        FROM comment
        WHERE post_id IN ${sql(postIds)}
        ORDER BY created_at ASC
      `;
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