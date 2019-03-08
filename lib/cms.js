(function() {
	if(typeof cms == "undefined") {
		cms = {};
	}
	var fs=require("original-fs");
	var path=require("path");
	var crypto = require('crypto');
	var os = require("os");
	var fileCheck = require("fs");

	cms.client_version="1.2.0.1"   //版本号

	// 定义一些常量
	cms.c_moduleid_oms = 30;
	cms.c_moduleid_sds = 50;
	cms.c_moduleid_ogs = 80;
	cms.c_moduleid_fs = 61;

	cms.userData = {};

	cms.outSideData = {};
	cms.inSideData = {};

	cms.simple_encrypt = function(str) {
		return cmsCommon.simple_encrypt(str);
	}
	cms.simple_decrypt = function(str) {
		return cmsCommon.simple_decrypt(str);
	}
	cms.setLogPath = function() {
		cmsFile.setLogPath(cmsNet.sendSync('get-log-path'));
	}

	cms.getClientVersion = function() {
		return cms.client_version;
	}

	cms.setAutoUpdateListener = function(funcName, callback) {
		cmsNet.setAutoUpdateListener(funcName, callback);
	}

	cms.listenQtpClose = function(callback) {
		cmsNet.listenQtpClose(callback);
	}


	cms.log = function() {
		var date = new Date();
		var output = "["+date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "]";
		for(var i = 0; i < arguments.length; i ++) {
			if (typeof arguments[i] == "object") {
				output += JSON.stringify(arguments[i]);
			} else {
				output += String(arguments[i]);
			}
			output+="\r\n";
		}
		console.log(output);
		cmsFile.log(output);
	}
	cms.writeFileSync = function(path,data) {
		return cmsFile.writeFileSync(path,data);
	}

	cms.writeFile = function(path,data,callback) {
		cmsFile.writeFile(path,data,callback);
	}

	cms.readFileSync = function(path) {
		return cmsFile.readFileSync(path);
	}

	cms.readFile = function(path,callback) {
		cmsFile.readFile(path,callback);
	}

	cms.setWaitTime = function(time) {
		cmsNet.setWaitTime(time);
	}

	//设置网络连接状态
	cms.setNetworkState = function(state) {
		cmsNet.setNetworkState(state);
	}

	cms.fgsLogin = function(params,callback) {
		cmsNet.fgsLogin(params,callback);
	}

	//获取指定路径下的dll,asar文件和exe的md5码
	//算法读取文件按文件字符升序读取,采取前序遍历,就算每个文件的md5码并相加,最后得出的字符串再进行MD5转码
	//callback函数为回调函数,有一个md5码的参数作为回调值
	cms.getMd5 = function(callback) {
		var md5String = "";
		if (fs.existsSync("./resources/app.asar")) {
			fs.readFile("./resources/app.asar",function(err,data) {
				if (err) {
					cms.log("读取MD5码失败.");
					md5String = crypto.createHash('md5').update("error").digest('hex');
					callback(md5String);
					return;
				}
				md5String = crypto.createHash('md5').update(data).digest('hex');
				callback(md5String);
			});
		} else {
			md5String = crypto.createHash('md5').update("error").digest('hex');
			callback(md5String);
		}
	}

	cms.getMd5_feiqi = function (callback ) {

		var md5String="",errorArr=[];
		travel("./resources",function(pathname, func) {
			if (pathname.toLowerCase() != "app" && pathname.toLowerCase() != "app.asar") {
				func();
				return;
			}
			var tarr=pathname.split(".");
			if (!tarr.length) {
				func();
				return;
			}

			var suffix=tarr[tarr.length-1].toLowerCase();
			if (suffix != "exe" && suffix != "dll" && suffix != "js" && suffix != "so" && suffix != "asar") {
				func();
				return;
			}
			fs.readFile(pathname,function(err,data) {
				if (err) {
					errorArr.push(err);
					func();
					return;
				}
				var md5Str=crypto.createHash('md5').update(data).digest('hex');
				md5String += md5Str;
				// tmd5.push({pathname:pathname, data:md5Str});
				func();
			});
		},function() {
			md5String=crypto.createHash('md5').update(md5String).digest('hex');
			callback && callback(md5String);
		}
	);
	}


	//异步前序遍历文件夹的所有文件,callback为读到文件时的回调函数,finish是读完当前所有文件后的回调函数
	function travel(dir, callback, finish) {
		fs.readdir(dir, function (err, files) {
			if (err) {
				cms.log(err);
				finish && finish();
				return;
			}
			files.sort();

			(function next(i) {
				if (i < files.length) {
					var pathname = path.join(dir, files[i]);
					fs.stat(pathname, function (err, stats) {
						if (err) {
							cms.log(err);
							finish && finish();
							return;
						 }

						 if (stats.isDirectory()) {
							 if (files[i] == "log" || files[i] == "tgwlog") {
								 next(i + 1);
								 console.log(files[i]);
								 return;
							 }
	   						travel(pathname, callback, function () {
	   						  next(i + 1);
	   						});
	   					  } else {
	   						callback(pathname, function () {
	   						  next(i + 1);
	   						});
	   					  }
					});
	  			} else {
	  			  finish && finish();
	  			}
  		  }(0));
		});
	}

	// 用于向网络服务器发送请求
	cms.request = function(actorName,params,callback,conid=101) {
		cmsNet.request(actorName,params,callback,conid);
	}

	//仅用于向渲染进程发送消息
	cms.send = function(msg,arg) {
		cmsNet.send(msg,arg);
	}

	cms.tgwCfg = function(id,value){
		return cmsNet.tgwCfg(id,value);
	}

	cms.sendSync = function(msg,arg) {
		return cmsNet.sendSync(msg,arg);
	}

	//动态添加js
	cms.addJsFile = function(path) {
		var head = document.getElementsByTagName('head')[0];
		// var body = document.getElementsByTagName('body')[0];
		console.log(path);
    	var script = document.createElement('script');
    	script.src = path;
    	script.type = 'text/javascript';
    	head.appendChild(script);
	}

	//动态添加css
	cms.addCssFile = function(path) {
		var head = document.getElementsByTagName('head')[0];
    	var link = document.createElement('link');
    	link.href = path;
    	link.rel = 'stylesheet';
    	link.type = 'text/css';
    	head.appendChild(link);
	}
	//检测是否存在logo以及

	cms.checkFile = function(logoPath, namePath) {
		if(fileCheck.existsSync(logoPath) && fileCheck.existsSync(namePath)) {
			// 表示存在
		   var appNamePath = fs.readFileSync(namePath).toString('utf8');
			return {name: appNamePath};
		} else {
			return null;
		}
	}

	//用于消息提示
	cms.message = {};
	cms.message.success = function(msg,delay) {
		var _msg = msg || "";
		var _delay = delay || 10;
		messageBox.showMessage("success",_msg,_delay);
	}
	cms.message.error = function(msg,delay) {
		var _msg = msg || "";
		var _delay = delay || 10;

		messageBox.showMessage("error",_msg,_delay);
	}

	//深拷贝对象内容
	cms.deepCopy = function(src, dest) {
		var dest = dest || {};
		for (var i in src) {
			if (typeof src[i] === 'object' && src[i] !== null) {
				dest[i] = (src[i].constructor === Array) ? [] : {};
				cms.deepCopy(src[i], dest[i]);//递归
			} else {
				dest[i] = src[i];
			}
		}
		return dest;
	}

    //循环查找，用于弥补二分顺序查找法不适用于未排序的数组
    cms.accurateSearch=function (arr,member,dest) {
		var index = -1;
	    if (typeof member =="undefined") {
			for (var i = 0; i < arr.length; ++i) {
				if (arr[i] === dest) {
					index = i;
					break;
				}
			}
	    } else {
			for (var i = 0; i < arr.length; ++i) {
				if (arr[i][member] === dest) {
					index = i;
					break;
				}
			}
	    }
		return index;
	}

	//二分顺序查找法,arr是目标数组;member是数组元素的指定成员,undefined则就是本身;dest,目标对象;begin开始默认0;end结束,默认末端元素的索引
	cms.binarySearch=function (arr,member,dest,begin,end){
	    var mid=-1;
	    begin=begin||0;
	    end=end||arr.length-1;

	    if (typeof member =="undefined") {
	        while(begin <= end){
	            mid=Math.floor((begin+end)/2);
	            if (arr[mid] === dest) {
	                return mid;
	            } else if (arr[mid] > dest) {
	                end = mid-1;
	            } else {
	                begin=mid+1;
	            }
	        }
	    } else {
	        while(begin <= end){
	            mid=Math.floor((begin+end)/2);
	            if (arr[mid][member] === dest) {
	                return mid;
	            } else if (arr[mid][member] > dest) {
	                end = mid-1;
	            } else {
	                begin=mid+1;
	            }
	        }
	    }

	    return -1;
	}


	cms.binarySearchByFunction=function(arr,dest,compare ,begin,end) {

		var mid=-1;
		begin=begin||0;
		end=end||arr.length-1;

		while(begin <= end){
			mid=Math.floor((begin+end)/2);
			var result=compare(arr[mid], dest);
			if ( result == 0 ) {
				return mid;
			} else if (result > 0) {
				end = mid-1;
			} else {
				begin=mid+1;
			}
		}

		return -1;
	}

	/*解析excel文件,返回解析表格之后的结果
	*参数fileDom是inputfileDOM对象,callback是回调函数
	*回调函数有一个参数,result属性true表示成功执行,reeson属性表示失败原因,data是数据数组
	*/
	cms.parseExcelFile = function(fileDom,callback) {
		cmsCommon.parseExcelFile(fileDom,callback);
	}

	cms.importExcelFile = function(callback){
		cmsFile.importExcelFile(callback);
	}

	/*导出到excel文件,返回导出表格的结果
	*参数dataObj是对象,callback是回调函数
	*data是导出的数据;fileName是导出文件的名字; fileType是导出文件的后缀; headers是可选的表格名称,不填则没有; sheetName第一张表的名称
	*回调函数有一个参数,result属性true表示成功执行,reeson属性表示失败原因,data是数据数组
	*/
	cms.exportSingleSheetExcel = function(dataObj,callback) {
		cmsCommon.exportSingleSheetExcel(dataObj,callback);
	}

	cms.exportExcelFile = function(dataObj,callback) {
		cmsFile.exportExcelFile(dataObj,callback)
	}


	//日期格式转为日期标准字符串：2015-03-19
	cms.formatDate = function (date) {
		var y = date.getFullYear();
		var m = date.getMonth() + 1;
		m = m < 10 ? '0' + m : m;
		var d = date.getDate();
		d = d < 10 ? ('0' + d) : d;
		return ''+y + '-' + m + '-' + d;
	};

	//日期格式转为日期标准字符串：20150319
	cms.formatDate_ex = function (date) {
		var y = date.getFullYear();
		var m = date.getMonth() + 1;
		m = m < 10 ? '0' + m : m;
		var d = date.getDate();
		d = d < 10 ? ('0' + d) : d;
		return ''+y +  m + d;
	};

	//日期格式转为日期标准字符串：：2015-03-19 12:00:00
	cms.formatDateTime = function (date) {
		var y = date.getFullYear();
		var m = date.getMonth() + 1;
		m = m < 10 ? ('0' + m) : m;
		var d = date.getDate();
		d = d < 10 ? ('0' + d) : d;
		var h = date.getHours();
		h=h < 10 ? ('0' + h) : h;
		var minute = date.getMinutes();
		minute = minute < 10 ? ('0' + minute) : minute;
		var second=date.getSeconds();
		second=second < 10 ? ('0' + second) : second;
		return ''+y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;
    };

	cms.formatTime = function (date) {
		var h = date.getHours();
		h=h < 10 ? ('0' + h) : h;
		var minute = date.getMinutes();
		minute = minute < 10 ? ('0' + minute) : minute;
		var second=date.getSeconds();
		second=second < 10 ? ('0' + second) : second;
		return h+':'+minute+':'+second;
    };

	// 将字符串转化成日期对象
	cms.getDateFromString = function(dateStr) {
		if ( isNaN( parseInt(dateStr) ) ) {
			return new Date();
		}
		var year = parseInt( parseInt(dateStr) / 10000 );
		var month = parseInt( (parseInt(dateStr) % 10000) / 100 );
		var day = parseInt(dateStr) % 100;
		var date = new Date();
		console.log(year, month, day)
		date.setFullYear(year, month - 1, day);
		return date;
	}

	cms.hasClass=function (obj,cls) {
	    return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
	};

	cms.addClass=function (obj,cls) {
	    if (!cms.hasClass(obj,cls)) obj.className += " " + cls;
	}

	cms.removeClass=function (obj,cls) {
	    if (cms.hasClass(obj,cls)) {
	        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
	        obj.className = obj.className.replace(reg, ' ');
	    }
	};

	cms.toggleClass=function (obj,cls){
	    if(this.hasClass(obj,cls)){
	        this.removeClass(obj,cls);
	    }else{
	        this.addClass(obj,cls);
	    }
	};

	//改变密码框的相关样式,event为点击icon的事件
	//详情请参考资产账户密码修改界面
	cms.changeInputType =function (clickEvent, obj){
		for (var i = 0; i < clickEvent.path.length; i++) {
			var inputDiv=clickEvent.path[i];
			if (inputDiv.className.indexOf("common_tail_input") != -1) {
				for (var i = 0; i < inputDiv.children.length; i++) {
					if (inputDiv.children[i].tagName.toLowerCase() == "input") {
						if (inputDiv.children[i].type == "text") {
							inputDiv.children[i].type = "password";
							cms.removeClass(clickEvent.target,"icon-yanjing");
							cms.addClass(clickEvent.target,"icon-yanjing1");
							clickEvent.target.title="显示密码";
						} else {
							inputDiv.children[i].type = "text";
							cms.removeClass(clickEvent.target,"icon-yanjing1");
							cms.addClass(clickEvent.target,"icon-yanjing");
							clickEvent.target.title="隐藏密码";
						}

						break;
					}
				}
				break;
			}
		}
	}

	//给点击的那一列表头加className类,clickEvent为点击时的事件
	//界面请参考持仓管理
	cms.addClassToTableHead = function(clickEvent,className) {
		if (!className || !clickEvent || clickEvent.constructor !== MouseEvent) {
			cms.message.error("传入的对象不正确!");
			return false;
		}
        var cellIndex=-1,tableDOM;
        for (var i = 0; i < clickEvent.path.length; i++) {
            var tagName=clickEvent.path[i].tagName.toLowerCase();
            if (tagName == "td" || tagName == "th") {
                cellIndex=clickEvent.path[i].cellIndex;
            } else if (tagName == "table") {
                tableDOM=clickEvent.path[i];
                break;
            }
        }

        if (cellIndex !== -1 && tableDOM) {
            var thArr= tableDOM.getElementsByTagName("th");
            if (thArr.length > cellIndex) {
                for (var i = 0; i < thArr.length; i++) {
                    if (i !== cellIndex ) {
                        cms.removeClass(thArr[i], className);
                    } else {
                        cms.addClass(thArr[cellIndex], className);
                    }

                }
				return true;
            }
        }
		return false;
	}


	//检测mac地址正确性，不区分大小
	cms.checkMacValid = function (mac){
		if (mac && mac.toString() === "*") {
			return true;
		} 
		console.log(mac.length = 17);
		console.log(mac.toString() != "*");
		if(!mac || (mac.toString() != "*" && mac.length !=12)) {
			return false;
		}

		for(var i=0;i<mac.length;i++)
		{
			if((mac.charAt(i)>='0' && mac.charAt(i)<='9') || (mac.charAt(i)>='a' && mac.charAt(i)<='f') || (mac.charAt(i)>='A' && mac.charAt(i)<='F') )
			{
				continue;
			}
			else
			{
				console.log("第二个拦截");
				return false;
			}
		}
		return true;
	}


	//检验ip地址正确性,
	cms.checkIpValid = function(ip) {
		var ipCheckReg = /^(((1[0-9]{2})|(2(([0-4][0-9])|(5[0-5])))|([1-9][0-9])|[0-9]|\*)\.){3}((1[0-9]{2})|(2(([0-4][0-9])|(5[0-5])))|([1-9][0-9])|[0-9]|\*)$/;
		console.log(ip);
		if (ip && ip.toString() === "*") {
			return true;
		}
		if(!ip || ((ip.toString() != "*") && !ipCheckReg.test(ip))) {
			console.log("ip有错误");
			return false;
		}
		return true;
	}

	//此处重新声明Nodejs和Electron的API
	window.nodeRequire = require;
	window.nodeExports = window.exports;
	window.nodeModule = module;

	delete window.require;
	delete window.exports;
	delete window.module;

})()
