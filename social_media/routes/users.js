const express = require('express');
const router = express.Router();
const { addUser } = require('../src/users.js');
const { getID } = require('../src/getId.js');
const { userPost } = require('../src/post.js');
const { searchPost } = require('../src/searchPost.js');
const { putComment } = require('../src/leaveMeg.js');
const { authMiddleware } = require('../src/auth.js');
const pool = require('../configs/postgres.js'); // ✅ 統一使用 Pool 物件（連 PostgreSQL）

router.post('/add', addUser);
router.post('/Id', getID);

// ✅ 加入 JWT 驗證
router.post('/post', authMiddleware, userPost);

router.get('/post', searchPost);
router.put('/post', authMiddleware, putComment);
router.get('/searchPost', authMiddleware, searchPost);

module.exports = router;
