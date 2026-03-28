// src/post.js

// ❌ 移除這行，不要在這裡建立獨立連線
// const pool = require('../configs/postgres'); 

async function userPost(req, res) {
  // ✅ 從 app.locals 取得正確的 admin 連線實例
  const sql = req.app.locals.sql; 
  
  const { username } = req.user;  
  const { content } = req.body;

  if (!content || content.length === 0 || content.length > 300) {
    return res.status(400).json({ error: '貼文內容不得為空且需小於 300 字' });
  }

  try {
    // 🔍 檢查該會員是否存在 (改用 postgres.js 語法)
    const members = await sql`
      SELECT username FROM member WHERE username = ${username}
    `;

    if (members.length === 0) {
      return res.status(404).json({ error: '找不到帳號' });
    }

    // ✍️ 插入貼文 (改用 postgres.js 語法)
    // 使用解構賦值 [newPost] 直接取得回傳的單筆結果
    const [newPost] = await sql`
      INSERT INTO post (username, content) 
      VALUES (${username}, ${content}) 
      RETURNING username, id, content, created_at
    `;

    res.status(200).json({
      message: '貼文成功',
      post: newPost,
    });

  } catch (err) {
    console.error('貼文失敗:', err.message);
    res.status(500).json({ error: '伺服器錯誤' });
  }
}

// ✅ 確保匯出格式正確
module.exports = { userPost };
