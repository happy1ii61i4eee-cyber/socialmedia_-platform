const { Pool } = require('pg');

// 優先使用環境變數 DATABASE_URL (Render 提供)
// 如果沒有環境變數，則使用本地設定 (僅供本地測試)
const connectionString = process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/member';

const pool = new Pool({
  connectionString: connectionString,
  // 關鍵設定：Render 的 PostgreSQL 強制要求 SSL 連線
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// 測試連線是否成功
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Error acquiring client', err.stack);
  }
  console.log('✅ Connected to PostgreSQL');
});

module.exports = pool;
