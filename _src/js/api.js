/**
 * api
 */
define(function(require, exports, module) {
	//开发模式
	var develop = true;
	var publicApi = require('__serverRoot/public/js/api.js');
	// api管理
	var $ = require('jquery');
	var api = $.extend(publicApi || {}, {
		test: develop ? '/develop' : '/product'
	});

	module.exports = api;
});