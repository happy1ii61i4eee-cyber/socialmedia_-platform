var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users'); 

var app = express();

/// 修正：加入 SSL 設定並對齊 Render 預設變數名稱
const pgConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DATABASE || 'member', // Render 預設通常是 POSTGRES_DATABASE
  username: process.env.POSTGRES_USER || 'admin',
  password: process.env.POSTGRES_PASSWORD || 'pg123456',
  // 關鍵修正：當在生產環境 (Render) 時，強制開啟 SSL
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false, 
};

// 如果上面的判斷讓你困惑，直接改成這樣也可以（Render 強制要求）：
// ssl: 'require' 

console.log('正在嘗試連線的 Host:', pgConfig.host);

const postgres = require('postgres');
const sql = postgres(pgConfig);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// 路由綁定
app.use('/', indexRouter);
app.use('/members', usersRouter); 
app.use('/members/profile', require('./src/profile'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});
app.locals.sql = sql;
module.exports = app;
