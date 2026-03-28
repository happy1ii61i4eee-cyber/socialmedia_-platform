// src/getId.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ❌ 移除這行：不要在這裡 require 連線設定，這會導致帳號變回 "user"
// const pool = require('../configs/postgres'); 

async function getID(req, res) {
  // ✅ 從 app.locals 取得在 app.js 已經連線成功的 admin 實例
  const sql = req.app.locals.sql; 
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '請輸入帳號密碼' });
  }

  try {
    // 🔍 改用 postgres.js 的標籤模板語法 (Tagged Template)
    // 注意：這裡不再需要 .query() 或 .rows，它會直接回傳陣列
    const users = await sql`
      SELECT * FROM member 
      WHERE username = ${username}
    `;

    if (users.length === 0) {
      return res.status(401).json({ error: '帳號不存在' });
    }

    const user = users[0];

    // 🧂 驗證密碼
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: '密碼錯誤' });
    }

    // 🔑 產生 JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'mysecretkey',
      { expiresIn: '1h' }
    );

    // 🎯 回傳登入成功資訊
    res.status(200).json({
      message: '登入成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error('查詢失敗:', err.message);
    res.status(500).json({ error: '伺服器錯誤' });
  }
}

module.exports = { getID };
