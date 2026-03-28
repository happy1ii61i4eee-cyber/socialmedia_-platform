const express = require('express');
const router = express.Router();
const { addUser } = require('../src/users.js');
const { getID } = require('../src/getId.js');
const { userPost } = require('../src/post.js');
const { searchPost } = require('../src/searchPost.js');
const { putComment } = require('../src/leaveMeg.js');
const { authMiddleware } = require('../src/auth.js');

// ❌ 刪除這行：不再從這裡載入資料庫設定，避免重複連線與帳號錯誤
// const pool = require('../configs/postgres.js'); 

// 所有的 Controller (addUser, getID 等) 內部都要改用 req.app.locals.sql

router.post('/add', addUser);
router.post('/Id', getID);

// ✅ 加入 JWT 驗證
router.post('/post', authMiddleware, userPost);

router.get('/post', searchPost);
router.put('/post', authMiddleware, putComment);
router.get('/searchPost', authMiddleware, searchPost);

module.exports = router;