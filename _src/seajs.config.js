
// 模块根路径
seajs.root = '__serverRoot' ? '/' + '__serverRoot' : ''; 

// 插件设置
seajs.set = {
	base: {
		timeout: 1.5e4
	}
};

seajs.config({
	base: seajs.root + "/modules",
	paths: {
		"js" : "/__folder/js",
		"lib": "/__folder/lib"
	},
	alias: {
		"audio"		     : "audio/audio",
		"copy"		     : "copy/ZeroClipboard",
		"flv"		     : "flv/flv",
		"hook"	 	     : "hook/hook",
		"jquery" 	     : "jquery/1/jquery",
		"validform"      : "validform/validform",
		"raty"		     : "raty/raty",
		"upload"         : "upload/upload",
		"makethumb"      : "upload/makethumb",
		"localResizeIMG" : "upload/localResizeIMG",
		"video"		     : "video/video"
	},
    localcache:{
        timeout: 2e4
    }
});
