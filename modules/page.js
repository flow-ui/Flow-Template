/*
 * name: page.js
 * version: v1.0.0
 * update: extend jquery plugin & add "set" method
 * date: 2017-03-23
 */
define('page', function(require, exports, module) {
	"use strict";
	seajs.importStyle('.pagination{display:inline-block;padding-left:0;border-radius:4px}.pagination>li{display:inline}.pagination>li>a,.pagination>li>span{position:relative;float:left;padding:8px 15px;margin-left:-1px;line-height:1.42857143;color:#ff6e0a;text-decoration:none;background-color:#fff;border:1px solid #ddd}.pagination>li:first-child>a,.pagination>li:first-child>span{margin-left:0;border-top-left-radius:4px;border-bottom-left-radius:4px}.pagination>li:last-child>a,.pagination>li:last-child>span{border-top-right-radius:4px;border-bottom-right-radius:4px}.pagination>li>a:focus,.pagination>li>a:hover,.pagination>li>span:focus,.pagination>li>span:hover{color:#ff6e0a;background-color:#eee}.pagination>.active>a,.pagination>.active>a:focus,.pagination>.active>a:hover,.pagination>.active>span,.pagination>.active>span:focus,.pagination>.active>span:hover{z-index:2;color:#fff;cursor:default;background-color:#ff6e0a;border-color:#ff6e0a}.pagination>.disabled>a,.pagination>.disabled>a:focus,.pagination>.disabled>a:hover,.pagination>.disabled>span,.pagination>.disabled>span:focus,.pagination>.disabled>span:hover{color:#777;cursor:not-allowed;background-color:#fff;border-color:#ddd}.pagination-lg>li>a,.pagination-lg>li>span{padding:10px 16px;font-size:18px;line-height:1.3333333}.pagination-lg>li:first-child>a,.pagination-lg>li:first-child>span{border-top-left-radius:6px;border-bottom-left-radius:6px}.pagination-lg>li:last-child>a,.pagination-lg>li:last-child>span{border-top-right-radius:6px;border-bottom-right-radius:6px}.pagination-sm>li>a,.pagination-sm>li>span{padding:5px 10px;font-size:12px;line-height:1.5}.pagination-sm>li:first-child>a,.pagination-sm>li:first-child>span{border-top-left-radius:3px;border-bottom-left-radius:3px}.pagination-sm>li:last-child>a,.pagination-sm>li:last-child>span{border-top-right-radius:3px;border-bottom-right-radius:3px}.pagination>li>.unable,.pagination>li>.unable:hover{color:#ccc;cursor:default;background:#fff}', module.uri);
	var $ = require('jquery'),
		etpl = require('etpl'),
		template = '<ul class="${wrapClass}">\
                        <li><a href="javascript:;"<!-- if: ${isFirst} --> class="unable"<!-- else --> data-to="${prevPage}"<!-- /if -->>上一页</a></li>\
                        <!-- for: ${pages} as ${page} -->\
                        <li<!-- if: ${page.active} --> class="active"<!-- /if -->><a href="javascript:;" data-to="${page.to}">${page.num}</a></li>\
                        <!-- /for -->\
                        <li><a href="javascript:;"<!-- if: ${isLast} --> class="unable"<!-- else --> data-to="${nextPage}"<!-- /if -->>下一页</a></li>\
                    </ul>',
		pagerender = etpl.compile(template),
		def = {
			el: null,
			current: 1,
			pageSize: 5,
			total: null,
			holder: '...',
			onClick: null,
			hook: '',
			size: '', //sm | lg
			auto: true
		},
		render = function($el, pageData) {
			var showStart,
				showEnd,
				i,
				_;
			if (pageData.total < pageData.pageSize) {
				pageData.pageSize = pageData.total;
			}
			if (pageData.total < pageData.current) {
				pageData.current = pageData.total;
			}
			if (pageData.current <= pageData.pageSize) {
				showStart = 1;
			} else if (pageData.total - pageData.current >= pageData.pageSize) {
				showStart = pageData.current;
			} else {
				showStart = pageData.total - pageData.pageSize + 1;
			}
			showEnd = showStart + pageData.pageSize - 1;
			pageData.pages = [];
			for (i = showStart; i <= showEnd; i++) {
				_ = {
					num: i,
					to: i
				};
				if (pageData.current == i) {
					_.active = true;
				}
				pageData.pages.push(_);
			}

			if (showStart > pageData.pageSize) {
				pageData.pages.splice(0, 0, {
					num: pageData.holder,
					to: pageData.current - pageData.pageSize
				});
			}
			if (pageData.total > showEnd) {
				pageData.pages.push({
					num: pageData.holder,
					to: showEnd + 1
				});
			}
			pageData.isFirst = (pageData.current == 1);
			pageData.isLast = (pageData.current == pageData.total);
			if (!pageData.isFirst) {
				pageData.prevPage = pageData.current - 1;
			}
			if (!pageData.isLast) {
				pageData.nextPage = pageData.current + 1;
			}
			$el.data('pagedata', pageData).html(pagerender(pageData));
		},
		Page = function(config) {
			var opt = $.extend({}, def, config || {}),
				pageData,
				wrapClass = ['pagination'],
				set = function(conf) {
					if (pageData && conf && $.isPlainObject(conf)) {
						pageData.current = conf.current || pageData.current;
						pageData.total = conf.total || pageData.total;
						pageData.pageSize = conf.pageSize || pageData.pageSize;
						render($(opt.el), pageData);
					}
				};
			if (!$(opt.el).length || !opt.total) {
				return console.warn('page():参数异常');
			}

			if (opt.hook && opt.hook.split) {
				wrapClass.push($.trim(opt.hook));
			}
			if ($.trim(opt.size) !== 'sm' && $.trim(opt.size) !== 'lg') {
				opt.size = '';
			}
			if (opt.size) {
				wrapClass.push('pagination-' + opt.size);
			}
			pageData = $.extend(true, {
				wrapClass: wrapClass.join(' '),
				current: null,
				total: null,
				isFirst: null,
				isLast: null,
				pages: []
			}, opt);

			render($(opt.el), pageData);

			if (!$(opt.el).data('pageinit')) {
				$(opt.el).data('pageinit', 1).on('click', 'a[data-to]', function(e) {
					e.preventDefault();
					if (!$(this).parent('.active').length && typeof(opt.onClick) === 'function') {
						opt.onClick($(this).data('to'));
					}
					if (opt.auto) {
						set({
							current: $(this).data('to')
						});
					}
				});
			}

			return {
				set: set
			};
		};

	$.fn.page = function(config) {
		return Page($.extend(config || {}, {
			el: this
		}));
	};
	module.exports = Page;
});