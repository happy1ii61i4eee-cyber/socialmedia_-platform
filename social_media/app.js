var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users'); 

var app = express();

/// 修正：優先從環境變數讀取，若無則回退到 JSON (或直接使用環境變數)
const pgConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'member',
  username: process.env.POSTGRES_USER || 'admin',
  password: process.env.POSTGRES_PASSWORD || 'pg123456',
};

// 為了除錯，你可以暫時加入這行 (正式上線前記得刪除)
console.log('正在嘗試連線的用戶:', pgConfig.username);

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