// 仿照用户模型，文章模型命名为Post对象
// 通过require 'db.js'对数据库进行读写
var mongodb = require('./db'),
	markdown = require('markdown').markdown;
function Post (name, head, title, tags, post) {
	 this.name = name;
	 this.head = head;
	 this.title = title;
	 this.tags = tags;
	 this.post = post;
}
module.exports = Post;
// 存储一篇文章及其相关信息
Post.prototype.save = function (callback) {
	var date = new Date();
	// 存储各种时间格式，方便以后扩展
	var time = {
		date: date,
		year: date.getFullYear(),
		// getMonth从0开始
		month: date.getFullYear() + "-" + (date.getMonth() + 1),
		day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
		minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
      	date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
	}
	// 要存入数据库的文档
	var post = {
		name: this.name,
		head: this.head,
		time: time,
		title: this.title,
		tags: this.tags,
		post: this.post,
		// 我们在文档里增加了 comments 键（数组），用来存储此文章上的留言（一个个对象）。
		comments: [],
		pv: 0
	};
	// 打开数据库; openCallback(error, db), the callback format for the Db.open method, error: an error instance representing the error during the execution; db: the Db instance if the open method was successful
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取posts集合, 下面的db 就是数据库打开成功后的Db实例; collectionResultCallback(error, collection), collection: the collection instance
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// 将文档插入posts集合; insert(docs, options, callback); insetWriteOpCallback(err, result), result: the result object if the command was executed successfully
			collection.insert(post, {
				// 1、不加{safe:true}表示我们mongodb客户端向数据库抛出这句insert语句后，立刻执行回调函数，而不去关心是否真的插入成功，类似往河里扔石头，扔了就告诉妈妈，我扔石头了。
				// 2、加上{safe:true}表示mongodb数据库已经成功执行这条insert语句，并且插入完成或者报错后执行回调函数，类似往河里扔石头，看见水花起来了，或者不小心砸到河上的船了，然后告诉妈妈。
				safe: true
			}, function(err) {
				mongodb.close();
				if (err) {
					return callback(err);//失败！返回err
				}
				callback(null);//成功则返回err为null
			});
		});
	});
};
// 读取一个人的全部文章(传入参数name)或者获取所有人的文章(不传入参数，query对象为空)
// Post.getAll = function(name, callback) {
// 一次获取十篇文章
Post.getTen = function(name, page, callback) {
	// 打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取posts集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// query 为空时返回所有documents
			var query = {};
			if (name) {
				query.name = name;
			}
			// 使用count返回特定查询的文档数total; count(query, options, callback): Count number of matching documents in the db to a query; countCallback(error, result), result: the count of documents that matched the query
			collection.count(query, function(err, total) {
				// 根据query对象查询文章, query is the cursor query object; .sort({property: 1 or -1}): 按某个属性的升序或降序排列, 下面是按时间的降序，也就是最新的文章最前
				// find(query): creates a cursor for a query that can be used to iterate over results from MongoDB
				collection.find(query, {
					skip: (page - 1)*10,
					limit: 10
				}).sort({
					// 按降序排列
					time: -1
					// .toArray(callback): returns an array of documents; toArrayResultCallback(error, documents), documents: all the documents the satisfy the cursor
				}).toArray(function(err, docs) {
					mongodb.close();
					if (err) {
						return callback(err);//失败！返回err
					}
					//解析 markdown 为 html
					// forEach(iterator, callback); iteratorCallback(doc): the callback format for the forEach iterator method; doc: an emitted document for the iterator
					docs.forEach(function (doc) {
					  doc.post = markdown.toHTML(doc.post);
					});
					callback(null, docs, total);//成功！以数组形式返回查询结果
				})
			})
		})
	})
}

//获取一篇文章，根据用户名、发表日期及文章名精确获取一篇文章
Post.getOne = function(name, day, title, callback) {
	// 打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取posts集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// 根据用户名、发表日期及文章名进行查询
			// findOne(query, options, callback): fetches the first document that matches the query
			collection.findOne({
				"name": name,
				"time.day": day,
				"title": title
			}, function(err, doc) {
				if (err) {
					// 这里把mongodb.close()移到if里面就解决了can't set headers after they're already sent 的错误，为什么？？
					mongodb.close();
					return callback(err);
				}
				if (doc) {
					// 每访问一次，pv值增加1
					collection.update({
						"name": name,
            			"time.day": day,
            			"title": title
					}, {
						$inc: {"pv": 1}
					}, function(err) {
						mongodb.close();
						if (err) {
							return callback(err);
						}
					});
					// 解析Markdown为html
					doc.post = markdown.toHTML(doc.post);
					// 一开始是没有评论的，comments空
					if (doc.comments) {
						doc.comments.forEach(function(comment) {
							comment.content = markdown.toHTML(comment.content);
						});
					}			
					callback(null, doc);//返回查询的一篇文章	
				}
			});
		});
	});
};

// 返回原始发表的内容(markdown 格式)以供编辑
Post.edit = function(name, day, title, callback) {
	// 打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取posts集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// 根据用户名、发表日期及文章名进行查询
			collection.findOne({
				"name": name,
				"time.day": day,
				"title": title
			}, function(err, doc) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, doc);//返回查询的一篇文章(markdown格式)
			});
		});
	});
};

// 更新一篇文章及其相关信息
Post.update = function(name, day, title, post, callback) {
	// 打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取posts集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// 更新文章内容
			collection.update({
				"name": name,
        		"time.day": day,
        		"title": title
			}, {
				$set: {post: post}
			}, function(err) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null);
			});
		});
	});
};

// 删除一篇文章
Post.remove = function(name, day, title, callback) {
	// 打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取posts集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// 根据用户名、日期和标题查找并删除一篇文章
			collection.remove({
				"name": name,
        		"time.day": day,
       		 	"title": title
			}, {
				// write concern??
				w: 1
			}, function(err) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null);
			});
		});
	});
};

// 返回所有文章存档信息
Post.getArchive = function(callback) {
	// 打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 打开成功则读取posts集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// 返回只包含name、time和title属性的文档组成的存档数组
			collection.find({}, {
				"name": 1,
				"time": 1,
				"title": 1
			}).sort({
				time: -1
			}).toArray(function(err, docs) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, docs);
			});
		});
	});
};

// 返回所有标签
Post.getTags = function(callback) {
	mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //distinct 用来找出给定键的所有不同值
      collection.distinct("tags", function (err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
}

// 返回含有特定标签的所有文章
Post.getTag = function(tag, callback) {
	mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //查询所有 tags 数组内包含 tag 的文档
      //并返回只含有 name、time、title 组成的数组
      collection.find({
        "tags": tag
      }, {
        "name": 1,
        "time": 1,
        "title": 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
}

// 返回通过标题关键字查询的所有文章信息
Post.search = function(keyword, callback) {
	mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // "i" 是正则表达式标志flags的一种，表示不区分大小写，case-insensitive
      var pattern = new RegExp(keyword, "i");
      collection.find({
        "title": pattern
      }, {
        "name": 1,
        "time": 1,
        "title": 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
         return callback(err);
        }
        callback(null, docs);
      });
    });
  });
}