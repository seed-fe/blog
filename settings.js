// settings.js保存该博客工程的配置信息，比如数据库的连接信息
module.exports = {
	// 用于Cookie加密与数据库无关，留作后用
	cookieSecret: 'myblog',
	// 数据库名称、地址和端口号
	db: 'blog',
	host: 'localhost',
	port: 27017
};