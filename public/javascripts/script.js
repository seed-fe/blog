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
				rangelength:[2,10],
				remote:{
					url:"/validate_reg"
				}
			},
			password:{
				required:true,
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
				rangelength:"用户名长度需在2-10位之间",
				remote:"用户名已存在"
			},
			password:{
				required:"请输入密码",
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
		},
		//自定义错误消息放到哪里
        errorPlacement : function(error, element) {
            element.next().remove();//删除显示的√图标
            // 加上×图标
            element.after('<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>');
            element.closest('.form-group').append(error);//显示错误消息提示
        },
        //给未通过验证的元素进行处理
        highlight : function(element) {
            $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
        },
        //验证通过的处理
        success : function(label) {
            var el=label.closest('.form-group').find("input");
            el.next().remove();//与errorPlacement相似，删除×图标
            el.after('<span class="glyphicon glyphicon-ok form-control-feedback" aria-hidden="true"></span>');
            label.closest('.form-group').removeClass('has-error').addClass("has-success");
            label.remove();//删掉错误消息
        }
	});
	// 登录表单验证
	$('#login').validate({
		rules:{
			name:{
				required:true,
				rangelength:[2,10],
				remote:{
					url:"/validate"
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
		},
		//自定义错误消息放到哪里
        errorPlacement : function(error, element) {
            element.next().remove();//删除显示的√图标
            // 加上×图标
            element.after('<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>');
            element.closest('.form-group').append(error);//显示错误消息提示
        },
        //给未通过验证的元素进行处理
        highlight : function(element) {
            $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
        },
        //验证通过的处理
        success : function(label) {
            var el=label.closest('.form-group').find("input");
            el.next().remove();//与errorPlacement相似，删除×图标
            el.after('<span class="glyphicon glyphicon-ok form-control-feedback" aria-hidden="true"></span>');
            label.closest('.form-group').removeClass('has-error').addClass("has-success");
            label.remove();//删掉错误消息
        }
	})
});

// 给导航栏动态添加active类
function highlight () {
	// 关于子元素的选择，'>'只选择直接子元素，' '选择所有满足条件的子元素
	var links = $('#bs-example-navbar-collapse-1 a');
	for (var i = 0; i < links.length; i++) {
		if (window.location.href.indexOf(links[i].href)!=-1) {
			// 这里不能写成links[i].parent，会提示parent is not a function，因为links[i]是一个dom元素，$(links[i])才是一个jQuery object
			$(links[i]).parent().addClass('active');
		}
	}
}
