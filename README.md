# blog
基于[nswbmw](https://github.com/nswbmw)的[N-blog](https://github.com/nswbmw/N-blog)项目仿写的多人博客系统，这个暂时是最终分支。主要改进点：
* 引入bootstrap全面改造样式，利用bootstrap的[登录模板](http://v3.bootcss.com/examples/signin/)仿照知乎的注册和登录页面，并通过[bootstrap标签页组件](http://v3.bootcss.com/components/#nav-tabs)实现注册和登录表单的切换
* 仿照了知乎的导航条样式
* 引入jQuery validation plugin完成前端表单验证，并通过设置css样式改变了表单验证错误消息的位置，放到了输入框中
* 合并了css文件，删除了多余的文件
* 简单的SEO代码优化
* 后端用node.js的compression中间件进行了gzip压缩

更详细的介绍见[wiki](https://github.com/seed-fe/blog/wiki)
项目演示地址：[N-blog bootstrap demo](https://demo-bootstrap-blog.herokuapp.com/)
