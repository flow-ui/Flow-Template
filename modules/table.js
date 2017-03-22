/*
 * name: table.js
 * version: v0.0.1
 * update: build
 * date: 2017-03-13
 */
define('table', function(require, exports, module) {
	"use strict";
	seajs.importStyle('', module.uri);
	require('dropdown');
	var $ = require('jquery'),
		base = require('base'),
		def = {
			el: null,
			data: null,
			column: null, // title,key,render,width,align,hook,fixed,ellipsis,sortMethod,filterMethod,
			striped: false,
			bordered: false,
			condensed: false,
			hover: true,
			width: 0,
			height: 0,
			index: true,
			multi: false,
			noDataText: "暂无数据",
			noFilterText: '暂无筛选结果',
			highlight: false,
			onSelect: null // index, row, [array]
		},
		Table = function(config) {
			var opt = $.extend({}, def, config || {});
			if (!$(opt.el).length) {
				return null;
			}
			if (!$.isArray(opt.data) || !opt.data.length || !$.isArray(opt.column) || !opt.column.length) {
				return console.warn('table: data or column配置有误！');
			}
			if (isNaN(parseFloat(opt.width)) || !parseFloat(opt.width)) {
				opt.width = $(opt.el).width();
			}
			//加索引
			if (opt.index) {
				opt.column.unshift({
					type: 'index',
					width: 60,
					align: 'center'
				});
			}
			//加复选框
			if (opt.multi) {
				opt.column.unshift({
					type: 'selection',
					width: 60,
					align: 'center'
				});
			}
			var tData = [].concat(opt.data);
			//为索引生成唯一key
			var indexKey = 'index-' + base.getUUID();
			//生成表格主体
			var getBody = function(tData, opt) {
				var tbodyCont = '';
				$.each(tData, function(rowIndex, data) {
					var thisdata = '<tr data-index="' + rowIndex + '">';
					if (data.split) {
						thisdata += ('<td>' + data + '</td>');
					} else if ($.isPlainObject(data)) {
						data[indexKey] = parseInt(rowIndex);
						$.each(opt.column, function(i, col) {
							var bodyColClass = col.thisColClass;
							if (col.hook && col.hook.split) {
								bodyColClass.push(col.hook);
							}
							var thisColTag = '<td' + (' class="' + bodyColClass.join(' ') + '">');
							switch (col.type) {
								case 'index':
									thisdata += (thisColTag + (parseInt(rowIndex) + 1) + '</td>');
									break;
								case 'selection':
									thisdata += (thisColTag + '<label class="checkbox checkbox-inline"><input type="checkbox" class="table-choose-input"></label></td>');
									break;
								default:
									var thisTagCont;
									if (typeof col.render === 'function') {
										var renderTagId = 'renderTagId-' + base.getUUID();
										opt.renderCollection.push({
											id: renderTagId,
											el: col.render(data[col.key], data, rowIndex)
										});
										thisTagCont = '<div id="' + renderTagId + '"></div>';
									} else {
										thisTagCont = (col.ellipsis ? '<div class="el" style="width:' + (col.thisColWidth - 36) + 'px">' + data[col.key] + '</div>' : ((data[col.key])===null || data[col.key]===void(0)) ? opt.noDataText : data[col.key]);
									}

									thisdata += (thisColTag + thisTagCont + '</td>');
							}
						});
					}
					thisdata += '</tr>';
					tbodyCont += thisdata;
				});
				return tbodyCont;
			};
			var render = function($this, tData, opt, part) {
				var colgroup = '<colgroup>';
				var theadCont = '<thead><tr>';
				var totalWidth = opt.width;
				var tableWidth = 0;
				var otherParts = opt.column.length;
				//收集注入元素
				opt.renderCollection = [];
				$.each(opt.column, function(i, col) {
					col.width = isNaN(parseFloat(col.width)) ? 0 : parseFloat(col.width);
					if (col.width) {
						totalWidth -= col.width;
						otherParts -= 1;
					}
				});

				$.each(opt.column, function(i, col) {
					var thisColWidth = col.width;
					var thisColClass = [];
					if (!thisColWidth) {
						thisColWidth = Math.max(Math.floor(totalWidth / otherParts), 50);
					}
					tableWidth += thisColWidth;
					switch (col.align) {
						case 'center':
							thisColClass.push('tc');
							break;
						case 'right':
							thisColClass.push('tr');
							break;
						default:
							thisColClass.push('tl');
					}
					col.thisColClass = thisColClass;
					col.thisColWidth = thisColWidth;
					var thisColTag = '<th' + (' class="' + thisColClass.join(' ') + '">');
					colgroup += ('<col width="' + thisColWidth + '"></col>');
					switch (col.type) {
						case 'index':
							theadCont += (thisColTag + '#</th>');
							break;
						case 'selection':
							theadCont += (thisColTag + '<label class="checkbox checkbox-inline"><input type="checkbox" class="table-choose-all"></label></th>');
							break;
						default:
							var thisTagCont;

							if (typeof col.sortMethod === 'function' || $.isArray(col.filterMethod)) {
								var renderTagId = 'sortTagId-' + base.getUUID();
								var $el = $('<div></div>');
								//排序
								if (typeof col.sortMethod === 'function') {
									$el.append($('<span class="table-sort"><i class="ion table-sort-up">&#xe618;</i><i class="ion table-sort-down">&#xe612;</i></span>').on('click', '.ion', function() {
										var sortKey = [],
											sortData = [];
										if ($(this).hasClass('on')) {
											$(this).removeClass('on');
											sortData = tData;
										} else {
											$(this).addClass('on').siblings('.on').removeClass('on');
											$.each(tData, function(i, e) {
												sortKey.push(e[col.key]);
											});
											if ($(this).hasClass('table-sort-up')) {
												sortKey.sort(function(a, b) {
													return col.sortMethod(a, b, 'asc');
												});
											} else if ($(this).hasClass('table-sort-down')) {
												sortKey.sort(function(a, b) {
													return col.sortMethod(a, b, 'desc');
												});
											}
											$.each(sortKey, function(i, k) {
												$.each(tData, function(i, obj) {
													if (obj[col.key] === k) {
														sortData.push(obj);
													}
												});
											});
										}
										return render($this, sortData, opt, 'body');
									}));
								}
								//筛选
								if ($.isArray(col.filterMethod)) {
									var dropData = [{
										item: '全部'
									}];
									$.each(col.filterMethod, function(i, filterMethod) {
										if (filterMethod.label && filterMethod.label.split) {
											dropData.push({
												item: filterMethod.label,
												methodIndex: i
											});
										}
									});
									$el.append($('<span class="table-filter"><i class="ion">&#xe64d;</i></span>').dropdown({
										items: dropData,
										trigger: 'click',
										onclick: function(item) {
											if (item.methodIndex === void(0)) {
												tData = opt.data;
											} else if (typeof col.filterMethod[item.methodIndex].filter === 'function') {
												tData = $.map(opt.data, function(val, i) {
													if (col.filterMethod[item.methodIndex].filter(val[col.key])) {
														return val;
													}
												});
											}
											if (!tData.length) {
												tData = [opt.noFilterText];
											}
											return render($this, tData, opt, 'body');
										}
									}));
								}
								opt.renderCollection.push({
									id: renderTagId,
									el: $el.children('span').unwrap()
								});
								thisTagCont = (col.title || "#") + '<textarea style="display:none" id="' + renderTagId + '"></textarea>';
							} else {
								thisTagCont = (col.title || "#");
							}
							theadCont += (thisColTag + thisTagCont + '</th>');
					}
				});
				var tbodyCont = getBody(tData, opt);
				if (part === 'body') {
					return $this.find('.table-body table.table tbody').html(inject(tbodyCont, opt));
				}
				var html = '<div class="table-wrapper' + (tableWidth > totalWidth ? ' table-scroll-x' : '') + '" style="width:' + opt.width + 'px">';
				var thead = '<div class="table-header" style="width:' + tableWidth + 'px"><table class="table">';
				theadCont += '</tr></thead>';
				colgroup += '</colgroup>';
				thead += colgroup;
				thead += theadCont;
				thead += '</table></div>';
				html += thead;
				var tbody = '<div class="table-body" style="width:' + tableWidth + 'px"><table class="table' + (opt.hover ? ' table-hover' : '') + (opt.condensed ? ' table-condensed' : '') + (opt.bordered ? ' table-bordered' : '') + (opt.striped ? ' table-striped' : '') + '" style="width:' + tableWidth + 'px">';

				tbody += colgroup;
				tbody += ('<tbody>' + getBody(tData, opt) + '</tbody>');
				tbody += '</table></div>';
				html += tbody;
				html += '</div>';
				return $this.html(inject(html, opt, true));
			};
			var inject = function(html, opt, isInit) {
				var tableObj = $(html);
				if (isInit && opt.height && !isNaN(parseFloat(opt.height))) {
					var trueHeight;
					tableObj.height(opt.height);
					trueHeight = tableObj.height();
					tableObj.find('.table-body').height(trueHeight - 43);
				}
				$.each(opt.renderCollection, function(i, renderObj) {
					tableObj.find('#' + renderObj.id).parent().append(renderObj.el).end().remove();
				});
				delete opt.renderCollection;
				return tableObj;
			};
			var multiCollection = [];
			var syncStatus = function(tableObj) {
				tableObj.find('.table-body tr').each(function(i, tr) {
					var isIn = false;
					$.each(multiCollection, function(i, choosen) {
						if ($(tr).data('index') === choosen[indexKey]) {
							isIn = true;
							return false;
						}
					});
					$(tr).find('.table-choose-input').prop('checked', isIn);
					if (opt.highlight) {
						if (isIn) {
							$(tr).addClass('table-highlight');
						} else {
							$(tr).removeClass('table-highlight');
						}
					}
				});
				if (opt.multi) {
					tableObj.find('.table-header .table-choose-all').prop('checked', multiCollection.length === tData.length);
				}
			};
			var generate = function($this, tData, opt, part) {
				render($this, tData, opt, part);
				if ($this.data('table-events')) return null;
				$this.data('table-events', true);
				//绑定事件
				if (opt.multi) {
					$this.on('click', '.table-body tr', function(e) {
						var index = $(this).index(),
							row = parseInt($(this).data('index'));
						if ($(e.target).parents('td').find('.table-choose-input').length) {
							var isSelect = $(e.target).parents('td').find('.table-choose-input').prop('checked');
							if (isSelect) {
								multiCollection.push(tData[index]);
							} else {
								$.each(multiCollection, function(i, c) {
									if (c[indexKey] === row) {
										multiCollection.splice(i, 1);
										return false;
									}
								});
							}
							if (typeof opt.onSelect === 'function') {
								opt.onSelect($(this).data('index'), tData[index], multiCollection);
							}
						}
						syncStatus($this);
					}).on('click', '.table-choose-all', function() {
						if (multiCollection.length === tData.length) {
							multiCollection = [];
						} else {
							multiCollection = [].concat(tData);
						}
						if (typeof opt.onSelect === 'function') {
							opt.onSelect('all', null, multiCollection);
						}
						syncStatus($this);
					});
				} else {
					$this.on('click', '.table-body tr', function(e) {
						var index = $(this).index(),
							row = parseInt($(this).data('index'));
						if (multiCollection.length && (row === multiCollection[0][indexKey])) {
							multiCollection = [];
						} else {
							multiCollection = [tData[row]];
							if (typeof opt.onSelect === 'function') {
								opt.onSelect($(this).data('index'), tData[row], multiCollection);
							}
						}
						syncStatus($this);
					});
				}
			};
			$(opt.el).each(function(i, e) {
				generate($(e), tData, opt);
			});
			return {
				loadData: function(data){
					//
				}
			};
		};

	$.fn.table = function(config) {
		return Table($.extend(config || {}, {
			el: this
		}));
	};
	module.exports = Table;
});