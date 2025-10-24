// src/post.js
const pool = require('../configs/postgres'); // ✅ 改用共用連線池

async function userPost(req, res) {
  const { username } = req.user;  
  const { content } = req.body;

  if (!content || content.length === 0 || content.length > 300) {
    return res.status(400).json({ error: '貼文內容不得為空且需小於 300 字' });
  }

  try {
    // 檢查該會員是否存在
    const result = await pool.query('SELECT * FROM member WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '找不到帳號' });
    }

    // 插入貼文
    const insertPost = await pool.query(
      'INSERT INTO post (username, content) VALUES ($1, $2) RETURNING username,id, content, created_at',
      [username, content]
    );

    res.status(200).json({
      message: '貼文成功',
      post: insertPost.rows[0],
    });

  } catch (err) {
    console.error('貼文失敗:', err.message);
    res.status(500).json({ error: '伺服器錯誤' });
  }
}

module.exports = { userPost };
