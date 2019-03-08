(function() {


	if(typeof cmsCommon == "undefined") {
		cmsCommon = {};
	}
	cmsCommon.simple_encrypt = function(strSrc) {
		var strDest="";
	    var srcLen=strSrc.length;
	    for(var len=0;len<srcLen;++len){
	        var charCode= (strSrc.charAt(srcLen - 1 - len)).charCodeAt() ^ ((1 << ((len % 7) + 1)) - 1);
	        strDest += String.fromCharCode((charCode & 0x0F) + 63);
	        strDest += String.fromCharCode(((charCode & 0xF0) >> 4) + 63);
	    }
	    return strDest;
	}
	cmsCommon.simple_decrypt = function(strSrc) {
		var strDest="";
	    var srcLen=strSrc.length;
	    for(var len=0;len*2+1<srcLen;++len){
	        var charCode= (((strSrc.charAt(len * 2 + 1)).charCodeAt()-63)<<4) + (strSrc.charAt(len * 2)).charCodeAt() - 63;
	        charCode ^= ((1 << ((len % 7) + 1)) - 1);
	        strDest += String.fromCharCode(charCode);
	    }
	    return strDest.split("").reverse().join("");
	}

	/*解析excel文件,返回解析表格之后的结果
	*参数e是inputfileDOM对象,callback是回调函数
	*回调函数有一个参数,result属性true表示成功执行,reeson属性表示失败原因,data是数据数组
	*/
	cmsCommon.parseExcelFile=function (e,callback) {
		if (typeof e.files == 'undefined'||e.files.length ===0) {
	        callback({result:false,reason:'解析文件出错'});
			return;
		}

		var f = e.files[0];
		{
			var reader = new FileReader();
			var name = f.name;
			var nameSuffix=name.substring(name.lastIndexOf('.')+1) ;
			var rABS=true;

			if (nameSuffix.toLowerCase() === 'csv') {
				reader.onload = function(e) {
					 var data = e.target.result;
					 parseExcel(data,callback);
				};
				reader.readAsText(e.files[0],'GBK');
			}else if (nameSuffix.toLowerCase() === 'xls'||nameSuffix.toLowerCase() === 'xlsx'){
				reader.onload = function(e) {
					var data = e.target.result;
					var wb;

					if(rABS) {
						try {
							wb = XLSX.read(data, {type: 'binary'});
						} catch (e) {
							var obj={
								result:false,
								reason:'解析文件出错'
							}
							callback(obj);
							return;
						}
					} else {
						try {
							var arr = fixdata(data);
							wb = XLSX.read(btoa(arr), {type: 'base64'});
						} catch (e) {
							var obj={
								result:false,
								reason:'解析文件出错'
							};
							callback(obj);
							return;
						}
					}
					// var excelData=wb.Sheets[wb.SheetNames[0]];
					// excelData=XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0] ],{RS:'\r\n'});
					// parseExcel(excelData,callback);
					var excelData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header:1});
					var obj={result:true, data:excelData};
					callback(obj);
				};
				if(rABS) reader.readAsBinaryString(f);
				else reader.readAsArrayBuffer(f);
			} else {
				var obj={
					result:false,
					reason:'导入格式只支持csv、xls、xlsx。'
				}
				callback(obj);
				return;
			}

		}
	}

	/*导出到excel文件,返回导出表格的结果
	*参数dataObj是对象,callback是回调函数
	*data是导出的数据;fileName是导出文件的名字; fileType是导出文件的后缀; headers是可选的表格名称,不填则没有; sheetName第一张表的名称
	*回调函数有一个参数,result属性true表示成功执行,reeson属性表示失败原因,data是数据数组
	*/
	cmsCommon.exportSingleSheetExcel=function(dataObj,callback ) {
		if(typeof dataObj.data != "object" || dataObj.data.constructor !== Array) {
			callback({result:false,reason: "数据项不正确,必须是数组"});
			return ;
		}
		if (typeof dataObj.fileName != "string" || dataObj.fileName == "") {
			dataObj.fileName="data";
		}
		if (typeof dataObj.fileType != "string" || dataObj.fileType == "") {
			dataObj.fileType="xlsx";
		}
		if (typeof dataObj.sheetName != "string" || dataObj.sheetName == "") {
			dataObj.sheetName="sheet1";
		}
		if (typeof dataObj.headers == "object" && dataObj.headers.constructor === Array
			&& dataObj.headers.length > 0) {
			dataObj.data.splice(0,0,dataObj.headers);
		}

		var wb = new Workbook(), ws = XLSX.utils.aoa_to_sheet(dataObj.data);
		wb.SheetNames.push(dataObj.sheetName);    //随便起，字符串也好传变量也好
		wb.Sheets[dataObj.sheetName] = ws;

		var bootype="xlsx";
		switch (dataObj.fileType) {
			case "xlsx":
				bootype="xlsx";
				break;
			case "xls":
				bootype="xlml";
				break;
			case "csv":
				bootype="csv";
				break;
			default:
				bootype="xlsx";
		}
		var wopts = { bookType: bootype, bookSST:false, type:'binary' };

		try {
			var wbout = XLSX.write(wb,wopts);
		} catch (e) {
			console.log("XLSX.write",e);
			callback({result:false, reason:"XLSX.write出错!"});
			return;
		} finally {

		}

		function s2ab(s) {
		  var buf = new ArrayBuffer(s.length);
		  var view = new Uint8Array(buf);
		  for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
		  return buf;
		}
		/* the saveAs call downloads a file on the local machine */
		saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), dataObj.fileName+"."+dataObj.fileType);
		// callback({result:true});
	}

	function Workbook() {
        if(!(this instanceof Workbook)) {return new Workbook();}
        this.SheetNames = [];
        this.Sheets = {};
    }

	function parseExcel(excelData,callback){
		var saveData=[];
		var rowDatas=excelData.split("\r");
		var tempDatas=[];
		for (var i = 0; i < rowDatas.length; i++) {
		  if(rowDatas[i] !=""){
			var split_N=rowDatas[i].split("\n");
			for (var j = 0; j < split_N.length; j++) {
			  if(split_N[j] != ""){
				tempDatas.push(split_N[j]);
			  }
			}
		  }
		}

		for(var k = 0; k < tempDatas.length; k ++) {
		  var rData = [];
		  rData = tempDatas[k].split(",");
		  saveData[k]=rData;
		}


		var obj={result:true, data:saveData};
		callback(obj);

	}

	function fixdata(data) { //文件流转BinaryString
		var o = "",
				l = 0,
				w = 10240;
		for(; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
		o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
		return o;
	}

	cmsCommon.parseExcelData = function(data,isCsv,callback) {
		if(isCsv) {
			parseExcel(data,callback);
		}
		else {
			try {
				wb = XLSX.read(data, {type: 'binary'});
			} catch (e) {
				var obj={
					result:false,
					reason:'解析文件出错'
				}
				callback(obj);
				return;
			}
			var excelData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header:1});
			var obj={result:true, data:excelData};
			callback(obj);
		}
	}

	cmsCommon.exportExcelData = function(data,options,callback) {
		if(typeof options.isCsv != "undefined" && options.isCsv == true) {
			try {
				var ws = XLSX.utils.aoa_to_sheet(data);
				var wbout = XLSX.utils.sheet_to_csv(ws,{RS:"\r\n"});
			} catch (e) {
				console.log(e);
				callback(e,null);
				return ;
			} finally {
				callback(null,wbout);
			}
		}
		else {
			var sheetName = typeof options.sheetName != "string" ? "sheet1" : options.sheetName;
			var type = options.fileType === "xls" ? "xlml" : "xlsx";
			var wb = new Workbook();
			try {
				var ws = XLSX.utils.aoa_to_sheet(data);
			} catch (e) {
				console.log("aoa_to_sheet",e);
				callback(e,null);
				return ;
			}
			wb.SheetNames.push(sheetName);    //随便起，字符串也好传变量也好
			wb.Sheets[sheetName] = ws;
			var wopts = { bookType: type, bookSST:false, type:'binary' };
			try {
				var wbout = XLSX.write(wb,wopts);
			} catch (e) {
				console.log("XLSX.write",e);
				callback(e,null);
				return;
			}
			callback(null,wbout);
		}
	}

})()
