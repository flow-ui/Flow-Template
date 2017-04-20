/*
 * name: tab.js
 * version: v4.0.0
 * update: reBuild
 * date: 2017-04-20
 */
define('tab', function(require, exports, module) {
	"use strict";
	var $ = require('jquery'),
		etpl = require('etpl'),
		def = {
			el: null,
			conts: ".tab-cont", //内容
			data: null,
			active: undefined, //初始显示，默认第一个
			act: 'click', //触发动作
			extra: null,
			beforeChange: null, //切换前，return false将终止切换
			onChange: null, //回调方法 @param ($this,$tab_t,index) : 当前对象，标签，当前帧序号
			onReady: null //扩展方法 @param ($this,$tab_t,opts) : 当前对象，标签，配置
		},
		template = '<div class="tab-nav">\
    <!-- for: ${data} as ${tab} -->\
    <div class="tab-title<!-- if: ${tab.disabled} --> tab-disabled<!-- /if --><!-- if: ${tab.actived} --> tab-actived<!-- /if -->">${tab.title}</div>\
    <!-- /for -->\
</div>\
<div class="tab-extra"></div>\
<div class="tab-cont-wrap">\
	<!-- for: ${data} as ${tab} -->\
    <div class="tab-cont<!-- if: ${tab.actived} --> tab-actived<!-- /if -->">${tab.cont}</div>\
   	<!-- /for -->\
</div>',
		render,
		Tab = function(config) {
			var opt = $.extend({}, def, config || {}),
				$this = $(opt.el).eq(0),
				thisPosition,
				toggletab,
				tiemout,
				$tab_t,
				$tab_c,
				tabsData,
				html;
			if (!$this.length || $this.data('tab-init')) {
				return null;
			}
			if ($.isArray(opt.data) && opt.data.length) {
				tabsData = opt.data;
			} else if ($this.find(opt.conts).length) {
				tabsData = [];
				$this.find(opt.conts).each(function(i, e) {
					tabsData.push({
						title: $(e).data('tab-title') || '未命名',
						cont: $(e).html(),
						disabled: $(e).attr('disabled') !== void 0,
						actived: $(e).attr('actived') !== void 0
					});
				});
			} else {
				return console.warn('tab:tabs not exists!');
			}
			if (opt.active === void 0) {
				$.each(tabsData, function(i, d) {
					if (d.actived) {
						if(opt.active === void 0){
							opt.active = i;
						}else{
							d.actived = false;
						}
					}
				});
			} 
			if (opt.active === void 0) {
				opt.active = 0;
				tabsData[opt.active].actived = true;
			} 

			html = render({
				data: tabsData
			});
			thisPosition = $this.css('position');
			if (thisPosition !== 'absolute' && thisPosition !== 'fixed') {
				thisPosition = 'relative';
			}

			$this.data('tab-init', true).addClass('tab').css('position', thisPosition).html(html).fadeIn(160);
			if (opt.extra) {
				if (typeof opt.extra === 'function') {
					opt.extra = opt.extra();
				}
				$this.find('.tab-extra').append(opt.extra);
			}
			$tab_t = $this.find('.tab-title');
			$tab_c = $this.find('.tab-cont');

			toggletab = function(i) {
				$tab_t.eq(i).addClass('tab-actived').siblings().removeClass('tab-actived');
				$tab_c.eq(i).addClass('tab-actived').siblings().removeClass('tab-actived');
			};

			$tab_t.on(opt.act, function(event) {
				event.preventDefault();
				if ($(this).hasClass('tab-disabled') || $(this).hasClass('tab-actived')) {
					return null;
				}

				var index = $(this).index(),
					_timeout,
					_last;
				typeof(opt.beforeChange) === 'function' && opt.beforeChange($this, $tab_t, index);
				if (event.timeStamp) {
					_last = event.timeStamp;
					_timeout = setTimeout(function() {
						if (_last - event.timeStamp === 0) {
							toggletab(index);
						}
					}, opt.tiemout);
				} else {
					toggletab(index);
				}
				setTimeout(function() {
					typeof(opt.onChange) === 'function' && opt.onChange($this, $tab_t, index);
					index = _timeout = _last = null;
				}, 0);
			}).eq(opt.active).trigger(opt.act);

			//自动播放
			if (opt.auto) {
				var autoIndex = opt.active,
					auto = function() {
						autoIndex = autoIndex >= $tab_t.length - 1 ? 0 : ++autoIndex;
						$tab_t.eq(autoIndex).trigger(opt.act);
					},
					t = setInterval(auto, opt.interval);
				$tab_c.hover(function() {
					clearInterval(t);
				}, function() {
					t = setInterval(auto, opt.interval);
				});
				$this.parent().on('DOMNodeRemoved', function(e) {
					if ($(e.target).is($this)) {
						//DOM移除后释放全局变量
						t && clearInterval(t);
					}
				});
			}
			typeof opt.onReady === 'function' && opt.onReady($this, $tab_t, opt);

			return {
				active: function(index) {
					if (index === void 0) {
						return opt.active;
					} else {
						return $tab_t.eq(index).trigger(opt.act);
					}
				},
				disabled: function(index, value) {
					if ($tab_t.eq(index).length) {
						if (!!value) {
							$tab_t.eq(index).removeClass('tab-disabled');
						} else {
							$tab_t.eq(index).addClass('tab-disabled');
						}
					}
				}
			};
		};

	etpl.config({
		variableOpen: '${',
		variableClose: '}'
	});
	render = etpl.compile(template);


	$.fn.tab = function(config) {
		return Tab($.extend({
			el: this
		}, config || {}));
	};
	module.exports = Tab;
});