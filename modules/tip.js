/*
 * name: tip.js
 * version: v1.5.1
 * update: ie8兼容
 * date: 2017-07-26
 */
define('tip', function(require, exports, module) {
	'use strict';
	seajs.importStyle('.tip-box{display:none;position:absolute;z-index:99}\
		.tip-title{background:#eee;padding:5px 10px;border:1px solid #ccc;border-bottom:0;border-radius:4px 4px 0 0}\
		.tip-content{background:#fff;color:#000;line-height:1.5em;padding:8px 20px;border:1px solid #ccc}\
		.tip-withContent .tip-object{display:none}\
		.tip-withObject .tip-content{display:none}\
		.tip-noTitle .tip-content{border-radius:4px;box-shadow:rgba(0,0,0,.3)}\
		.tip-noTitle .tip-title{display:none}\
		.tip-withTitle .tip-content{border-radius:0 0 4px 4px}\
		.tip-arr,.tip-arr-cell{position:absolute;width:0;height:0;overflow:hidden;border:6px solid transparent}\
		.tip-left .tip-arr{border-left-color:#ccc;right:-12px;top:50%;margin-top:-6px}\
		.tip-left .tip-arr-cell{border-left-color:#fff;right:-11px;top:50%;margin-top:-6px}\
		.tip-right .tip-arr{border-right-color:#ccc;left:-12px;top:50%;margin-top:-6px}\
		.tip-right .tip-arr-cell{border-right-color:#fff;left:-11px;top:50%;margin-top:-6px}\
		.tip-top .tip-arr{border-top-color:#ccc;bottom:-12px;left:50%;margin-left:-6px}\
		.tip-top .tip-arr-cell{border-top-color:#fff;bottom:-11px;left:50%;margin-left:-6px}\
		.tip-bottom .tip-arr{border-bottom-color:#ccc;top:-12px;left:50%;margin-left:-6px}\
		.tip-bottom .tip-arr-cell{border-bottom-color:#fff;top:-11px;left:50%;margin-left:-6px}', module.uri);
	var $ = window.$ || require('jquery'),
		base = require('base'),
		def = {
			el: null,
			trigger: 'hover', // hover | click | custom
			place: 'bottom-center', // [posi]-[posi]-[in or null]，前两项必须，表示位置，第三项表示从内部定位，可省
			title: false, // title text | false
			hasarr: true, // 有无箭头
			offset: 0, // 提示框与元素间距，默认0
			type: 'auto', // 可选"content"，dom元素也将包裹外边框
			modal: false, // 模态，会增加一个半透明背景
			opacity: 0.5, // 背景透明度
			hook: null, // 自定义class钩子
			show: false, // 立即显示
			onshow: function($this) {},
			onclose: function() {}
		},
		tipBoxHtml = '<div class="tip-box" id="tip-box">\
	<div class="tip-title" id="tip-title"></div>\
	<div class="tip-content" id="tip-content"></div>\
	<div class="tip-object" id="tip-object"></div>\
	<i class="tip-arr" id="tip-arr"></i><i class="tip-arr-cell" id="tip-arr-cell"></i>\
</div>',
		$blank,
		$tipbox = $('#tip-box'),
		closeTip = function($this, opt) {
			$tipbox.hide().find('#tip-object').empty();
			$this.removeClass('showTip');
			if (opt.modal){
				if($blank.data('call')){
					$blank.data('call', $blank.data('call') - 1);
				}
				
				if(!$blank.data('call')){
					$blank.hide();
				}
			} 
			if (typeof(opt.onclose) === 'function') opt.onclose();
		};
	if ($("#boxBlank").length) {
		$blank = $("#boxBlank");
	}else{
		$blank = $('<div id="boxBlank" style="position:fixed;z-index:98;left:0;top:0;width:100%;height:100%;background: #000;" onselectstart="return false" />');
		$('body').append($blank);
	}
	if(!$blank.data('call')){
		$blank.hide();
	}
	if (!$tipbox.length) {
		$tipbox = $(tipBoxHtml);
		$('body').append($tipbox);
	}

	var Tip = function(tip, config) {
		var opt = $.extend({}, def, config || {});
		var $el = $(opt.el);
		$el.each(function(i, e) {
			var $this = $(e),
				place = opt.place.split('-'),
				offArr = (opt.hasarr ? parseInt($tipbox.find('#tip-arr').css('border-top-width')) : 0) + opt.offset,
				show = function() {
					var _tipLeft,
						_tipTop,
						_offX,
						_offY,
						_getLeft,
						_getTop,
						_classCatch = opt.hook ? ($.trim(opt.hook) + ' ') : '',
						_tipConent = '',
						_tipObj = '',
						_title = '',
						_mytip = tip;
					if ($this.prop('disabled') === true || $this.data('disabled') === true) {
						return console.warn('tip: $el is disabled!');
					}
					if (typeof(tip) === 'function') {
						_mytip = tip();
					}
					if (typeof(_mytip) === 'object' && !!_mytip.length || ($.parseHTML($.trim(_mytip + ''))[0].nodeType === 1)) {
						//现有dom或dom字符串
						if (opt.type == 'content') {
							_classCatch += 'tip-withContent ';
						} else {
							_classCatch += 'tip-withObject ';
						}
						if ($(_mytip).get(0).tagName.toLowerCase() === 'img') {
							//ie8图片无法撑开宽度bug
							_tipObj = $('<div />').append($(_mytip).show()).width($(_mytip).width() || 'auto');
						} else {
							_tipObj = $(_mytip).show();
						}
					} else {
						//字符串或数字
						_classCatch += 'tip-withContent ';
						_tipConent = _mytip;
					}

					if (opt.title) {
						_classCatch += 'tip-withTitle ';
						_title = opt.title;
					} else {
						_classCatch += 'tip-noTitle ';
					}

					if (opt.hasarr) {
						_classCatch += 'tip-' + place[0];
					}
					$tipbox
						.removeClass('tip-withContent tip-withObject tip-withTitle tip-noTitle tip-left tip-top tip-right tip-bottom')
						.addClass(_classCatch)
						.find('#tip-object').html(_tipObj).end()
						.find('#tip-content').text(_tipConent).end()
						.find('#tip-title').text(_title);

					if (_tipObj !== '' && opt.type === 'content') {
						$tipbox.find('#tip-object').empty().end()
							.find('#tip-content').html(_tipObj);
					}
					_offX = $tipbox.outerWidth() > $this.outerWidth() ? -Math.abs($this.outerWidth() - $tipbox.outerWidth()) / 2 : Math.abs($this.outerWidth() - $tipbox.outerWidth()) / 2;
					_offY = $tipbox.outerHeight() > $this.outerHeight() ? -Math.abs($this.outerHeight() - $tipbox.outerHeight()) / 2 : Math.abs($this.outerHeight() - $tipbox.outerHeight()) / 2;
					_getLeft = function() {
						switch (place[1]) {
							case 'center':
								_tipLeft = $this.offset().left + _offX;
								break;
							case 'left':
								_tipLeft = $this.offset().left;
								break;
							case 'right':
								_tipLeft = $this.offset().left + $this.outerWidth() - $tipbox.outerWidth();
								break;
							default:
								place[2] = place[1];
						}
					};
					_getTop = function() {
						switch (place[1]) {
							case 'center':
								_tipTop = $this.offset().top + _offY;
								break;
							case 'top':
								_tipTop = $this.offset().top;
								break;
							case 'bottom':
								_tipTop = $this.offset().top + $this.outerHeight() - $tipbox.outerHeight();
								break;
							default:
								place[2] = place[1];
						}
					};
					switch (place[0]) {
						case 'top':
							_getLeft();
							_tipTop = $this.offset().top - $tipbox.outerHeight() - offArr;
							if (place[2] === 'in') {
								_tipTop = _tipTop + $this.outerHeight();
							}
							break;
						case 'bottom':
							_getLeft();
							_tipTop = $this.offset().top + offArr;
							if (place[2] !== 'in') {
								_tipTop = _tipTop + $this.outerHeight();
							}
							break;
						case 'right':
							_getTop();
							_tipLeft = $this.offset().left + offArr;
							if (place[2] !== 'in') {
								_tipLeft = _tipLeft + $this.outerWidth();
							}
							break;
						case 'left':
							_getTop();
							_tipLeft = $this.offset().left - $tipbox.outerWidth() - offArr;

							if (place[2] === 'in') {
								_tipLeft = _tipLeft + $this.outerWidth();
							}
							break;
						default:
							//place[0]
					}
					$tipbox
						.css({
							'left': _tipLeft,
							'top': _tipTop,
							'z-index': base.getIndex()
						}).stop(true).fadeIn(160).unbind().data('from', $this);

					if (opt.modal && opt.trigger === 'click') {
						if($blank.data('call')){
							$blank.data('call', $blank.data('call') + 1);
						}else{
							$blank.data('call', 1);
						}
						$blank.show().css('opacity', opt.opacity);
					}
					if (opt.trigger === 'hover') {
						$tipbox
							.on('mouseenter', function() {
								if ($this.timer) {
									clearTimeout($this.timer);
								}
							})
							.on('mouseleave', function() {
								closeTip($this, opt);
							});
					}
					$this.addClass('showTip');
					typeof(opt.onshow) === 'function' && opt.onshow($this);
				};

			if (opt.show) {
				show();
			}
			if (!$this.data('tipinit')) {
				if (opt.trigger === 'hover') {
					$this.tipMouseenterHandle = function() {
						setTimeout(show, 32);
					};
					$this.tipMouseleaveHandle = function() {
						$this.timer = setTimeout(function() {
							closeTip($this, opt);
						}, 32);
					};
					$this
						.on('mouseenter', $this.tipMouseenterHandle)
						.on('mouseleave', $this.tipMouseleaveHandle);
				} else if (opt.trigger === 'click') {
					$this.documentHandler = function(e) {
						if ($this.get(0).contains(e.target) || $tipbox.get(0).contains(e.target)) {
							return true;
						}
						if ($tipbox.data('from') && $tipbox.data('from').is($this)) {
							closeTip($this, opt);
						}
					};
					$this.tipClickHandle = function(e) {
						if ($this.hasClass('showTip')) {
							closeTip($this, opt);
						} else {
							setTimeout(show, 0);
						}
					};
					$(window).on('click', $this.documentHandler);
					$this.on('click', $this.tipClickHandle);
				} else {
					$this.tipTriggerHandle = show;
					$this.on(opt.trigger, $this.tipTriggerHandle);
				}
				$this.data('tipinit', true);
			}
		});
		return {
			hide: function() {
				return closeTip($el, opt);
			},
			disabled: function(flag) {
				if ($el.prop('disabled') === void(0)) {
					return $el.data('disabled', !flag);
				} else {
					return $el.prop('disabled', !flag);
				}
			},
			destroy: function(){
				closeTip($el, opt);
				if (opt.trigger === 'hover') {
					$el
						.unbind('mouseenter', $el.tipMouseenterHandle)
						.unbind('mouseleave', $el.tipMouseleaveHandle);
					$el.tipMouseenterHandle = null;
					$el.tipMouseleaveHandle = null;
				}else if(opt.trigger === 'click'){
					$(window).unbind('click', $el.documentHandler);
					$el.unbind('click', $el.tipClickHandle);
					$el.documentHandler = null;
					$el.tipClickHandle = null;
				}else{
					$el.unbind(opt.trigger, $el.tipTriggerHandle);
					$el.tipTriggerHandle = null;
				}
				$el.data('tipinit', null);
				delete this.hide;
				delete this.disabled;
				delete this.destroy;
			}
		};
	};
	$.fn.tip = function(msg, config) {
		return Tip(msg, $.extend(config, {
			el: $(this)
		}));
	};

	module.exports = Tip;
});