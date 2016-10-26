/**
 * name: common
 * version: v3.0.2
 * update: ie8 opc0显示bug
 * date: 2016-08-02
 */
define(function(require, exports, module) {
	var $ = require('jquery');
	var base = require('base');

	if(base.browser.ie<8){
		alert('您的浏览器版本过低，请升级或使用chrome、Firefox等高级浏览器！');
	}
	//屏蔽ie78 console未定义错误
	if (typeof console === 'undefined') {
	    console = { log: function() {}, warn: function() {} }
	};

	//返回顶部
	$('body').on('click','.gotop',function(){$('html,body').stop(1).animate({scrollTop:'0'},300);return false});

	//textarea扩展max-length
	$('textarea[max-length]').on('change blur keyup',function(){
		var _val=$(this).val(),_max=$(this).attr('max-length');
		if(_val.length>_max){
			$(this).val(_val.substr(0,_max));
		};
	});

	//延时显示
	if(base.browser.ie<9){
		$('.opc0').css('filter','unset')
	}else{
		$('.opc0').animate({'opacity':'1'},160);
	}
	// placeholder
	$('input, textarea').placeholder();
	//按需渲染
	base.scanpush();
	//响应图片
	base.resImg();
	//ajax错误处理
	window.catchAjaxError = function(code, status) {
		switch (code) {
			case 0:
				$.box.msg('网络错误，请检查网络连接！', {
					color:'danger'
				});
				break;
			case 1:
				$.box.msg('请求异常中断！', {
					color:'danger'
				});
				break;
			case 2:
				$.box.msg('数据接收错误！', {
					color:'danger'
				});
				break;
			case 3:
				$.box.msg('数据解析错误！', {
					color:'danger'
				});
				break;
			default://4
				$.box.msg('服务端错误(code:' + status + ')', {
					color:'danger'
				});
				break;
		}
	};
	//ajax统一设置
	$.ajaxSetup({
		timeout: 15000,
		beforeSend: function(o, setting) {
			if(!setting.dataType){
				setting.dataType = 'json';
			}
		},
		error: function(o) {
			catchAjaxError(o.readyState, o.status);
		}
	});

	/*
	* 输出
	*/
	module.exports = {
		demo:function(){
			console.log('Hello '+base.getType());
		}
	};

	/*
	* 站内公用
	*/
 

	
	
	
});