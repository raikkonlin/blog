var mongodb = require('./db');

function Post(name, title, post) {
  this.name = name;
  //console.log('this.name='+ String(this.name));
  this.title = title;
  this.post = post;
}

module.exports = Post;

//储存一篇文章及其相关信息
Post.prototype.save = function(callback) {
  var date = new Date();

  //储存个种时间格式，方便以后扩展
  var time = {
    date: date,
    year: date.getFullYear(),
    month: date.getFullYear() + "-" + (date.getMonth() + 1 ),
    day: date.getFullYear() + "-" + (date.getMonth() + 1 ) + "-" + date.getDate(),
    minute: date.getFullYear() + "-" + (date.getMonth() + 1 ) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
  }

  //要存入数据库文档的属性
  var post = {
      name: this.name,
      time: time,
      title: this.title,
      post: this.post
  };
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }

    //读取 posts 集合
    db.collection('posts', function (err, collection) {
       if (err) {
        mongodb.close();
        return callback(err);
       } 

       //将文档插入posts集合
       collection.insert(post, { safe: true }, function (err) {
        mongodb.close();
        if (err) {
          return callback(err);
        }

        callback(null); //返回err为null
       });
    });
  });
};

//读取文章及相关信息
Post.get = function(name, callback) {

  console.log('Post.get.name='+ String(name));
  //打开数据库
  mongodb.open(function (err, db) {
     if (err) {
      return callback(err);
     }

     //读取posts集合
     db.collection('posts', function(err, collection) {
        if (err) {
          mongodb.close();
          return callback(err);
        }

        var query = {};
        console.log('name='+ String(name));
        if (name) {
        
          query.name = name;
          console.log('query.name='+ String(query.name));
        }

        //根据query对象查询文章
        collection.find(query).sort({ time: -1 }).toArray(function (err, docs) {
          mongodb.close();
          if (err) {
            return callback(err);
          }
          callback(null, docs); //成功，以数组形式返回查询的结果
        });
     });
  });
};

