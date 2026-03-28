// src/users.js
const bcrypt = require('bcrypt');

// ❌ 移除這行，不要在這裡獨立 require 連線設定
// const pool = require('../configs/postgres'); 

async function addUser(req, res) {
  // ✅ 從 app.locals 取得正確的 admin 連線實例
  const sql = req.app.locals.sql; 
  const { username, email, password, city } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: '缺少 username、email 或 password 資料' });
  }
  if (password.length < 6 || password.length > 12) {
    return res.status(400).json({ error: '密碼長度需介於6至12字元' });
  }

  try {
    // 🔍 1. 檢查 email 是否已存在 (改用 postgres.js 語法)
    const existingEmails = await sql`
      SELECT id, username, email FROM member WHERE email = ${email}
    `;
    if (existingEmails.length > 0) {
      console.log("email!!!", existingEmails[0].username, "   ", existingEmails[0].id);
      return res.status(409).json({ error: 'Email已被使用' });
    }

    // 🔍 2. 檢查 username 是否重複
    const existingUsers = await sql`
      SELECT username FROM member WHERE username = ${username}
    `;
    if (existingUsers.length > 0) {
      console.log("username!!!");
      return res.status(409).json({ error: 'username已被使用' });
    }

    // 🧂 3. 密碼加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✍️ 4. 寫入資料庫 (改用 postgres.js 語法)
    const [newUser] = await sql`
      INSERT INTO member (username, email, password, city) 
      VALUES (${username}, ${email}, ${hashedPassword}, ${city || null}) 
      RETURNING id
    `;

    res.status(201).json({
      message: '註冊成功，請重新登入取得 USER ID。',
      userId: newUser.id
    });

  } catch (err) {
    console.error('新增失敗:', err.message);
    res.status(500).json({ error: '資料庫錯誤' });
  }
}

module.exports = { addUser };