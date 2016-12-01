var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});
var compression = require('compression');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
// var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var settings = require('./settings');
var flash = require('connect-flash');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
// 生成一个express实例app
var app = express();

// 设置端口号
app.set('port', process.env.PORT || 3000);
// view engine setup
// 设置 views 文件夹为存放视图文件的目录, 即存放模板文件的地方,__dirname 为全局变量,存储当前正在执行的脚本所在的目录
app.set('views', path.join(__dirname, 'views'));
// 通过 express -e blog 只是初始化了一个使用 ejs 模板引擎的工程而已，比如 node_modules 下添加了 ejs 模块，views 文件夹下有 index.ejs 。并不是说强制该工程只能使用 ejs 不能使用其他的模板引擎比如 jade，真正指定使用哪个模板引擎的是 app.set('view engine', 'ejs');
// 设置视图模板引擎为 ejs; 通过 express -e blog 只是初始化了一个使用 ejs 模板引擎的工程而已，比如 node_modules 下添加了 ejs 模块，views 文件夹下有 index.ejs 。并不是说强制该工程只能使用 ejs 不能使用其他的模板引擎比如 jade，真正指定使用哪个模板引擎的是 app.set('view engine', 'ejs');
app.set('view engine', 'ejs');
// gzip压缩响应
app.use(compression());

// app.use([path,] function [, function...]), app.use用来准备中间件，第一个参数是路径（可选），不指定的话就是'/'，对app的每个请求都会执行回调函数，否则就只对指定路径执行回调函数
// flash 是一个在 session 中用于存储信息的特定区域。信息写入 flash ，下一次显示完毕后即被清除。典型的应用是结合重定向的功能，确保信息是提供给下一个被渲染的页面
app.use(flash());
// uncomment after placing your favicon in /public
// 设置/public/favicon.ico为favicon图标。
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// 加载日志中间件
app.use(logger('dev'));
app.use(logger("combined", {stream: accessLog}));
// 加载解析json的中间件
app.use(bodyParser.json());
// 加载解析urlencoded请求体的中间件
app.use(bodyParser.urlencoded({ extended: false }));
// 加载解析cookie的中间件
// app.use(cookieParser());
// 设置了静态文件目录为 public 文件夹
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (err, req, res, next) {
  var meta = '[' + new Date() + '] ' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  next();
});
// 使用 express-session 和 connect-mongo 模块实现了将会话信息存储到mongodb中。
app.use(session({
	// secret用来防止篡改 cookie
  secret: settings.cookieSecret,
  resave: false,
  saveUninitialized: false,
  key: settings.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days，cookie 的生存期，毫秒为单位，过期后cookie的sessionID就自动删除了
  // store选项设置会话存储实例
  // 设置它的 store 参数为 MongoStore 实例，把会话信息存储到数据库中，以避免丢失
  store: new MongoStore({
    url: settings.url
  })
}));
// 把实现路由功能的代码都放在 routes/index.js 里，把路由控制器和实现路由功能的函数都放到 index.js 里，app.js 中只有一个总的路由接口，也就是这里的routes(app)
routes(app);
// app.get('port')取得端口号
app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
/*app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
*/