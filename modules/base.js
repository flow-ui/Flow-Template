/*
 * name: base
 * version: 4.1.0
 * update: 增加storage模块
 * date: 2018-04-16
 */
define('base', function(require, exports, module) {
	'use strict';
	var $ = window.$ || require('jquery');

	var getUID = function() {
		var maxId = 65536;
		var uid = 0;
		return function() {
			uid = (uid + 1) % maxId;
			return uid;
		};
	}();

	var getUUID = function(len) {
		len = len || 6;
		len = parseInt(len, 10);
		len = isNaN(len) ? 6 : len;
		var seed = "0123456789abcdefghijklmnopqrstubwxyzABCEDFGHIJKLMNOPQRSTUVWXYZ";
		var seedLen = seed.length - 1;
		var uuid = "";
		while (len--) {
			uuid += seed[Math.round(Math.random() * seedLen)];
		}
		return uuid;
	};

	var getIndex = function() {
		return 99 + getUID();
	};

	var deepcopy = function(source) {
		var sourceCopy = source instanceof Array ? [] : {};
		for (var item in source) {
			sourceCopy[item] = typeof source[item] === 'object' ? deepcopy(source[item]) : source[item];
		}
		return sourceCopy;
	};
	
	/*
	 * cookie
	 */
	var cookie = function(name, value, options) {
		if (typeof value != 'undefined') { // name and value given, set cookie
			options = options || {};
			if (value === null) {
				value = '';
				options.expires = -1;
			}
			var expires = '';
			if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
				var date;
				if (typeof options.expires == 'number') {
					date = new Date();
					date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
				} else {
					date = options.expires;
				}
				expires = '; expires=' + date.toUTCString();
				// use expires attribute, max-age is not supported by IE
			}
			var path = options.path ? '; path=' + options.path : '';
			var domain = options.domain ? '; domain=' + options.domain : '';
			var secure = options.secure ? '; secure' : '';
			document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
		} else { // only name given, get cookie
			var cookieValue = null;
			if (document.cookie && document.cookie !== '') {
				var cookies = document.cookie.split(';');
				for (var i = 0, n = cookies.length; i < n; i++) {
					var cookie = $.trim(cookies[i]);
					// Does this cookie string begin with the name we want?
					if (cookie.substring(0, name.length + 1) == (name + '=')) {
						cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
						break;
					}
				}
			}
			return cookieValue;
		}
	};
	/*
	* storage
	*/
	function remove(key) {
		if (key && key.split) {
			return localStorage.removeItem(key)
		}
	};

	function leaveSpace() {
		var space = 1024 * 1024 * 5 - unescape(encodeURIComponent(JSON.stringify(localStorage))).length;
		return space
	};

	function val(key, value) {
		if (value === void(0)) {
			var lsVal = localStorage.getItem(key);
			if(lsVal && lsVal.indexOf('autostringify-') === 0 ){
				return JSON.parse(lsVal.split('autostringify-')[1]);
			}else{
				return lsVal;
			}
		}else {
			if ($.isPlainObject(value) || $.isArray(value)) {
				value = 'autostringify-' + JSON.stringify(value);
			};
			return localStorage.setItem(key, value);
		}
	};

	function clear(safeStorage){
		if(safeStorage && Array.isArray(safeStorage)){
		    //白名单
		    var lskey;
	    	for (lskey in window.localStorage){
	    		if(safeStorage.indexOf(lskey)===-1){
	    			localStorage.removeItem(lskey);
	    		}
	    	}
		}else{
			localStorage.clear();
		}
	}

	var storage = {
		clear: clear,
		leaveSpace: leaveSpace,
		remove: remove,
		val: val
	}

	/*
	 * 函数节流
	 * @method: 函数体; @delay: 过滤执行间隔; @duration: 至少执行一次的间隔
	 */
	var _throttle = function throttle(method, delay, duration) {
		var timer = null,
			begin = new Date();
		delay = delay ? delay : 64;
		duration = duration ? duration : 640;
		return function() {
			var context = this,
				args = arguments,
				current = new Date();
			clearTimeout(timer);
			if (current - begin >= duration) {
				method.apply(context, args);
				begin = current;
			} else {
				timer = setTimeout(function() {
					method.apply(context, args);
				}, delay);
			}
		};
	};

	/*
	 * 获取url参数
	 */
	var _getUrlParam = function(name, url) {
		var urlParamReg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var s = (url ? url : window.location.href).split('?')[1] || '';
		var r = s.match(urlParamReg);
		if (r !== null) {
			return decodeURI(r[2]);
		}
		return null;
	};
	/*
	 * 设置url参数
	 */
	var _setUrlParam = function(name, val, url) {
		var urlParamReg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var s = url ? (url.split('?')[1] ? url.split('?')[1] : '') : window.location.search.substr(1);
		if (s) {
			var result = url || window.location.href;
			var r = s.match(urlParamReg);
			if (r !== null) {
				var ori = r[0].replace(/&/g, '');
				return result.replace(ori, name + '=' + val);
			} else {
				return result + '&' + name + '=' + val;
			}
		} else {
			return url + '?' + name + '=' + val;
		}
	};

	/*
	 * 浏览器
	 */
	var userAgent = navigator.userAgent.toLowerCase(),
		_browser = {};
	_browser.isMobile = !!userAgent.match(/(iphone|ipod|ipad|android|blackberry|bb10|windows phone|tizen|bada)/);
	_browser.ie = /msie\s*(\d+)\./.exec(userAgent) ? /msie\s*(\d+)\./.exec(userAgent)[1] : Infinity;
	_browser.platform = navigator.platform;
	_browser.agent = userAgent;
	_browser.support3d = (function() {
		var el = document.createElement('p'),
			has3d,
			transforms = {
				'webkitTransform': '-webkit-transform',
				'OTransform': '-o-transform',
				'msTransform': '-ms-transform',
				'MozTransform': '-moz-transform',
				'transform': 'transform'
			};
		// Add it to the body to get the computed style.
		document.body.insertBefore(el, null);
		for (var t in transforms) {
			if (el.style[t] !== undefined) {
				el.style[t] = "translate3d(1px,1px,1px)";
				has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
			}
		}
		document.body.removeChild(el);
		return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
	})();

	/*
	 * 内部方法
	 */
	// 兼容css3位移
	!$.fn._css && ($.fn._css = function(LeftOrTop, number) {
		var hasTrans = (LeftOrTop == 'left' || LeftOrTop == 'top') ? true : false,
			canTrans = _browser.support3d,
			theTrans = LeftOrTop == 'left' ? 'translateX' : 'translateY',
			matrixPosi = hasTrans ? (LeftOrTop == 'left' ? 4 : 5) : null;
		if (number != void(0)) {
			//赋值
			if (canTrans && hasTrans) {
				number = parseFloat(number) + 'px';
				$(this).get(0).style.transform = ('translateZ(0) ' + theTrans + '(' + number + ')');
			} else {
				$(this).css(LeftOrTop, number);
			}
			return $(this);
		} else {
			//取值
			if (canTrans && hasTrans && $(this).get(0).style.transform !== 'none') {
				var transData = $(this).get(0).style.transform.match(/\((.*\,?\s?){6}\)$/)[0].substr(1).split(',');
				return parseFloat(transData[matrixPosi]);
			} else {
				return $(this).css(LeftOrTop);
			}
		}
	});
	// 加载指定属性的图片
	!$.fn._loadimg && ($.fn._loadimg = function(imgattr) {
		var $this = $(this),
			lazyImg;
		if (!imgattr) {
			return $this;
		}
		if ($this.attr(imgattr)) {
			lazyImg = $this;
		} else if ($(this).find('img[' + imgattr + ']').length) {
			lazyImg = $(this).find('img[' + imgattr + ']');
		} else {
			return $this;
		}
		if (lazyImg.length) {
			var _theSrc;
			lazyImg.each(function(i, e) {
				_theSrc = $.trim($(e).attr(imgattr));
				if (_theSrc) {
					if (e.tagName.toLowerCase() === 'img') {
						$(e).attr('src', _theSrc).removeAttr(imgattr).addClass('loaded');
					} else {
						$(e).css("background-image", "url(" + _theSrc + ")").attr(imgattr, 'loaded').addClass('loaded');
					}
				}
			});
			_theSrc = null;
		}
		return $(this);
	});
	//getScript
	var _getScript = function(road, callback, option) {
		if (road && road.split || ($.isArray(road) && road.length)) {
			var def = {
					css: false,
					beforeLoad: null,
					rely: false
				},
				opt = $.extend({}, def, $.isPlainObject(callback) ? callback : option || {}),
				cssLoaded = false,
				loadScript = function(road, hold) {
					/*
					@road:请求url
					@hold:是否阻断默认回调，为function将阻断默认回调并执行自身
					*/
					var file = seajs.resolve(road),
						headNode = document.getElementsByTagName('head')[0],
						script = document.createElement("script"),
						scriptError = function(xhr, settings, exception) {
							headNode.removeChild(script);
							script = document.createElement("script");
							console.warn(settings.url + '加载失败，正在重试~');
							load(function() {
								console.warn(settings.url + '加载失败了!');
							});
						},
						scriptOnload = function(data, status) {
							if (!data) {
								data = status = null;
							}
							if (hold) {
								if (typeof(hold) === 'function') {
									hold();
								}
							} else if (typeof(callback) === 'function') {
								setTimeout(callback, 0);
							}
						},
						load = function(errorCallback) {
							errorCallback = errorCallback || scriptError;
							if (typeof opt.beforeLoad === 'function') {
								opt.beforeLoad();
							}
							script.type = "text/javascript";
							if (script.addEventListener) {
								script.addEventListener("load", scriptOnload, false);
							} else if (script.readyState) {
								script.onreadystatechange = function() {
									if (script.readyState == "loaded" || script.readyState == "complete") {
										script.onreadystatechange = null;
										scriptOnload();
									}
								};
							} else {
								script.onload = scriptOnload;
							}
							script.onerror = errorCallback;
							script.src = file;
							headNode.appendChild(script);
						};
					if (opt.css && !cssLoaded) {
						var cssfile = '',
							appendCss = function(href) {
								href = seajs.resolve(href).replace(/\.css\.js$/, ".css").replace(/\.js$/, ".css");
								var _css = document.createElement('link');
								_css.rel = "stylesheet";
								_css.onerror = function(e) {
									headNode.removeChild(_css);
									_css = null;
									return null;
								};
								_css.href = href;
								headNode.appendChild(_css);
							};
						if (opt.css.split) {
							cssfile = opt.css;
							appendCss(cssfile);
							cssLoaded = true;
						} else if ($.isArray(opt.css)) {
							$.each(opt.css, function(i, href) {
								appendCss(href);
							});
							cssLoaded = true;
						} else {
							appendCss(file);
						}
					}
					load();
				};
			if (road.split) {
				loadScript(road);
			} else if ($.isArray(road)) {
				var scriptsLength = road.length,
					scriptsCount = 0;
				if (opt.rely) {
					//线性依赖
					var getNext = function(isLast) {
						var hold;
						if (!isLast) {
							hold = function() {
								scriptsCount++;
								getNext(scriptsCount >= (scriptsLength - 1));
							};
						}
						loadScript(road[scriptsCount], hold);
					};
					getNext();
				} else {
					//同时发起
					var scriptRoad;
					while (scriptsCount < scriptsLength) {
						scriptRoad = road[scriptsCount];
						scriptsCount++;
						loadScript(scriptRoad, scriptsLength > scriptsCount);
					}
				}
			}
		} else {
			return console.warn('getScript()参数错误！');
		}
	};
	//ajaxCombo
	var _ajaxCombo = function(option) {
		var def = {
				comboUrl: "/test/combo.php",
				extendData: {},
				comboDataKey: "paramArray",
				duration: 16,
				everytimeout: 2000
			},
			ajaxComboObject,
			ajaxComboIndex,
			ajaxComboTimer;
		_ajaxCombo.prototype.option = $.extend(def, option || {});
		if (_ajaxCombo.prototype.runed) {
			return null;
		}
		_ajaxCombo.prototype.runed = true;
		$(document).bind("ajaxSend", function(event, request, settings) {
			var opt = _ajaxCombo.prototype.option,
				newAjax;
			if (!settings.combo) {
				return null;
			}
			request.abort();
			newAjax = {
				async: settings.async,
				contentType: settings.contentType,
				crossDomain: settings.crossDomain,
				data: settings.data,
				dataType: settings.dataType,
				type: settings.type,
				url: settings.url,
				success: settings.success
			};
			//归零
			if (ajaxComboTimer) {
				clearTimeout(ajaxComboTimer);
			} else {
				ajaxComboIndex = 0;
				ajaxComboObject = {};
			}
			(function() {
				//get请求特殊处理
				if (settings.type === 'GET') {
					newAjax.data = newAjax.url.split('?')[1];
					newAjax.url = newAjax.url.split('?')[0];
				}
				//data转obj
				var dataArray = newAjax.data.split('&'),
					dataObj = {};
				$.each(dataArray, function(i, e) {
					var _key = dataArray[i].split('=')[0],
						_val = dataArray[i].split('=')[1];
					dataObj[_key] = _val;
				});
				//并入ajaxComboObject
				newAjax.data = dataObj;
				ajaxComboObject['combo' + (++ajaxComboIndex)] = newAjax;
			})();
			//合并发送
			ajaxComboTimer = setTimeout(function() {
				//剔除回调函数
				var ajaxComboData = $.extend(true, {}, opt.extendData),
					localCatch = $.extend(true, {}, ajaxComboObject);
				ajaxComboData[opt.comboDataKey] = $.extend(true, {}, localCatch);
				$.each(localCatch, function(key, val) {
					if (localCatch[key].success) {
						delete ajaxComboData[opt.comboDataKey][key].success;
					}
				});
				ajaxComboTimer = null;
				$.ajax({
					type: 'post',
					global: false,
					timeout: ajaxComboIndex * opt.everytimeout,
					url: opt.comboUrl,
					data: ajaxComboData,
					dataType: 'json',
					success: function(data) {
						if (data && typeof(data) === 'object') {
							//分发回调
							$.each(localCatch, function(key, val) {
								if (localCatch[key].success) {
									if (data[key] && data[key].data) {
										localCatch[key].success(data[key].data);
									} else {
										console.log("ajaxCombo:" + localCatch[key].url + "数据有误");
									}
								}
							});
							localCatch = null;
						} else {
							console.log('ajaxCombo:数据错误');
						}
					},
					error: function(xhr) {
						//分发原请求
						$.each(localCatch, function(key, val) {
							$.ajax(localCatch[key]);
						});
						localCatch = null;
					}
				});
			}, opt.duration);
			return null;
		});
	};
	var _getStyle = function(elem, attr) {
		if (elem.currentStyle) {
			return elem.currentStyle[attr];
		} else if (document.defaultView && document.defaultView.getComputedStyle) {
			attr = attr.replace(/([A-Z])/g, '-$1').toLowerCase();
			return document.defaultView.getComputedStyle(elem, null).getPropertyValue(attr);
		} else {
			return null;
		}
	};
	/*
	 * 输出
	 */
	module.exports = {
		getUID: getUID,
		getUUID: getUUID,
		getIndex: getIndex,
		deepcopy: deepcopy,
		browser: _browser,
		getStyle: _getStyle,
		throttle: _throttle,
		url: {
			get: _getUrlParam,
			set: _setUrlParam
		},
		cookie: cookie,
		storage: storage,
		getScript: _getScript,
		ajaxCombo: _ajaxCombo
	};
});