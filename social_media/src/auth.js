// src/auth.js
require('dotenv').config();
const jwt = require('jsonwebtoken');


/**
 * JWT 驗證中介層
 * 驗證 Authorization header 是否帶有 Bearer token，
 * 若驗證成功，將解密後的 user 物件存入 req.user。
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // 若沒有帶 token
  if (!token) {
    return res.status(403).json({ error: '未登入或缺少 Token' });
  }

  // 驗證 token
jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey', (err, user) => {
    if (err) {
      console.error('JWT 驗證失敗:', err.message);
      return res.status(403).json({ error: '登入逾時或權限失效，請重新登入' });
    }

    // 通過驗證
    req.user = user;
    next();
  });
}

module.exports = { authMiddleware };
