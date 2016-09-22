$(document).ready(function() {
	// 关于子元素的选择，'>'只选择直接子元素，' '选择所有满足条件的子元素
	var links = $('#bs-example-navbar-collapse-1 a');
	for (var i = 0; i < links.length; i++) {
		if (window.location.href.indexOf(links[i].href)!=-1) {
			console.log(i);
			// 这里不能写成links[i].parent，会提示parent is not a function，因为links[i]是一个dom元素，$(links[i])才是一个jQuery object
			$(links[i]).parent().addClass('active');
		}
	}
});

/*function addLoadEvent(func) {
	var oldonload=window.onload;
	if (typeof window.onload!='function') {
		window.onload=func;
	}else {
		window.onload=function () {
			oldonload();
			func();
		};
	}
}

function highlightPage () {
	if (!document.getElementsByTagName) {
		return false;
	}
	if (!document.getElementById) {
		return false;
	}
	var nav = document.getElementById('bs-example-navbar-collapse-1');
	var navBar = nav.getElementsByTagName('li');
	if (navBar.length === 0) {
		return false;
	}
	for (var i = 0; i < navBar.length; i++) {
		var link = navBar[i].getElementsByTagName('a')[0];
		var linkUrl = link.getAttribute('href');
		if (window.location.href.indexOf(linkUrl)!=-1) {
			this.addClass('active');
		}
	}
}

addLoadEvent(highlightPage);*/