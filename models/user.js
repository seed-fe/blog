var crypto = require('crypto');
var mongodb = require('./db');
// 构造函数模式创建User对象
function User (user) {
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
};

module.exports = User;

// 存储用户信息，每一个User实例都会共享save方法，这里通过原型添加了非静态方法，只能通过原型对象或者实例访问
User.prototype.save = function (callback) {
	var md5 = crypto.createHash('md5'),
    email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
    head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
	// 要存入数据库的用户文档
	var user = {
		name: this.name,
		password: this.password,
		email: this.email,
		head: head
	};
	// 打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);//错误，直接return err信息，后面的程序就不运行了
		}
		// 读取users集合
		db.collection('users', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);//错误，直接return err信息，后面的程序就不运行了
			}
			// 将用户数据插入users集合; insert(docs, options, callback); insetWriteOpCallback(err, result), result: the result object if the command was executed successfully
			collection.insertOne(user, {
				safe: true
			}, function(err, user) {
				mongodb.close();
				if (err) {
					return callback(err);//错误，直接return err信息，后面的程序就不运行了
				}
				callback(null, user);//成功！err 为 null，并返回存储后的用户文档
			});
		});
	});
};
// 读取用户信息，这里添加的get是静态方法，不能通过实例访问，直接通过类名(这里是User)访问
User.get = function(name, callback) {
	// 打开数据库
    mongodb.open(function (err, db) {
    	if (err) {
      		return callback(err);//错误，返回 err 信息
    	}
    	//读取 users 集合
    	db.collection('users', function (err, collection) {
      		if (err) {
        		mongodb.close();
        		return callback(err);//错误，返回 err 信息
      		}
      		// 查找用户名(name键)值为name一个文档
      		// findOne(query, options, callback): Fetches the first document that matches the query
      		collection.findOne({
      			name: name
      		}, function(err, user) {
      			mongodb.close();
      			if (err) {
      				return callback(err);//失败，直接return err信息
      			}
      			// 
      			callback(null, user);//成功！返回查询的用户信息；成功了callback才传入user参数
      	});
      });
    });  	
};