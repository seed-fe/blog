// var express = require('express');
// var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// module.exports = router;
// 引入 crypto 模块和 user.js 用户模型文件，crypto 是 Node.js 的一个核心模块，我们用它生成散列值来加密密码
var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js'),
    Comment = require('../models/comment.js'),
    multer = require('multer');
// destination 是上传的文件所在的目录，filename 函数用来修改上传后的文件名，这里设置为保持原来的文件名
var storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, './public/images')
    },
    filename: function (req, file, cb){
        cb(null, file.originalname)
    }
});
var upload = multer({
    storage: storage
});
module.exports = function(app) {
  // 注册用户名远程校验
  app.get('/validate_reg',function(req,res) {
     User.get(req.query.name, function(err, user) {
        // 用户名已存在就返回false，不存在就返回true
        return user ? res.json(false) : res.json(true)
      }) 
  });
  // 登录远程校验
  app.get('/validate',function(req,res) {
      User.get(req.query.name, function(err, user) {
        return !user ? res.json(false) : res.json(true)
      })
  });
  // 主页, 未登录的时候显示登录和注册页，登录了才显示有文章的主页
  app.get('/',function(req,res) {
    if (req.session.user) {
    	return res.redirect('/index');
    } else {
    	res.render('main',{
    		title: 'N-blog·基于Express和Bootstrap的多人博客系统'
    	});
    }
  });
  app.get('/index', checkLogin);
  app.get('/index', function (req, res) {
    // console.log(req.session.user);
    // console.log(user);
    // 判断是否是第一页，并把请求的页数转换成number类型，或操作第一个值true就不再求第二个值了
    var page = parseInt(req.query.p) || 1;
    // Post.getAll(null, function(err, posts) {
    Post.getFive(null, page, function(err, posts, total) {
      if (err) {
        posts = [];
      }
      // 调用 res.render() 渲染模版，并将其产生的页面直接返回给客户端。它接受两个参数，第一个是模板的名称，即 views 目录下的模板文件名，扩展名 .ejs 可选。第二个参数是传递给模板的数据对象，用于模板翻译
      // res.render(view [, locals] [, callback]), The view argument is a string that is the file path of the view file to render. This can be an absolute path, or a path relative to the views setting, which here is 'app.set('views', path.join(__dirname, 'views'));'.
      res.render('index', {
      	title: '首页·N-blog',
        user: req.session.user,
        posts: posts,
        page: page,
        isFirstPage: (page - 1) == 0,
        isLastPage: ((page - 1) * 5 + posts.length) == total,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res) {
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    //检查用户是否存在
    User.get(req.body.name, function (err, user) {
      if (!user) {
        req.flash('error', '用户不存在!'); 
        return res.redirect('/');//用户不存在则跳转到登录页
      }
      //检查密码是否一致
      if (user.password != password) {
        req.flash('error', '密码错误!'); 
        return res.redirect('/');//密码错误则跳转到登录页
      }
      //用户名密码都匹配后，将用户信息存入 session
      req.session.user = user;
      req.flash('success', '登陆成功!');
      res.redirect('/index');//登陆成功后跳转到主页
    });
  });
  // 已登陆则不能访问注册页面，返回之前的页面，否则通过next转移控制权，继续进入登录页面
  app.post('/reg', checkNotLogin);
  app.post('/reg', function (req, res) {
    // req.body： 就是 POST 请求信息解析过后的对象，例如我们要访问 POST 来的表单内的 name="password" 域的值，只需访问 req.body['password'] 或 req.body.password 即可
    var name = req.body.name,
      password = req.body.password,
      // password-repeat中间有减法操作符，不能直接当做字符串，不能用'.'获取属性，只能用[]获取属性
      password_re = req.body['password-repeat'];
    //检验用户两次输入的密码是否一致
    if (password_re != password) {
      req.flash('error', '两次输入的密码不一致!'); 
      // res.redirect： 重定向功能，实现了页面的跳转
      return res.redirect('/');//返回注册页
    }
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
        // User：我们直接使用了 User 对象。User 是一个描述数据的对象，即 MVC 架构中的模型(M)。前面我们使用了许多视图和控制器，这是第一次接触到模型。与视图和控制器不同，模型是真正与数据打交道的工具，没有模型，网站就只是一个外壳，不能发挥真实的作用，因此它是框架中最根本的部分
    // 这里把post请求传来的用户名、密码和email信息给了User的实例newUser
    var newUser = new User({
        name: name,
        password: password,
        email: req.body.email
    });
    //检查用户名是否已经存在 
    User.get(newUser.name, function (err, user) {
      if (err) {
        // 加载了flash middleware才有req.flash(), 用于flash messages
        req.flash('error', err);
        return res.redirect('/');
      }
      // User对象的get方法第二个参数是callback回调函数，这里有err和user两个参数，在user.js的66行，只有成功查询到了用户信息callback才会传入null和user两个参数，否则只会传入err一个参数，因此只有用户已存在下面的if判断才为true
      if (user) {
        req.flash('error', '用户已存在!');
        return res.redirect('/');//返回注册页
      }
      //如果不存在则新增用户
      newUser.save(function (err, user) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/');//注册失败返回注册页
        }
        req.session.user = newUser;//注册成功则将用户信息存入 session
        // Set a flash message by passing the key, followed by the value, to req.flash().
        req.flash('success', '注册成功!');
        res.redirect('/index');//注册成功后返回主页
      });
    });
  });
  // 未登录则要先登录
  app.get('/post',checkLogin);
  app.get('/post', function (req, res) {
    // console.log(req.session.user);
    // 渲染模板时一定要把模板中需要用到的变量都传进去
    res.render('post', { 
      title: '发表文章·N-blog',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
   // 未登录则要先登录
  app.post('/post',checkLogin);
  app.post('/post', function (req, res) {
    var currentUser = req.session.user,
        tags = [req.body.tag1, req.body.tag2, req.body.tag3],
    // 详见post.ejs中的表单，将表单post请求体中的title和post域存入post对象实例，
        post = new Post(currentUser.name, currentUser.head, req.body.title, tags, req.body.post);
        // 调用post原型的save方法将post对象实例存入数据库posts集合
    post.save(function(err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/index');
      }
      req.flash('success', '发布成功！');
      res.redirect('/index');//发表成功跳转到主页
    });
  });
   // 未登录则要先登录才能登出
  app.get('/logout',checkLogin);
  app.get('/logout', function (req, res) {
    req.session.user = null;
    // req.session.destroy();
    // req.flash('success', '登出成功!');
    res.redirect('/');//登出成功后跳转到注册登录页
  });
  // 文件上传
  app.get('/upload', checkLogin);
  app.get('/upload', function (req, res) {
    res.render('upload', {
      title: '上传图片·N-blog',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
  app.post('/upload', checkLogin);
  // .array(fieldname[, maxCount]) Accept an array of files, all with the name fieldname. Optionally error out if more than maxCount files are uploaded. The array of files will be stored in req.files.
  app.post('/upload', upload.array('field1', 5), function (req, res) {
    req.flash('success', '文件上传成功!');
    res.redirect('/upload');
  });
  // 存档页面路由规则
  app.get('/archive', function(req, res) {
    Post.getArchive(function(err, posts) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/index');
      }
      res.render('archive', {
        title: '归档·N-blog',
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  // 标签页面
  app.get('/tags', function(req, res) {
    Post.getTags(function(err, posts) {
      if (err) {
      req.flash('error', err); 
      return res.redirect('/index');
      }
      res.render('tags', {
        title: '标签·N-blog',
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    })
  })
  // 特定标签文章列表页面
  app.get('/tags/:tag', function (req, res) {
    Post.getTag(req.params.tag, function (err, posts) {
      if (err) {
        req.flash('error',err); 
        return res.redirect('/index');
      }
      res.render('tag', {
        title: 'TAG:' + req.params.tag + '·N-blog',
        tag: req.params.tag,
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  // 友情链接页面
  app.get('/links',function(req,res) {
    res.render('links', {
      title: '友情链接·N-blog',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
  // 检索文章功能
  app.get('/search',function(req,res) {
    Post.search(req.query.keyword, function (err, posts) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/index');
      }
      res.render('search', {
        title: "SEARCH:" + req.query.keyword + '·N-blog',
        posts: posts,
        user: req.session.user,
        keyword: req.query.keyword,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  // 处理访问用户页的请求，然后从数据库取得该用户的数据并渲染 user.ejs 模版，生成用户页面并显示给用户
  app.get('/u/:name',function(req,res) {
    var page = parseInt(req.query.p) || 1;
    // 检查用户是否存在，用户存在下面的回调函数中才有user参数
    User.get(req.params.name, function(err, user) {
      if (!user) {
        req.flash('error', '用户不存在！');
        return res.redirect('/');// 用户不存在则跳转到注册登录页
      }
      // 查询并返回该用户第page页的10篇文章
      // Post.getAll(user.name, function(err, posts) {
      Post.getFive(user.name, page, function(err, posts, total) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/index');
        }
        res.render('user', {
          title: user.name + '·N-blog',
          posts: posts,
          page: page,
          isFirstPage: (page - 1) == 0,
          isLastPage: ((page - 1) * 5 + posts.length) == total,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });          
    });
  });
  // 文章页面路由规则
  app.get('/u/:name/:day/:title', function(req,res) {
      Post.getOne(req.params.name, req.params.day, req.params.title, function(err, post) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/index');
        }
        res.render('article', {
          title: req.params.title + '·N-blog',
          post: post,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
  });
  // 添加评论，评论成功返回文章页
  app.post('/u/:name/:day/:title', function (req, res) {
    var date = new Date(),
        time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
               date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    var md5 = crypto.createHash('md5'),
        email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex'),
        head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48"; 
    var comment = {
        name: req.body.name,
        head: head,
        email: req.body.email,
        website: req.body.website,
        time: time,
        content: req.body.content
    };
    var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
    newComment.save(function (err) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('back');
      }
      req.flash('success', '留言成功!');
      res.redirect('back');
    });
  });
  // 编辑页面路由规则
  // 登录才能编辑
  app.get('/edit/:name/:day/:title', checkLogin);
  app.get('/edit/:name/:day/:title', function(req, res) {
    var currentUser = req.session.user;
    // edit函数的第一个参数是currentUser.name, 也就是当前登录的用户，因此要编辑其他用户的文章就会报错: "Cannot read property 'name' of null"
    Post.edit(currentUser.name, req.params.day, req.params.title, function(err, post) {
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      res.render('edit', {
        title: '编辑·N-blog',
        post: post,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  app.post('/edit/:name/:day/:title', checkLogin);
  app.post('/edit/:name/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function (err) {
      var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
      if (err) {
        req.flash('error', err); 
        return res.redirect(url);//出错！返回文章页
      }
      req.flash('success', '修改成功!');
      res.redirect(url);//成功！返回文章页
    });
  });
  // 实现删除文章功能
  app.get('/remove/:name/:day/:title', checkLogin);
  app.get('/remove/:name/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.remove(currentUser.name, req.params.day, req.params.title, function (err) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('back');
      }
      req.flash('success', '删除成功!');
      res.redirect('/index');
    });
  });
  // 转载路由
  /*app.get('/reprint/:name/:day/:title', checkLogin);
  app.get('/reprint/:name/:day/:title', function (req, res) {
    Post.edit(req.params.name, req.params.day, req.params.title, function (err, post) {
      if (err) {
        req.flash('error', err); 
        return res.redirect(back);
      }
      var currentUser = req.session.user,
          reprint_from = {name: post.name, day: post.time.day, title: post.title},
          reprint_to = {name: currentUser.name, head: currentUser.head};
      Post.reprint(reprint_from, reprint_to, function (err, post) {
        if (err) {
          req.flash('error', err); 
          return res.redirect('back');
        }
        req.flash('success', '转载成功!');
        var url = encodeURI('/u/' + post.name + '/' + post.time.day + '/' + post.title);
        //跳转到转载后的文章页面
        res.redirect(url);
      });
    });
  });*/
  // app.use([path,] callback [, callback...]): Mounts the specified middleware function or functions at the specified path: the middleware function is executed when the base of the requested path matches path; Since path defaults to “/”, middleware mounted without a path will be executed for every request to the app.
  app.use(function (req, res) {
    res.render("404");
  });
  // 未登录则跳转到登录页
  function checkLogin (req, res, next) {
    if (!req.session.user) {
      req.flash('error', '未登录!');
      return res.redirect('/');// 这里要加上return, 否则出现'can't set headers after they're sent'
    }
    next();
  }
  // 已登陆则退回之前页面
  function checkNotLogin (req, res, next) {
    if (req.session.user) {
      req.flash('error', '已登陆！');
      return res.redirect('back');//返回之前的页面
    }
    next();
  }
};
