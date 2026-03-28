// src/searchPost.js

async function searchPost(req, res) {
  const sql = req.app.locals.sql;
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: '請輸入會員名稱' });
  }

  try {
    // 🔍 1. 查詢貼文
    const posts = await sql`
      SELECT id, username, content, created_at 
      FROM post 
      WHERE username = ${username} 
      ORDER BY created_at DESC
    `;

    if (posts.length === 0) {
      return res.status(404).json({ error: '該帳號尚無貼文' });
    }

    // 🔍 2. 查詢留言
    const postIds = posts.map(p => p.id);
    let comments = [];

    if (postIds.length > 0) {
      // ✅ 修正點：使用 sql(postIds) 並移除括號 ()
      // 這樣 postgres.js 才會把 [81, 80...] 轉換成 SQL 數值清單 (81, 80...)
      comments = await sql`
        SELECT content, post_id, username, created_at
        FROM comment
        WHERE post_id IN ${sql(postIds)}
        ORDER BY created_at ASC
      `;
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