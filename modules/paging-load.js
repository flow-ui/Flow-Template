/*
 * name: paging-load.js
 * version: v0.0.1
 * update: build
 * date: 2017-03-27
 */
define('paging-load', function(require, exports, module) {
	"use strict";
	var $ = require('jquery'),
		def = {
			url: null,
			size: 6,
			data: {},
			reload: false,
			success: null,
			nomore: null,
			error: null
		},
		pagingLoad = function(option) {
			var opt = $.extend({}, def, option || {}),
				sendParam = $.extend(true, {}, opt.data),
				process = pagingLoad.prototype.process,
				trueUrl,
				getPage,
				i = 0,
				n = process.length;
			if (!opt.url) {
				return console.warn('toload()参数缺少url');
			}
			trueUrl = opt.url + '?' + $.param(opt.data);
			for (; i < n; ++i) {
				if (process[i].url == trueUrl) {
					if (opt.reload) {
						getPage = null;
						process.splice(i, 1);
					} else {
						getPage = process[i].getPage;
					}
					break;
				}
			}
			if (!getPage) {
				var newProcess = {};
				getPage = pagingLoad.prototype.newGetPage();
				newProcess.url = trueUrl;
				newProcess.getPage = getPage;
				process.push(newProcess);
				pagingLoad.prototype.process = process;
			}
			trueUrl = null;
			process = null;
			sendParam.page_index = getPage();
			sendParam.page_size = opt.size;
			$.ajax({
				type: 'get',
				url: opt.url,
				data: sendParam,
				dataType: opt.dataType || 'json',
				success: function(res) {
					if ($.isPlainObject(res) && res.status === 'Y' || (res && opt.dataType != 'json')) {
						typeof(opt.success) === 'function' && opt.success(res);
						if ($.isPlainObject(res) && res.data && res.count) {
							var listLength = res.data.split ? JSON.parse(res.data).length : res.data.length;
							if (listLength + sendParam.page_size * (sendParam.page_index - 1) >= parseInt(res.count)) {
								typeof(opt.nomore) === 'function' && opt.nomore();
							}
						}
					} else {
						console.log('数据异常页码回退');
						getPage(true);
						typeof(opt.success) === 'function' && opt.success(res);
					}
				}
			});
		};
	pagingLoad.prototype.newGetPage = function() {
		var loadPage = 0,
			func = function(pullback) {
				if (pullback) {
					return --loadPage;
				}
				return ++loadPage;
			};
		return func;
	};
	pagingLoad.prototype.process = [];

	module.exports = pagingLoad;
});