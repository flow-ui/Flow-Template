/*
 * name: spin.js
 * version: v0.0.4
 * update: 防止重复初始化
 * date: 2018-06-20
 */
define('spin', function(require, exports, module) {
	"use strict";
	var $ = window.$ || require('jquery'),
		base = require('base'),
		template = '<div class="spin-wrap"><div class="spin-main"><div class="spin-text"></div></div></div>',
		def = {
			el: null,
			icon: '&#xe66e;',
			text: 'Loading',
			color: '',
			size: '',
			hook: '',
			iconRoate: true,
			timeout: 0
		},
		Spin = function(config){
			var opt = $.extend({}, def, config || {}),
				$this = $(opt.el).length ? $(opt.el) : $('body'),
				$spin = $(template),
				hide = function(){
					$spin.remove();
					$this.data('spin-init', 0);
				},
				classes = [];
			if($this.data('spin-init')){
				return true;
			}
			$this.data('spin-init', 1);
			if(opt.icon && opt.icon.split){
				var icon = $('<i class="ion">'+opt.icon+'</i>');
				if(opt.iconRoate){
					icon.addClass('spin-icon-load');
				}
				$spin.find('.spin-text').append(icon);
			}
			if(opt.text && opt.text.split){
				$spin.find('.spin-text').append('<div>'+opt.text+'</div>');
			}
			
			if(opt.timeout){
				setTimeout(hide, opt.timeout);
			}
			if(opt.color && opt.color.split){
				classes.push('text-'+$.trim(opt.color));
			}
			if(opt.size && opt.size.split){
				classes.push('spin-size-'+opt.size);
			}
			if(opt.hook && opt.hook.split){
				classes.push(opt.hook);
			}
			if ($this.css('position') !== 'absolute' && $this.css('position') !== 'fixed') {
				$this.css('position', 'relative');
			}
			$this.append($spin.addClass(classes.join(' ')).css('zIndex', base.getIndex()));
			
			return {
				hide: hide
			};
		};

	$.fn.spin = function(config){
		return Spin($.extend({
			el: this
		}, config || {}));
	};
	module.exports = Spin;
});