$(document).ready(function() {
	// 字符串中不包含任何数字字符时会转换为NaN，对于减法操作符，如果有一个是NaN，结果就是NaN
	/*var a="password"-"repeat";
	console.log(a);*/// NaN
	// 
	highlight();
	/*注册表单验证*/
	$('#reg').validate({
		// 校验通过后不能提交，便于本地调试，不需要和后端交互
		// debug:true,
		// 校验规则，和表单控件的name属性匹配
		rules:{
			name:{
				required:true,
				// minlength:2,
				// maxlength:10
				rangelength:[2,10],
				remote:{
					url:"/validate_reg",
					type:"get"
				}
			},
			password:{
				required:true,
				// minlength:6,
				// maxlength:16
				rangelength:[6,16]
			},
			// 这里加双引号是因为有'-'，会把字符串转换为数值然后相减
			"password-repeat":{
				required:true,
				// password 的id属性，这里是一个选择器
				equalTo: "#regpassword"	
			},
			email:{
				required:true,
				email:true
			}
		},
		// 校验提示信息
		messages:{
			name:{
				required:"请填写用户名",
				// minlength:"用户名长度需在2-10位之间",
				// maxlength:"用户名长度需在2-10位之间"
				rangelength:"用户名长度需在2-10位之间",
				remote:"用户名已存在"
			},
			password:{
				required:"请输入密码",
				// minlength:"密码长度在6位到16位之间",
				// maxlength:"密码长度在6位到16位之间"
				rangelength:"密码长度在6位到16位之间"
			},
			"password-repeat":{
				required:"请再次输入密码确认",
				equalTo: "两次输入密码不一致"	
			},
			email:{
				required:"请输入邮箱",
				email:"请输入合法的邮箱格式"
			}
		}
	});
	// 登录表单验证
	$('#login').validate({
		onfocuseout: true,
		// onkeyup好像默认是true
		onkeyup:false,
		rules:{
			name:{
				required:true,
				rangelength:[2,10],
				remote:{
					url:"/validate",
					type:"get"
				}
			},
			password:{
				required:true,
				rangelength:[6,16]
			}
		},
		messages:{
			name:{
				required:"请输入用户名",
				rangelength:"用户名长度需在2-10位之间",
				remote:"用户名不存在"
			},
			password:{
				required:"请输入密码",
				rangelength:"密码长度在6位到16位之间"
			}
		}
	})
});

// 给导航栏动态添加active类
function highlight () {
	// 关于子元素的选择，'>'只选择直接子元素，' '选择所有满足条件的子元素
	var links = $('#bs-example-navbar-collapse-1 a');
	for (var i = 0; i < links.length; i++) {
		if (window.location.href.indexOf(links[i].href)!=-1) {
			// console.log(i);
			// 这里不能写成links[i].parent，会提示parent is not a function，因为links[i]是一个dom元素，$(links[i])才是一个jQuery object
			$(links[i]).parent().addClass('active');
		}
	}
}
