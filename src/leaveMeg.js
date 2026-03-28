// src/leaveMeg.js

// ❌ 移除這行，避免讀取到錯誤的資料庫帳號
// const pool = require('../configs/postgres'); 

async function putComment(req, res) {
  // ✅ 從 app.locals 取得在 app.js 已經連線成功的 admin 實例
  const sql = req.app.locals.sql; 
  
  const { postID, comment } = req.body;
  const username = req.user?.username; // 從 authMiddleware 取得

  if (!username) {
    return res.status(401).json({ error: '未登入或未獲得授權' });
  }

  if (!postID || !comment || comment.length > 150) {
    return res.status(400).json({ error: '請提供貼文 ID，且留言不得為空或超過 150 字' });
  }

  try {
    // 🔍 檢查貼文是否存在 (改用 postgres.js 語法)
    const postCheck = await sql`
      SELECT id FROM post WHERE id = ${postID}
    `;
    
    if (postCheck.length === 0) {
      return res.status(404).json({ error: '找不到對應貼文 ID' });
    }

    // ✍️ 插入留言 (改用 postgres.js 語法)
    const [newComment] = await sql`
      INSERT INTO comment (post_id, username, content) 
      VALUES (${postID}, ${username}, ${comment}) 
      RETURNING id, content, created_at
    `;

    res.status(200).json({
      message: '留言成功',
      comment: newComment,
    });
  } catch (err) {
    console.error('留言失敗:', err.message);
    // 如果這裡報錯 authentication failed，表示你還有其他地方沒改到
    res.status(500).json({ error: '伺服器錯誤' });
  }
}

// ✅ 確保匯出名稱與 routes/users.js 裡解構的名稱一致
module.exports = { putComment };
