// src/getId.js
const pool = require('../configs/postgres'); // ✅ 改用共用的 Pool
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function getID(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '請輸入帳號密碼' });
  }

  try {
    // 🔍 使用 Pool 查詢
    const result = await pool.query('SELECT * FROM member WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: '帳號不存在' });
    }

    const user = result.rows[0];

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
