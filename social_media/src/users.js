// src/users.js
const pool = require('../configs/postgres'); // ✅ 改用共用 Pool
const bcrypt = require('bcrypt');

async function addUser(req, res) {
  const { username, email, password, city } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: '缺少 username、email 或 password 資料' });
  }
  if (password.length < 6 || password.length > 12) {
    return res.status(400).json({ error: '密碼長度需介於6至12字元' });
  }

  try {
    // 檢查 email 是否已存在
    const result = await pool.query('SELECT id, username, email FROM member WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      console.log("email!!!", result.rows[0].username, "  ", result.rows[0].id);
      return res.status(409).json({ error: 'Email已被使用' });
    }

    // 檢查 username 是否重複
    const result2 = await pool.query('SELECT username FROM member WHERE username = $1', [username]);
    if (result2.rows.length > 0) {
      console.log("username!!!");
      return res.status(409).json({ error: 'username已被使用' });
    }

    // 密碼加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 寫入資料庫
    const insertResult = await pool.query(
      'INSERT INTO member (username, email, password, city) VALUES ($1, $2, $3, $4) RETURNING id',
      [username, email, hashedPassword, city || null]
    );

    res.status(201).json({
      message: '註冊成功，請重新登入取得 USER ID。',
      userId: insertResult.rows[0].id
    });

  } catch (err) {
    console.error('新增失敗:', err.message);
    res.status(500).json({ error: '資料庫錯誤' });
  }
}

module.exports = { addUser };
