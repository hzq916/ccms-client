"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var os = require("os");
var fs = require("fs");
var http = require("http");
var Url = require("url");
var path = require("path");
var EventEmitter = require("events");
var crypto = require("crypto");
function log(log) {
    console.log("<updaterProcess> " + log);
}
function logError(log) {
    console.log("<updaterProcess> Error: " + log);
}
var Updater = /** @class */ (function () {
    function Updater() {
        this.chronosVersion = process.argv[2];
        this.localClientVersion = process.argv[4];
        log("chronosVersion: " + this.chronosVersion + ";  localClientVersion: " + this.localClientVersion);
        this.updaterServerAddrs = process.argv[3].split(",").map(function (addr) { return Url.parse(addr.includes("http") ? addr : "http://" + addr); });
        this.currentServerAddr = this.updaterServerAddrs[0];
        this.localTmpPath = path.join(os.tmpdir(), "ccms");
        // this.dev();
    }
    Updater.prototype.dev = function () {
        if (this.chronosVersion === "1.1.6.4") {
            this.localClientVersion = "1.0.5.6";
        }
    };
    Updater.prototype.init = function () {
        // this.dev();
        var _this = this;
        process.on("uncaughtException", function (e) {
            process.exit();
            logError(e);
        });
        process.on("message", function (e) {
            try {
                log("received msg: " + JSON.stringify(e));
                switch (e.type) {
                    case "download":
                        _this.onDownload(e.value);
                        break;
                    case "update":
                        // this.onUpdate(e.value);
                        break;
                    default:
                        log("received unhandle msg type: " + e.type);
                        break;
                }
            }
            catch (err) {
                log(err);
                process.exit();
            }
        });
        this.checkVersion();
    };
    Updater.prototype.onDownload = function (value) {
        var _this = this;
        switch (value) {
            case 0:
                process.exit();
                break;
            case 1:
                this.downloadClient().then(function (values) {
                    var savedPath = values.md5;
                    _this.sendDownloaded();
                }).catch(function (err) { return _this.onError; });
                break;
            default:
                log("download msg unhandle value: " + value);
                process.exit();
                break;
        }
    };
    // onUpdate(value) {
    //     const resourcePath = this.findResourcePath();
    //     const tmpPath = resourcePath + ".tmp";
    //     const newAppReadStream = fs.createReadStream(this.localTmpPath);
    //     const appTmpWriteStream = fs.createWriteStream(tmpPath);
    //     newAppReadStream.pipe(appTmpWriteStream);
    //     newAppReadStream.on("error", this.onError);
    //     appTmpWriteStream.on("finish", () => {
    //         fs.renameSync(tmpPath, resourcePath);
    //         log("updated success");
    //         if (this.releaseInfo.ForceFlag === "1") {
    //             process.send({type: "updated"});
    //         } else {
    //             switch (value) {
    //                 case 0:
    //                     break;
    //                 case 1:
    //                     process.send({type: "updated"});
    //                     break;
    //             }
    //         }
    //         process.exit();
    //     }).on("error", this.onError);
    // }
    Updater.prototype.onError = function (err) {
        log("err: " + err);
        process.exit();
    };
    Updater.prototype.checkVersion = function () {
        var _this = this;
        this.fetchReleaseInfo().then(function (info) {
            log(JSON.stringify(info));
            var targetRelease = info.find(function (item) { return item.CHRONOSVersion === _this.chronosVersion; });
            if (!targetRelease)
                throw Error("can't find chronosVersion: " + _this.chronosVersion + " from releaseXML");
            _this.releaseInfo = targetRelease;
            log("current version: " + _this.localClientVersion + "    latest version: " + targetRelease.clientVersion);
            if (_this.compareVersion(targetRelease.clientVersion, _this.localClientVersion) > 0) {
                _this.localTmpPath += "_" + _this.releaseInfo.clientVersion;
                if (fs.existsSync(_this.localTmpPath) && fs.statSync(_this.localTmpPath).size > 1024 * 10) {
                    _this.sendDownloaded(); // size大于10M
                }
                else {
                    _this.sendMsg("has-update", {
                        version: targetRelease.clientVersion,
                        isForce: Number(_this.releaseInfo.ForceFlag)
                    });
                }
            }
            else {
                log("current is latest version: " + targetRelease.clientVersion);
                process.exit();
            }
        }).catch(this.onError);
    };
    Updater.prototype.compareVersion = function (version1, version2, bits) {
        if (bits === void 0) { bits = 4; }
        // eg: 1.1.5,   1.0.4.3
        var v1Info = version1.split(".");
        var v2Info = version2.split(".");
        var v1 = [], v2 = [];
        for (var i = 0; i < bits; i++) {
            var n1 = parseInt(v1Info[i]) || 0, n2 = parseInt(v2Info[i]) || 0;
            if (n1 > n2) {
                return 1;
            }
            else if (n1 < n2) {
                return -1;
            }
        }
        return 0;
    };
    Updater.prototype.requestByStream = function (method, url, body, headers) {
        if (body === void 0) { body = ""; }
        return new Promise(function (resolve, reject) {
            var req = http.request({
                hostname: url.hostname,
                port: url.port,
                method: method,
                path: url.path,
                headers: headers,
            }, function (res) {
                resolve(res);
            });
            body && req.write(JSON.stringify(body));
            req.end();
        });
    };
    Updater.prototype.downloadClientFac = function () {
        var _this = this;
        var downEvent = new EventEmitter();
        var formatDownUrl = Url.format(this.currentServerAddr) + "/" + this.releaseInfo.clientPath + "/ccms.asar";
        log("remote client " + this.releaseInfo.clientVersion + " address: " + formatDownUrl);
        this.requestByStream("GET", Url.parse(formatDownUrl)).then(function (res) {
            log("download response headers: " + JSON.stringify(res.headers));
            log("download response statusCode: " + res.statusCode);
            if (res.statusCode === 200) {
                var databytesSize = 0;
                if (res.headers["content-length"]) {
                    databytesSize = Number(res.headers["content-length"]);
                    _this.remoteClientSize = databytesSize;
                }
                downEvent.emit("filesizeCounted", databytesSize);
                res.on("data", function (chunk) { return downEvent.emit("chunk", chunk); });
                res.on("error", function (err) { return downEvent.emit("error", err); });
                res.on("end", function () { return downEvent.emit("complete"); });
            }
            else
                downEvent.emit("error", "statusCode: " + res.statusCode);
        });
        return downEvent;
    };
    Updater.prototype.downloadClient = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var downedSize = 0;
            var tmpSaveWriteStream = fs.createWriteStream(_this.localTmpPath, "utf-8");
            var downEvent = _this.downloadClientFac();
            downEvent.once("filesizeCounted", function (size) { return _this.clientSize = size; });
            downEvent.on("chunk", function (chunk) {
                tmpSaveWriteStream.write(chunk);
                downedSize += chunk.byteLength;
                _this.clientSize && _this.sendMsg("progress", downedSize / _this.clientSize);
            });
            downEvent.on("complete", function () {
                log("download total size: " + downedSize / (1024 * 1024));
                tmpSaveWriteStream.end();
                tmpSaveWriteStream.on("finish", function () {
                    var md5 = crypto.createHash("md5");
                    md5.update(fs.readFileSync(_this.localTmpPath));
                    resolve({
                        md5: md5.digest("hex"),
                        savedPath: _this.localTmpPath
                    });
                });
            });
            downEvent.on("error", function (err) {
                tmpSaveWriteStream.end();
                _this.checkAddr() ? _this.downloadClient().then(function (values) { return resolve(values); }).catch(function (err) { return reject(err); }) : reject(err);
            });
        });
    };
    Updater.prototype.findResourcePath = function () {
        var dirs = __dirname.split(path.sep);
        for (var i = dirs.length - 1; i >= 0; i--) {
            var extname = path.extname(dirs[i]);
            if (extname === ".asar") {
                return dirs.slice(0, i + 1).join(path.sep);
            }
        }
        return null;
    };
    Updater.prototype.fetchReleaseInfo = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var formatReleaseUrl = Url.format(_this.currentServerAddr) + "/CCMS/CCMS.XML";
            log("release url: " + formatReleaseUrl);
            _this.requestByStream("GET", Url.parse(formatReleaseUrl)).then(function (res) {
                if (res.statusCode === 200) {
                    var bufferData_1 = [];
                    res.on("data", function (chunk) {
                        bufferData_1.push(chunk);
                    });
                    res.on("end", function () {
                        resolve(_this.parseXML(bufferData_1.join("").toString()));
                    });
                    res.on("error", function (err) {
                        _this.checkAddr() ? _this.fetchReleaseInfo().then(function (data) { return resolve(data); }).catch(function (err) { return reject(err); }) : reject(err);
                    });
                }
                else {
                    _this.checkAddr() ? _this.fetchReleaseInfo().then(function (data) { return resolve(data); }).catch(function (err) { return reject(err); }) : reject("statusCode: " + res.statusCode);
                }
            });
        });
    };
    Updater.prototype.checkAddr = function () {
        var _this = this;
        var idx = this.updaterServerAddrs.findIndex(function (item) { return item === _this.currentServerAddr; });
        if (idx < this.updaterServerAddrs.length - 1) {
            this.currentServerAddr = this.updaterServerAddrs[idx + 1];
            log("check updaterAddr to :" + Url.format(this.currentServerAddr));
            return true;
        }
        return false;
    };
    Updater.prototype.parseXML = function (xml) {
        var parseNode = function (xml, tagName) {
            var coupleTagReg = new RegExp("<\\s*?" + tagName + "[\\s\\S]*?<\/" + tagName + ">", "g");
            var singleTagReg = new RegExp("<\\s*?" + tagName + "[\\s\\S]*?\/>", "g");
            var isSingle;
            if (xml.match(coupleTagReg)) {
                isSingle = false;
            }
            else if (xml.match(singleTagReg)) {
                isSingle = true;
            }
            else {
                throw Error("can't parse xml by tagname: " + tagName);
            }
            var tagStrs = isSingle ? xml.match(singleTagReg) : xml.match(coupleTagReg);
            var tagContentReg = isSingle ? new RegExp("<\\s*?" + tagName + "[\\s\\S]*?\/>") : new RegExp("<\\s*?" + tagName + "[\\s\\S]*?>");
            return tagStrs.map(function (item) {
                var innerXml = "";
                if (!isSingle) {
                    var repReg = new RegExp("<[\/\s]?" + tagName + "[\\s\\S]*?>", "g");
                    innerXml = item.replace(repReg, "").replace(/^\s*/, "").replace(/\s*?$/, "");
                }
                var tagContent = item.match(tagContentReg)[0];
                return {
                    innerXml: innerXml,
                    getAttr: function (name) {
                        var reg = new RegExp("\\s" + name + "\\s*" + "=" + "\\s*" + "\"" + "[^\"]*?\"");
                        var attrStr = "";
                        if (tagContent.match(reg))
                            attrStr = tagContent.match(reg)[0];
                        var spliteds = attrStr.split("\"");
                        var value;
                        if (spliteds.length === 3) {
                            value = spliteds[1];
                        }
                        return value;
                    }
                };
            });
        };
        return parseNode(xml, "item").map(function (item) {
            var enclosureNode = parseNode(item.innerXml, "enclosure")[0];
            return {
                CHRONOSVersion: parseNode(item.innerXml, "ISONVersion")[0].innerXml,
                clientVersion: enclosureNode.getAttr("sparkle:version"),
                clientPath: enclosureNode.getAttr("url"),
                sparkle: parseNode(item.innerXml, "sparkle:releaseNotesLink")[0].innerXml,
                ForceFlag: parseNode(item.innerXml, "ForceFlag")[0].innerXml,
                pubDate: parseNode(item.innerXml, "pubDate")[0].innerXml,
                moduleDescription: parseNode(item.innerXml, "moduleDescription")[0].innerXml
            };
        });
    };
    Updater.prototype.sendMsg = function (type, value) {
        process.send({ type: type, value: value });
    };
    Updater.prototype.sendDownloaded = function () {
        var targetPath = this.findResourcePath();
        log("savedPath => " + this.localTmpPath);
        log("targetPath => " + targetPath);
        this.sendMsg("downloaded", {
            isForce: Number(this.releaseInfo.ForceFlag || 0),
            savedPath: this.localTmpPath,
            targetPath: targetPath,
            remoteClientSize: this.remoteClientSize
        });
        process.exit();
    };
    return Updater;
}());
var updater = new Updater();
updater.init();
//# sourceMappingURL=updater.js.map