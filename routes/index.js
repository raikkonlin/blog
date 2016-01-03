var crypto = require('crypto'),
    User = require('../models/user.js');

module.exports = function(app) {
  app.get('/', function (req, res, next) {
    res.render('index', { 
          title: '主页',
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
  });

  app.get('/reg', checkNotLogin); //如果已經登入，表示已經註冊，
  app.get('/reg', function (req, res, next) {
    res.render('reg', { 
          title: '注册',
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString() 
    });
  });

 
  app.post('/reg', checkNotLogin); 
  app.post('/reg', function (req, res, next) {
     var name = req.body.name,
      password = req.body.password,
      password_re = req.body['password-repeat'];
      email = req.body.email;
  //检验用户两次输入的密码是否一致
  if ( (password_re != password) ) {
    req.flash('error', '两次输入的密码不一致!'); 
    //res.locals.messages = req.flash();
    return res.redirect('/reg');//返回注册页
  }

  if(email == ''){
    return res.redirect('/reg');//返回注册页
  }
  //生成密码的 md5 值
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
  var newUser = new User({
      name: req.body.name,
      password: password,
      email: req.body.email
  });
  //检查用户名是否已经存在 
  User.get(newUser.name, function (err, user, next) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    if (user) {
      req.flash('error', '用户已存在!');
      return res.redirect('/reg');//返回注册页
    }
    //如果不存在则新增用户
    newUser.save(function (err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/reg');//注册失败返回主册页
      }
      req.session.user = newUser.name;//用户信息存入 session
      console.log('user = %s', newUser.name);
      req.flash('success', '注册成功!');
      res.redirect('/');//注册成功后返回主页
    });
  });
  });

  app.get('/login', checkNotLogin);
  app.get('/login', function (req, res, next) {
    res.render('login', { 
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString() 
    });
  });

  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res, next) {
    //生成密码的md5值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');

    //检查用户是否存在
    User.get(req.body.name, function (err, user) {
      if (!user) {
        req.flash('error','用户不存在');
        return res.redirect('/login');
      }
 
      if (user.password != password) {
        req.flash('error', '密码错误');
        return res.redirect('/login');
      }

      //用户名及密码都匹配后，将用户信息村入session
      req.session.user = user;
      req.flash('success', '登入成功');
      res.redirect('/');
    });
  });

  app.get('/post', checkLogin);
  app.get('/post', function (req, res, next) {
    res.render('post', { 
      title: '发表' ,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/post', checkLogin);
  app.post('/post', function (req, res, next) {
  });

  app.get('/logot', checkLogin);
  app.get('/logout', function (req, res, next) {
      req.session.user = null;
      req.flash('success', '登出成功');
      res.redirect('/');
  });
  
};



//增加checkNotLogin及checkLogin來限制各別訪客的訪問頁面
function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', '未登入！');
    res.redirect('/login');
  }

  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', '已登入！');
    res.redirect('back');
  }

  next();
}

/*
var express = require('express');
var router = express.Router();
*/

/* GET home page. */
/*
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
*/
