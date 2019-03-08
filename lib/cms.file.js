(function () {
	if (typeof cmsFile == "undefined") {
		cmsFile = {};
	}
	var fs = require('fs');
	var path = require('path');
	var logDir = "log";
	var logPath = "cms_default.txt";
	var existLogStream = false;
	var stream;

	var remote = require('electron').remote;
	var win = remote.getCurrentWindow();
	var dialog = remote.dialog;


	cmsFile.log = function (output) {
		//写入日志文件
		if (existLogStream) {
			stream.write(output);
		} else {
			existLogStream = true;
			stream = fs.createWriteStream(logDir + "/" + logPath, { flags: "a", defaultEncoding: "utf8" });
			stream.on("error", function (err) {
				console.log(err);
			});
			stream.write(output);
		}
	}
	cmsFile.setLogPath = function (path) {
		if (stream) {
			stream.end();
		}

		logPath = path;
	}
	cmsFile.writeFileSync = function (path, data) {
		try {
			var ret = fs.writeFileSync(path, data);
		} catch (e) {
			throw (e);
			return;
		}
		return ret;
	}
	cmsFile.writeFile = function (path, data, callback) {
		fs.writeFile(path, data, function (err) {
			if (err) {
				cmsFile.log(path + "写文件失败");
			}
			callback(err);
		});
	}
	cmsFile.readFileSync = function (path) {
		if (fs.existsSync(path) == true) {
			try {
				var ret = fs.readFileSync(path, "utf8");
			} catch (e) {
				throw (e);
				return undefined;
			}
			return ret;
		}
		else {
			return undefined;
		}
	}

	cmsFile.readFile = function (path, callback) {
		fs.readFile(path, "utf8", function (err, data) {
			if (err) {
				cmsFile.log(path + "读文件失败");
			}
			callback(err, data);
		});
	}

	cmsFile.importExcelFile = function (callback) {
		dialog.showOpenDialog(win, {
			title: "请选择xls/xlsx/csv格式的文件",
			filters: [
				{ name: "excel文件", extensions: ['xls', 'xlsx'] },
				{ name: "csv文件", extensions: ['csv'] }
			]
		}, function (fileNames) {
			if (fileNames != undefined && fileNames.length > 0) {
				if (typeof cmsCommon == "undefined") {
					callback(false, { result: false, reason: "缺少必要的模块文件." });
				}
				else {
					var list = fileNames[0].split(".");
					var tail = list[list.length - 1].toUpperCase();
					if (tail !== "XLS" && tail !== "XLSX" && tail !== "CSV") {
						callback(false, { result: false, reason: "错误的文件类型." });
						return;
					}
					try {
						var fcontent = fs.readFileSync(fileNames[0], { encoding: tail === "CSV" ? 'utf8' : 'binary' });
					} catch (e) {
						console.log("oper file Error", e);
						callback(false, { result: false, reason: "打开文件失败." });
						return;
					}
					// var times = 0;
					// console.log(stream);

					// stream.on('readable', () => {
					// 	times ++;
					// 	var data = stream.read();
					if (fcontent != null) {
						cmsCommon.parseExcelData(fcontent, tail === "CSV", function (res) {
							callback(false, res);
						})
					}
					// 	else {
					// 		if(times == 1) {
					// 			callback(false,{result:false,reason:"选择的文件为空，请重新选择."});
					// 			return ;
					// 		}
					// 	}
					// });
				}
			}
			else {
				callback(true, null);
			}
		})
	}

	cmsFile.exportExcelFileWithoutSaveDialog = function (dataObj, callback, fileName) {
		if (typeof dataObj.headers == "object" && dataObj.headers.constructor === Array
			&& dataObj.headers.length > 0) {
			dataObj.data.splice(0, 0, dataObj.headers);
		}

		if (typeof fileName != "undefined") {
			var list = fileName.split(".");
			var tail = list[list.length - 1].toUpperCase();
			if (typeof cmsCommon == "undefined") {
				callback(false, { result: false, reason: "缺少必要的模块文件" });
			}
			if (tail === "XLS" || tail === "XLSX") {
				cmsCommon.exportExcelData(dataObj.data, {
					isCsv: false,
					sheetName: dataObj.sheetName,
					fileType: tail.toLowerCase()
				}, function (err1, data) {
					if (err1) {
						callback(false, { result: false, reason: "数据格式错误，无法生成文件" });
						return;
					}
					else {
						var error = null;
						var stream = fs.createWriteStream(fileName, { flags: "w", defaultEncoding: "binary" });
						stream.on("error", function (err) {
							error = err;
							console.log(error);
							callback(false, { result: false, reason: "写文件失败:" + error })
						});
						stream.write(data, function () {

							stream.end();
							if (error != null) {
								callback(false, { result: false, reason: "写文件失败:" + error })
							}
							else {
								callback(false, { result: true });
							}
						});
					}
				})
			}
			else if (tail === "CSV") {
				cmsCommon.exportExcelData(dataObj.data, { isCsv: true }, function (err1, data) {
					if (err1) {
						callback(false, { result: false, reason: "数据格式错误，无法生成文件" });
						return;
					}
					else {
						var error = null;
						var stream = fs.createWriteStream(fileName, { flags: "w", defaultEncoding: "utf8" });
						stream.on("error", function (err) {
							console.log(err);
							error = err;
							callback(false, { result: false, reason: err });
						});
						stream.write(data, function () {
							console.log(error);
							stream.end();
							if (error != null) {
								callback(false, { result: false, reason: "写文件失败" })
							}
							else {
								callback(false, { result: true });
							}
						});
					}
				})
			}
			else {
				callback(false, { result: false, reason: "无法识别的文件格式" })
			}
		}
		else {
			callback(true, null);
		}
	}

	cmsFile.exportExcelFile = function (dataObj, callback) {
		if (typeof dataObj.data != "object" || dataObj.data.constructor !== Array) {
			callback({ result: false, reason: "数据项不正确,必须是数组" });
			return;
		}
		var filePath = "";
		if (typeof dataObj.fileName === "string") {
			filePath = dataObj.fileName + "." + (typeof dataObj.fileType === "string" ? dataObj.fileType : "xlsx");
		}
		dialog.showSaveDialog(win, {
			title: "导出数据到",
			defaultPath: filePath,
			filters: [
				{ name: "excel文件", extensions: ['xls', 'xlsx'] },
				{ name: "csv文件", extensions: ['csv'] }
			]
		}, function (fileName) {
			console.log("exportExcelFile", fileName);
			cmsFile.exportExcelFileWithoutSaveDialog(dataObj, callback, fileName);
		})
	}

	cmsFile.getSaveExcelFileName = function (destFileName, callback) {
		dialog.showSaveDialog(win, {
			title: "导出数据到",
			defaultPath: destFileName,
			filters: [
				{ name: "excel文件", extensions: ['xls', 'xlsx'] },
				{ name: "csv文件", extensions: ['csv'] }
			]
		}, function (fileName) {
			console.log("exportExcelFile", fileName);
			callback(fileName);
		});
	}

	cmsFile.getDirectory = function (fileType, callback) {
		var fileTypeArray;
		switch (fileType) {
			case 1:
				fileTypeArray = ["openFile"];
				break;
			case 2:
				fileTypeArray = ["openDirectory"];
				break;
			default:
				fileTypeArray = ["openFile", "openDirectory"];
		}
		dialog.showOpenDialog(win, { properties: fileTypeArray },
			function (files) {
				callback(files);
			});
	}

	cmsFile.join = path.join;


})()
