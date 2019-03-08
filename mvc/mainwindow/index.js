const path = nodeRequire("path");
var cmsApp = angular.module('cmsApp', [
    'cmsController',
    'cmsService',
    'cmsDirective',
    'oc.lazyLoad'
]);
angular.module('cmsController', []);
angular.module('cmsService', []);
angular.module('cmsDirective', []);

angular.module('cmsService').factory('mainService', function ($http) {
    var service = {};
    service.myTitleBarEventer = {};
    service.myLockEventer = {};
    service.getClientVersion = function () {
        return cms.getClientVersion();
    }

	/* 获取订阅指定的股票行情
	*  参数:stockArray股票代码数组
	*  返回股票代码行情的数组
	*/
    service.getSubscribedStockInfo = function (stockArray) {
        var stockPriceArray = {};
        stockArray.forEach(function (stockCode) {
            if (cmsNet.subscribedStockInfo.hasOwnProperty(String(stockCode))) {
                var temp = cmsNet.subscribedStockInfo[String(stockCode)];
                if (temp) {
                    stockPriceArray[String(stockCode)] = temp;
                }
            }

        });

        return stockPriceArray;
    }

	/* 获取订阅指定的期货行情
	*  参数:futuresArray 股票代码数组
	*  返回期货代码行情的数组
	*/
    service.getSubscribedFuturesInfo = function (futuresArray) {
        var futuresPriceArray = {};
        futuresArray.forEach(function (futuresCode) {
            if (cmsNet.subscribedFuturesInfo.hasOwnProperty(String(futuresCode))) {
                var temp = cmsNet.subscribedFuturesInfo[String(futuresCode)];
                if (temp) {
                    futuresPriceArray[String(futuresCode)] = temp;
                }
            }

        });
        return futuresPriceArray;
    }
    service.currentTradeAccount = null; // 保存需要跳转的资产账户信息

    service.setLogPath = function () {
        cms.setLogPath();
    }
    service.changeMainWindowState = function () {
        service.myTitleBarEventer._changeWindowState();
    }
    service.minMainWindow = function () {
        service.myTitleBarEventer._minWindow()
    }
    service.closeMainWindow = function () {
        service.myTitleBarEventer._closeWindow();
    }

    service.showMainWindow = function () {
        cms.send('show-main-window');
    }

    service.addJsFile = function (path) {
        cms.addJsFile(path);
    }

    service.addCssFile = function (path) {
        cms.addCssFile(path);
    }

    service.getUserInfo = function () {
        return cms.sendSync("get-user-info");
    }

    service.changePassword = function (params, callback) {
        cms.request('AltOperPsw', params, callback);
    }

    service.getCombStrategy = function (params, callback) {
        cms.request("getCombStrategy", params, callback);
    }

    service.getCombStrategyNetInfo = function (params, callback) {
        cms.request("getCombStrategyNetInfo", params, callback);
    }

    service.getUnitPositionInfo = function (params, callback) {
        cms.request("getUnitPositionInfo", params, callback);
    }

    service.getTradingRecord = function (params, callback) {
        cms.request("getTradingRecord", params, callback);
    }

    service.getTradeUnitHoldPosition = function (params, callback) {
        cms.request("getTradeUnitHoldPosition", params, callback);
    }

    service.altPassword = function (params, callback) {
        cms.request("altPassword", params, callback);
    }

    service.casUserChange = function (params, callback) {
        cms.request("casUserChange", params, callback);
    }

    // 订阅行情,totalPosition:[{ukey}]
    service.subscribeMarket = function (totalPosition) {
        var addCode = [];
        // console.log("subscribeMarket",totalPosition);
        totalPosition.forEach(function (position) {
            if (position.ukcode) {
                addCode.push(position.ukcode);
            }
        });
        if (addCode.length) {
            cmsNet.subscribeMarket(addCode);
        }
    }

    // 取消订阅行情,totalPosition:[{ukey}]
    service.unsubscribeMarket = function (totalPosition) {
        var addCode = [];
        totalPosition.forEach(function (position) {
            addCode.push(position.ukcode);
        });
        if (addCode.length) {
            cmsNet.unsubscribeMarket(addCode);
        }
    }


     // 订阅告警消息
     service.kMtFgsSubscribe = function (codeArray) {
            cmsNet.kMtFgsSubscribe(codeArray);
    }

    //取消订阅告警消息
    service.unkMtFgsSubscribe = function(codeArray) {
        cmsNet.unkMtFgsSubscribe(codeArray);
    }



    service.getUkeyMarketInfo = function (totalPosition) {
        var hasAllMarket = true;
        totalPosition.forEach(function (position) {
            if (cmsNet.ukeyMarketInfo.hasOwnProperty(position.ukcode)) {
                position.price = cmsNet.ukeyMarketInfo[position.ukcode].last;
            } else {
                hasAllMarket = false;
                if (position.price == 0 && position.totalvol != 0) {
                    position.price = position.holdcost / position.totalvol;
                }
            }
            if (position.direction == 1) {
                position.value = position.totalvol * position.price;
            } else {
                position.value = -position.totalvol * position.price;
            }
        });
        return hasAllMarket;
    }

    service.getUkeyMarketInfoForNetInfo = function (totalPosition, netInfoArray) {
        var hasAllMarket = true, tmpValue = 0;
        for (var i = 0, j = 0; i < netInfoArray.length; i++) {
            tmpValue = 0;
            // 没有行情的话沿用之前的行情,盘中之前的行情为0,所以不加入总净值也没有问题
            for (; j < totalPosition.length; j++) {
                if (netInfoArray[i].trid == totalPosition[j].trid) {
                    if (cmsNet.ukeyMarketInfo.hasOwnProperty(totalPosition[j].ukcode)) {
                        totalPosition[j].price = cmsNet.ukeyMarketInfo[totalPosition[j].ukcode].last;
                    } else {
                        hasAllMarket = false;
                        if (totalPosition[j].price == 0 && totalPosition[j].totalvol != 0) {
                            totalPosition[j].price = totalPosition[j].holdcost / totalPosition[j].totalvol;
                        }
                    }
                    if (totalPosition[j].direction == 1) {
                        tmpValue += totalPosition[j].totalvol * totalPosition[j].price;
                    } else {
                        tmpValue -= totalPosition[j].totalvol * totalPosition[j].price;
                    }
                } else if (netInfoArray[i].trid > totalPosition[j].trid) {
                    continue;
                } else {
                    break;
                }
            }

            netInfoArray[i].assets = tmpValue + Number(netInfoArray[i].cash);
            if (netInfoArray[i].assets != 0) {
                netInfoArray[i].percent = tmpValue / netInfoArray[i].assets;
            } else {
                netInfoArray[i].percent = 0;
            }
            netInfoArray[i].value = tmpValue;
        }
        return hasAllMarket;
    }

    service.getPasswordMd5 = function (id, value) {
        return cms.tgwCfg(id, value);
    }

    service.relogin = function () {
        cms.send('relogin');
    }

    // service.getLoginUserRight = function (params, callback) {
    //     cms.request("getLoginUserRight", params, callback);
    // }
    service.getUserMenuRight = function (params, callback) {
        cms.request("getUserMenuRight", params, callback);
    }

    service.getOpsService = function (params, callback) {
        cms.request("getOpsService", params, callback);
    }

    service.setNetworkState = function (state) {
        cms.setNetworkState(state);
    }

    service.testNetwork = function (callback) {
        cms.request("heartbeat", { body: { msg: "hello" } }, callback);
    }

    service.getOperatorInfo = function (params, callback) {
        cms.request('getOperator', params, callback);
    }

    service.getOwnerInfo = function (params, callback) {
        cms.request('getOwnerInfo', params, callback);
    }

    service.getGlobalConfig = function (params, callback) {
        cms.request('getGlobalConfig', params, callback);
    }

    //显示弹框
    service.showModal = function (back, modal, title) {
        var backDiv = document.getElementById(back);
        var modalDiv = document.getElementById(modal);
        var titleDiv = document.getElementById(title);
        // if (1) {
        if (backDiv && modalDiv && titleDiv) {
            //先重置modal位置，并center
            backDiv.style.display = "block";
            //获取背景框的大小
            var backWidth = backDiv.offsetWidth;
            var backHeight = backDiv.offsetHeight;
            //获取弹框大小
            var modalWidth = modalDiv.offsetWidth;
            var modalHeight = modalDiv.offsetHeight;
            //弹框位置
            var leftPos = backWidth / 2 - modalWidth / 2;
            var topPos = backHeight / 2 - modalHeight / 2;
            leftPos = leftPos < 5 ? 5 : leftPos;
            topPos = topPos < 5 ? 5 : topPos;
            modalDiv.style.left = leftPos + "px";
            modalDiv.style.top = topPos + "px";
            function centerModal() {
                if (backDiv && modalDiv && titleDiv) {
                    //获取背景框的大小
                    var backWidth1 = backDiv.offsetWidth;
                    var backHeight1 = backDiv.offsetHeight;
                    //获取弹框大小
                    var modalWidth1 = modalDiv.offsetWidth;
                    var modalHeight1 = modalDiv.offsetHeight;
                    //弹框位置
                    var leftPos1 = backWidth1 / 2 - modalWidth1 / 2;
                    var topPos1 = backHeight1 / 2 - modalHeight1 / 2;
                    leftPos1 = leftPos1 < 5 ? 5 : leftPos1;
                    topPos1 = topPos1 < 5 ? 5 : topPos1;
                    modalDiv.style.left = leftPos1 + "px";
                    modalDiv.style.top = topPos1 + "px";
                }
            }
            //为titleDiv添加鼠标按下事件
            //titleDiv.addEventListener('mousedown',startDrag);
            window.addEventListener('resize', centerModal);
            var oDrag = new Drag(modalDiv, { handle: titleDiv, maxContainer: backDiv });
        }
    }

    service.hideModal = function (back) {
        var backDiv = document.getElementById(back);
        if (backDiv != undefined) {
            backDiv.style.display = "none";
        }
    }

    service.registerTitleBar = function (titleBar, eventerType) {
        if (eventerType == 2) {
            service.myLockEventer = new TitleBarEventer(titleBar);
            return;
        }
        service.myTitleBarEventer = new TitleBarEventer(titleBar);
    }

    service.deleteTitleBar = function () {
        delete service.myLockEventer;
        delete service.myTitleBarEventer;
    }

    service.getWindowState = function () {
        return service.myTitleBarEventer._getWindowState();
    }

    service.getSortFunc = function (reverse, isNumber) {
        //这里统一按照升序排列
        if (isNumber == true) {
            //按照数字序
            if (reverse == true) {
                function sortByNumberDesc(a, b) {
                    var a1 = Number(a.value);
                    var b1 = Number(b.value);
                    return b1 - a1;
                }
                return sortByNumberDesc;
            }
            function sortByNumber(a, b) {
                var a1 = Number(a.value);
                var b1 = Number(b.value);
                return a1 - b1;
            }
            return sortByNumber;
        }
        else {
            if (reverse == true) {
                function sortByStringDesc(a, b) {
                    var a1 = String(a.value);
                    var b1 = String(b.value);
                    return b1.localeCompare(a1);
                }
                return sortByStringDesc;
            }
            function sortByString(a, b) {
                var a1 = String(a.value);
                var b1 = String(b.value);
                return a1.localeCompare(b1);
            }
            return sortByString;
        }
    }

    service.loginOut = function (params, callback) {
        cms.request("loginOut", params, callback);
    }

    service.unlockView = function (params, callback) {
        cmsNet.unlockView(params, callback);
    }

    service.autoUpdate = function (params) {
        cms.send("cms_autoupdate", params);
    }

    service.downloadUpdate = function (params) {
        cms.send("cms_toupdate", params);
    }

    service.installUpdate = function (params) {
        cms.send("cms_toinstall", params);
    }

    service.pwdInputBlur = function (pwd, pwdTip, beSurePwd, beSurePwdTip, oldPwd, oldPwdTip, type) {
        let pwdReg = /^(?=.*[a-z])(?=.*\d)(?=.*[~!@#$%^&*()_+\-=`\|\[\]{}:;"'<>?\/\\,.])[a-z\d~!@#$%^&*()_+\-=`\|\[\]{}:;"'<>?\/\\,.]{8,20}$/i;
        if (pwd == "") {
            if (oldPwd != undefined) {
                pwdTip = "新密码不能为空";
            } else {
                pwdTip = "密码不能为空";
            }
            return { pwdTip: pwdTip, beSurePwdTip: beSurePwdTip };
        } else {
            if (type == 1 && !pwdReg.test(pwd)) {
                pwdTip = "请输入8-20位，须包含数字、字母、特殊字符的密码";
                return { pwdTip: pwdTip, beSurePwdTip: beSurePwdTip };
            } else if (type == 0 && (String(pwd).length < 8 || String(pwd).length > 20)) {
                pwdTip = "请输入8-20位的密码";
                return { pwdTip: pwdTip, beSurePwdTip: beSurePwdTip };
            } else {
                if (oldPwd && pwd == oldPwd) {
                    pwdTip = "修改密码与原密码不能一致";
                    return { pwdTip: pwdTip, beSurePwdTip: beSurePwdTip };
                }
            }
            if (pwdReg.test(beSurePwd)) {
                if (pwd != beSurePwd) {
                    pwdTip = "两次输入的密码不一致";
                    return { pwdTip: pwdTip, beSurePwdTip: beSurePwdTip };
                } else {
                    beSurePwdTip = "";
                }
            }
            pwdTip = "";
            return { pwdTip: pwdTip, beSurePwdTip: beSurePwdTip };
        }
    }
    service.beSurePwdInputBlur = function (pwd, pwdTip, beSurePwd, beSurePwdTip, type) {
        let pwdReg = /^(?=.*[a-z])(?=.*\d)(?=.*[~!@#$%^&*()_+\-=`\|\[\]{}:;"'<>?\/\\,.])[a-z\d~!@#$%^&*()_+\-=`\|\[\]{}:;"'<>?\/\\,.]{8,20}$/i;
        if (beSurePwd == "") {
            beSurePwdTip = "确认密码不能为空";
            return { pwdTip: pwdTip, beSurePwdTip: beSurePwdTip };
        } else {
            if (type == 1 && !pwdReg.test(beSurePwd)) {
                beSurePwdTip = "请输入8-20位，须包含数字、字母、特殊字符的密码";
                return { pwdTip: pwdTip, beSurePwdTip: beSurePwdTip };
            } else if (type == 0 && (String(beSurePwd).length < 8 || String(beSurePwd).length > 20)) {
                beSurePwdTip = "请输入8-20位的密码";
                return { pwdTip: pwdTip, beSurePwdTip: beSurePwdTip };
            }
            if (pwdReg.test(pwd)) {
                if (pwd != beSurePwd) {
                    beSurePwdTip = "两次输入的密码不一致";
                    return { pwdTip: pwdTip, beSurePwdTip: beSurePwdTip };
                } else {
                    pwdTip = "";
                }
            }
            beSurePwdTip = "";
            return { pwdTip: pwdTip, beSurePwdTip: beSurePwdTip };
        }
    }
    return service;
});

angular.module('cmsController').controller('mainCtrl', function ($scope, $rootScope, $interval, $timeout, $ocLazyLoad, mainService) {
    $rootScope.serviceid = {
        "cms-server": 40,
        "ccms-server": 42,
        "cas": 10
    }

    $rootScope.passwordType = 1;
    $scope.placeholderText = "";

    //新界面定义变量
    $scope.primaryMenu = 0;
    $scope.primaryMenuEnum = {};
    $scope.showSecondaryMenu = false;
    $scope.secondaryMenuList = [];
    $scope.secondaryOpenMenuList = [];

    $scope.showMax = false;
    $scope.menuList = [];

    /*行情相关*/
    $scope.hq_connect = false;
    $scope.show_hq_tips = false;
    $scope.modalInfoLv2 = { state: "", path: "" };
    $scope.allMarketInfoCfg = []; //行情站点信息,用于编辑
    $scope.allMarketCfg = []; //行情站点信息,用于选择
    $scope.clickAllMarketCfg = []; // 行情站点，当点击选择
    $scope.usedMarketCfg = {};
    $scope.currentMarketCfg = {};
    $scope.userLockScreen = {}; //保存冲文件中读取到的锁屏事件对象
    $scope.isOpenLock = true; //是否开启锁屏
    $scope.isDiabledSettime = {
        time: 120,
        isOpen: true
    }; //是否设置锁屏时间
    $scope.isDisableLockInput = true;


    $scope.currentUserLvdes = "未授权";
    $scope.clientVersion = "";

    $scope.lockPassword = "";

    $scope.updateModalInfo = {};
    $scope.inputErrorTips = {
        oldPwd: "",
        newPwd: "",
        beSurePwd: ""
    }

    isChooseFirst = 0; //表示系统设置的tab 0代表行情站点，1代表网络设置
    changeMarketData = {}; //修改行情站点数据
    addMarketData = {}; //新增行情站点数据
    deleteMarketData = {};//删除行情站点数据

    cmsNet.fgs_kMtLogout(function () {
        $scope.modalInfoLv2.path = "./fgsLogout/fgsLogout.html";
        $scope.modalInfoLv2.state = "fgsLogout";
        document.activeElement.blur();
        $scope.$apply();
    });

    cmsNet.checkWindow(function (state) {
        $scope.showMax = state;
        $scope.$apply();
    })
    
    //当点击tab惊醒切换行情站点和安全设置
    $scope.chooseSettingTab = function(num) {
        $scope.isDiabledSettime["isOpen"] = cms.userData["lockScreenCfg"]["isOpen"];
        $scope.isDiabledSettime["time"] = cms.userData["lockScreenCfg"]["time"];
        if ($scope.isDiabledSettime.isOpen) {
            $scope.isDisableLockInput = false;
        } else {
            $scope.isDisableLockInput = true;
        }
        console.log(cms.userData["lockScreenCfg"]["isOpen"]);
        console.log($scope.isDiabledSettime);
        console.log("+++++++++++++++++");
        $scope.isChooseFirst = num;
    }

    // 这里定义自动更新的所有东西
    $scope.autoUpdater = function () {
        // 读取当前版本号
        var reqData = { body: {} };
        mainService.getGlobalConfig(reqData, function (res) {
            if (res.msret.msgcode != "00") {
                cms.log("自动更新失败." + JSON.stringify(res.msret));
                return;
            }
            // 解析数据
            var obj = {};
            obj.nowVersion = cms.client_version;
            var urls = "";
            angular.forEach(res.body, function (item) {
                if (item.cfgcata == "chronos_update" && item.cfgid == "main_ip") {
                    if (urls == "") {
                        urls += item.cfgvalue;
                    } else {
                        urls += "," + item.cfgvalue;
                    }
                }
                if (item.cfgcata == "chronos_update" && item.cfgid == "sub_ip") {
                    if (urls == "") {
                        urls += item.cfgvalue;
                    } else {
                        urls += "," + item.cfgvalue;
                    }
                }
                if (item.cfgcata == "version" && item.cfgid == "chronos") {
                    obj.version = item.cfgvalue;
                }
            })
            if (urls != "") {
                obj.updateUrls = urls;
            }
            if (!obj.updateUrls || !obj.version) {
                cms.log("自动更新失败,无法获取地址或版本号");
                return;
            }
            // 提交自动更新
            mainService.autoUpdate(obj);
            // 添加自动更新响应
            cms.setAutoUpdateListener("hasUpdateForce", function (arg) {
                $scope.showUpdateModal("hasUpdateForce", arg);
                $scope.$apply();
            });
            cms.setAutoUpdateListener("hasUpdate", function (arg) {
                $scope.showUpdateModal("hasUpdate", arg);
                $scope.$apply();
            });
            cms.setAutoUpdateListener("updateDownloaded", function (arg) {
                if (arg == 1) {
                    $scope.showUpdateModal("updateDownloadedForce", arg);
                } else {
                    $scope.showUpdateModal("updateDownloaded", arg);
                }
                $scope.$apply();
            });
            cms.setAutoUpdateListener("updated", function (arg) {
                cms.send("relaunch");
            });
        })
    }

    // 自动更新相关弹框显示
    $scope.showUpdateModal = function (state, arg) {
        $scope.updateModalInfo.state = state;
        switch ($scope.updateModalInfo.state) {
            case "hasUpdateForce":
                $scope.updateModalInfo.path = "../mainwindow/hasupdateforce.html";
                $scope.updateModalInfo.tips = "检测到新版本 " + arg + ", 请立即更新.";
                break;
            case "hasUpdate":
                $scope.updateModalInfo.path = "../mainwindow/hasupdate.html";
                $scope.updateModalInfo.tips = "检测到新版本 " + arg + ", 是否立即更新？";
                break;
            case "updateDownloadedForce":
                $scope.updateModalInfo.path = "../mainwindow/downloadforce.html";
                $scope.updateModalInfo.tips = "更新完成,请立即重启.";
                break;
            case "updateDownloaded":
                $scope.updateModalInfo.path = "../mainwindow/download.html";
                $scope.updateModalInfo.tips = "更新完成,是否立即重启?";
                break;
            default:
                break;
        }
    }
    // 自动更新相关弹框加载完成
    $scope.updateModalLoadReady = function () {
        switch ($scope.updateModalInfo.state) {
            case "hasUpdateForce":
                mainService.showModal("common_update_modal_back", "main_update_force_modal", "main_update_force_modal_title");
                break;
            case "hasUpdate":
                mainService.showModal("common_update_modal_back", "main_update_modal", "main_update_modal_title");
                break;
            case "updateDownloadedForce":
                mainService.showModal("common_update_modal_back", "main_download_force_modal", "main_download_force_modal_title");
                break;
            case "updateDownloaded":
                mainService.showModal("common_update_modal_back", "main_download_modal", "main_download_modal_title");
                break;
            default:
                break;
        }
    }
    // 关闭自动更新弹框
    $scope.closeUpdateModal = function () {
        $scope.updateModalInfo.state = "";
        $scope.updateModalInfo.path = "";
        mainService.hideModal("common_update_modal_back");
    }

    // 更新
    $scope.updateSelect = function (response) {
        mainService.downloadUpdate(response);
        $scope.closeUpdateModal();
    }

    // 重启
    $scope.installSelect = function (response) {
        mainService.installUpdate(response);
        $scope.closeUpdateModal();
    }

    // 广播跳转的信息
    $scope.$on("redirectTradeAccount", function (event, message) {
        $scope.$broadcast("redirectTradeAccount_broadcast", message);

    });

    $scope.$on("changedAssetAccount", function (event, message) {
        $scope.$broadcast("changedAssetAccount_broadcast", message);

    });

    $scope.$on("changedManager", function (event, message) {
        $scope.$broadcast("changedManager_broadcast", message);

    });

    $scope.$on("changedProduct", function (event, message) {
        $scope.$broadcast("changedProduct_broadcast", message);

    });

    $scope.$on("changedTradeUnit", function (event, message) {
        $scope.$broadcast("changedTradeUnit_broadcast", message);

    });

    $scope.$on("changedTradeAccount", function (event, message) {
        $scope.$broadcast("changedTradeAccount_broadcast", message);

    });

    $scope.$on("changedTrader", function (event, message) {
        $scope.$broadcast("changedTrader_broadcast", message);

    });

    $scope.$on("changedBrokers", function (event, message) {
        $scope.$broadcast("changedBrokers_broadcast", message);

    });

    $scope.$on("changedChannel", function (event, message) {
        $scope.$broadcast("changedChannel_broadcast", message);

    });

    $scope.$on("bindProduct", function (event, message) {
        $scope.$broadcast("bindProduct_broadcast", message);

    });


    /*用户菜单*/
    $scope.showTitleUserMenu = false;
    $scope.showTitleUserMenuAuto = false;

    $scope.modalInfo = {};

    $scope.userInfo = {};
    $scope.changePassInfo = {};

    $scope.sysModalInfo = {};

    //心跳包
    $scope.heartbeat = null;
    $scope.iNetConnect = false;

    //定义定时器，并保存定时器对象
    $scope.lockViewInterval = null;

    $scope.restLockViewInterval = null;


    $scope.showKeyBoardDiv = false;
    //将文件中的用户锁屏配置保存起来
    $scope.lockViewCount = 10;
    // $scope.lockViewInterval = $interval(function () {
    //     --$scope.lockViewCount;

    //     // 这里需要取消所有的元素聚焦,特别是select
    //     if ($scope.lockViewCount == 0) {
    //         document.activeElement.blur();
    //     }
    // }, 1000);

    $scope.showKeyBoard = function () {
        $scope.showKeyBoardDiv = !$scope.showKeyBoardDiv;
    }

    $scope.mainStopEvent = function (event) {
        event = event || window.event;
        event.stopPropagation();
    }

    $scope.mainCloseWindow = function () {
        // mainService.closeMainWindow();
        cms.send("close-main-window");
    }
    $scope.mainMaxWindow = function () {
        // mainService.changeMainWindowState();
        // $scope.showMax = true;
        cms.send("max-main-window");
    }
    $scope.mainBackWindow = function () {
        // mainService.changeMainWindowState();
        // $scope.showMax = false;
        cms.send("back-main-window");
    }
    $scope.mainMiniWindow = function () {
        // mainServichasUpdatee.minMainWindow();
        cms.send("mini-main-window");
    }


    //应用logo以及title
    $scope.electronAppName = "中国银河证券";
    $scope.electronAppLogo = "../../login-dialog/logo.png";
    
    $scope.halfName = "时空量化系统-";

    $scope.mainInit = function () {


        //设置logo以及title名称
        var appLogoPath = process.cwd() + "/logo2.png";
        var appNamePath = process.cwd() + "/name.txt";
        console.log(appLogoPath);
        console.log(appNamePath);
		if (cms.checkFile(appLogoPath,appNamePath)) {
			//true 表示存在配置
			console.log('存在配置');
            $scope.electronAppLogo = appLogoPath;
            $scope.halfName = "时空量化系统-";
			$scope.electronAppName = cms.checkFile(appLogoPath,appNamePath)["name"];
		} else {
			//false 表示不存在配置
			console.log('不存在配置');
            $scope.electronAppLogo = "../../login-dialog/logo.png";
            $scope.halfName = "时空量化系统";
            $scope.electronAppName = "";
            
        }
        
        //初始化的时候先读取外部文件
        cms.readFile("./userData.json", function(err6, data6) {
            if (err6) {
                // cms.message.error("读取锁屏信息失败");
                console.log("外部配置json不存在");
                cms.readFile(path.join(__dirname, "..", "..", "userData.json"), function (err7, data7) {
                    if (err7) {
                        cms.message.error("读取锁屏信息失败");
                        return;
                    }
                    if (data7.length) {
                        try {
                            $scope.userLockScreen = JSON.parse(data7)["lockScreenCfg"];
                            cms.writeFile("./userData.json", JSON.stringify(JSON.parse(data7), null, "\t"), function (err8) {
                                if (err8) {
                                    cms.message.error("写用户信息文件失败");
                                    return;
                                }
                            });
                        } catch (e) {
                            cms.message.error("读取用户数据失败");
                            $scope.userLockScreen = {};
                            return;
                        }
                    }
        
                    if (JSON.stringify($scope.userLockScreen) != "{}") {
                        $scope.lockViewCount = parseInt($scope.userLockScreen["time"]);
                        $interval.cancel($scope.lockViewInterval);
                        if ($scope.userLockScreen["isOpen"]) {
                            $scope.isOpenLock = true;
                            $scope.lockViewInterval = $interval(function () {
                                --$scope.lockViewCount;
                        
                                // 这里需要取消所有的元素聚焦,特别是select
                                if ($scope.lockViewCount == 0) {
                                    document.activeElement.blur();
                                }
                            }, 1000);
                        } else {
                            $scope.isOpenLock = false;
                        }
                    }
                })
            }
            if (data6.length) {
                console.log("外部配置json文件存在");
                    try {
                        cms.outSideData = JSON.parse(data6);
                        $scope.userLockScreen = JSON.parse(data6)["lockScreenCfg"];
                    } catch (e) {
                        cms.message.error("读取用户数据失败");
                        $scope.userLockScreen = {};
                        return;
                    }
                    if (!cms.outSideData["lockScreenCfg"]) {
                        cms.outSideData["lockScreenCfg"] = cms.inSideData["lockScreenCfg"];
                        cms.writeFile("./userData.json", JSON.stringify(cms.outSideData, null, "\t"), function (err9) {
                            if (err9) {
                                cms.message.error("写用户信息文件失败");
                                return;
                            }
                        });
                    }
                    if (!cms.outSideData["marketConfiguration"]) {
                        cms.outSideData["marketConfiguration"] = cms.inSideData["marketConfiguration"];
                        cms.writeFile("./userData.json", JSON.stringify(cms.outSideData, null, "\t"), function (err10) {
                            if (err10) {
                                cms.message.error("写用户信息文件失败");
                                return;
                            }
                        });
                    }

                    if (JSON.stringify($scope.userLockScreen) != "{}") {
                        $scope.lockViewCount = parseInt($scope.userLockScreen["time"]);
                        $interval.cancel($scope.lockViewInterval);
                        if ($scope.userLockScreen["isOpen"]) {
                            $scope.isOpenLock = true;
                            $scope.lockViewInterval = $interval(function () {
                                --$scope.lockViewCount;
                        
                                // 这里需要取消所有的元素聚焦,特别是select
                                if ($scope.lockViewCount == 0) {
                                    document.activeElement.blur();
                                }
                            }, 1000);
                        } else {
                            $scope.isOpenLock = false;
                        }
                    }
            }
        })



        // cms.readFile(path.join(__dirname, "..", "..", "userData.json"), function (err, data) {
        //     if (err) {
        //         cms.message.error("读取锁屏信息失败");
        //         return;
        //     }
        //     if (data.length) {
        //         try {
        //             $scope.userLockScreen = JSON.parse(data)["lockScreenCfg"];
        //         } catch (e) {
        //             cms.message.error("读取用户数据失败");
        //             $scope.userLockScreen = {};
        //             return;
        //         }
        //     }

        //     if (JSON.stringify($scope.userLockScreen) != "{}") {
        //         $scope.lockViewCount = parseInt($scope.userLockScreen["time"]);
        //         $interval.cancel($scope.lockViewInterval);
        //         if ($scope.userLockScreen["isOpen"]) {
        //             $scope.isOpenLock = true;
        //             $scope.lockViewInterval = $interval(function () {
        //                 --$scope.lockViewCount;
                
        //                 // 这里需要取消所有的元素聚焦,特别是select
        //                 if ($scope.lockViewCount == 0) {
        //                     document.activeElement.blur();
        //                 }
        //             }, 1000);
        //         } else {
        //             $scope.isOpenLock = false;
        //         }
        //     }
        // })
        //设置日志路径
        mainService.setLogPath();
        $scope.showMax = false;
        $scope.showFuncMenu = true;
        $scope.showFloatMenu = false;
        $scope.primaryMenu = 0;								//默认无定义
        $scope.primaryMenuEnum.unitManage = 2001;              //定义单元管理
        $scope.primaryMenuEnum.assetsManage = 2002;			//定义资券管理
        $scope.primaryMenuEnum.riskManage = 2003;				//定义风控管理
        $scope.primaryMenuEnum.viewManage = 2004;				//定义视图管理
        $scope.primaryMenuEnum.systemMange = 2005;				//定义系统设置

        $scope.iNetConnect = true;

        $scope.sysModalInfo.state = 0;
        $scope.sysModalInfo.path = "";
        $scope.sysModalInfo.stateEnum = {};
        $scope.sysModalInfo.stateEnum.netBreak = 1;
        $scope.sysModalInfo.timer = null;
        $scope.sysModalInfo.tNumber = 30;

        $scope.updateModalInfo.state = "";
        $scope.updateModalInfo.path = "";
        $scope.changeMarketData = {}; //修改行情站点数据
        $scope.addMarketData = {}; //新增行情站点数据
        $scope.deleteMarketData = {};//删除行情站点数据
        
        $scope.clientVersion = mainService.getClientVersion();


		/*
		* 菜单属性格式
		* {
		*     id: "1", 菜单ID唯一标识菜单
		*     title: "菜单标题", 显示的菜单标题
		*     parent: "1",父菜单ID,如果本身为父菜单，则填自己的ID
		*     leaf  : false, 是否为叶子菜单
		*     select: false, 当前是否选中，父菜单不能被选中
		*     show:  true,    是否显示，父菜单永远显示
		*     folded: false,  是否折叠子菜单
		*     icon:  "",      菜单图标路径
		*     pagePath: "",    菜单对应的页面路径,父菜单对应空
		*     controllerPath:"",   菜单对应的controller路径，父菜单对应空
		*     servicePath: "",     菜单对应的service路径，父菜单对应空
		*     cssPath:""		菜单对应的css路径，父菜单对应为空
		* }
		*/
        $scope.menuList.push({ id: 2001, title: "单元管理", parent: 2001, leaf: false, select: false, show: true, folded: false, icon: "", pagePath: "", controllerPath: "", servicePath: "", cssPath: "" });
        $scope.menuList.push({ id: 2001001, title: "首页", parent: 2001, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../wellcome/wellcome.html", controllerPath: "../wellcome/wellcomeCtrl.js", servicePath: "../wellcome/wellcomeService.js", cssPath: "../wellcome/wellcome.css" });
        $scope.menuList.push({ id: 2001002, title: "单元列表", parent: 2001, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../unit-manage/unitlist.html", controllerPath: "../unit-manage/unitlistCtrl.js", servicePath: "../unit-manage/unitlistService.js", cssPath: "../unit-manage/unitlist.css" });
        // $scope.menuList.push({id:"61100",title:"策略管理",parent:"20000",leaf: true,select: false,show:true,folded: false,icon:"",pagePath:"../strategyServer/strategyServer.html",controllerPath:"../strategyServer/strategyServer.js",servicePath:"../strategyServer/strategyServerService.js",cssPath:"../strategyServer/strategyServer.css"});
        $scope.menuList.push({ id: 2001003, title: "角色管理", parent: 2001, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../permissionManage/permissionManage.html", controllerPath: "../permissionManage/permissionManageCtrl.js", servicePath: "../permissionManage/permissionManageService.js", cssPath: "../permissionManage/permissionManage.css" });
        $scope.menuList.push({ id: 2001004, title: "操作员管理", parent: 2001, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../unit-manage/operManage.html", controllerPath: "../unit-manage/operManageCtrl.js", servicePath: "../unit-manage/operManageService.js", cssPath: "../unit-manage/operManage.css" });
        // $scope.menuList.push({ id: 2001005, title: "交易员管理", parent: 2001, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../unit-manage/traderManage.html", controllerPath: "../unit-manage/traderManageCtrl.js", servicePath: "../unit-manage/traderManageService.js", cssPath: "../unit-manage/traderManage.css" });
        // $scope.menuList.push({ id: 2001006, title: "终端绑定", parent: 2001, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../unit-manage/operMacBind.html", controllerPath: "../unit-manage/operMacBindCtrl.js", servicePath: "../unit-manage/operMacBindService.js", cssPath: "../unit-manage/operMacBind.css" });

        $scope.menuList.push({ id: 2002, title: "资券管理", parent: 2002, leaf: false, select: false, show: true, folded: false, icon: "", pagePath: "", controllerPath: "", servicePath: "", cssPath: "" });
        $scope.menuList.push({ id: 2002001, title: "账户管理", parent: 2002, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../mainAccountManage/mainAccountManage.html", controllerPath: "../mainAccountManage/mainAccountManageCtrl.js", servicePath: "../mainAccountManage/mainAccountManageService.js", cssPath: "../mainAccountManage/mainAccountManage.css" });
        $scope.menuList.push({ id: 2002002, title: "交易账户管理", parent: 2002, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../tradeAccountManage/tradeAccountManage.html", controllerPath: "../tradeAccountManage/tradeAccountManageCtrl.js", servicePath: "../tradeAccountManage/tradeAccountManageService.js", cssPath: "../tradeAccountManage/tradeAccountManage.css" });
        // $scope.menuList.push({ id: 2002003, title: "持仓管理", parent: 2002, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../positionManage/positionManage.html", controllerPath: "../positionManage/positionManageCtrl.js", servicePath: "../positionManage/positionManageService.js", cssPath: "../positionManage/positionManage.css" });
        // $scope.menuList.push({ id: 2002004, title: "白名单设置", parent: 2002, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../assets-manage/whitelist.html", controllerPath: "../assets-manage/whitelistCtrl.js", servicePath: "../assets-manage/whitelistService.js", cssPath: "../assets-manage/whitelist.css" });
        $scope.menuList.push({ id: 2002005, title: "资金数据同步", parent: 2002, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../fundsDataSynchronize/fundsDataSynchronize.html", controllerPath: "../fundsDataSynchronize/fundsDataSynchronizeCtrl.js", servicePath: "../fundsDataSynchronize/fundsDataSynchronizeService.js", cssPath: "../fundsDataSynchronize/fundsDataSynchronize.css" });
        $scope.menuList.push({ id: 2002006, title: "仓位数据同步", parent: 2002, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../positionDataSynchronize/positionDataSynchronize.html", controllerPath: "../positionDataSynchronize/positionDataSynchronizeCtrl.js", servicePath: "../positionDataSynchronize/positionDataSynchronizeService.js", cssPath: "../positionDataSynchronize/positionDataSynchronize.css" });


        $scope.menuList.push({ id: 2003, title: "风控管理", parent: 2003, leaf: false, select: false, show: true, folded: false, icon: "", pagePath: "", controllerPath: "", servicePath: "", cssPath: "" });
        $scope.menuList.push({ id: 2003001, title: "事前风控设置", parent: 2003, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../risk-manage/preTradeRisk/preTradeRisk.html", controllerPath: "../risk-manage/preTradeRisk/preTradeRiskCtrl.js", servicePath: "../risk-manage/preTradeRisk/preTradeRiskService.js", cssPath: "../risk-manage/preTradeRisk/preTradeRisk.css" });
        $scope.menuList.push({ id: 2003002, title: "事后风控查询", parent: 2003, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../risk-manage/laterRisk.html", controllerPath: "../risk-manage/laterRiskCtrl.js", servicePath: "../risk-manage/laterRiskService.js", cssPath: "../risk-manage/laterRisk.css" });
        $scope.menuList.push({ id: 2003003, title: "风控预警消息", parent: 2003, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../riskMessage/riskMessage.html", controllerPath: "../riskMessage/riskMessage.js", servicePath: "../riskMessage/riskMessageService.js", cssPath: "../riskMessage/riskMessage.css" });
        $scope.menuList.push({ id: 2003004, title: "告警消息", parent: 2003, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../alarmMessage/alarmMessage.html", controllerPath: "../alarmMessage/alarmMessage.js", servicePath: "../alarmMessage/alarmMessageService.js", cssPath: "../alarmMessage/alarmMessage.css" });
        $scope.menuList.push({ id: 2003005, title: "合规风控设置", parent: 2003, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../risk-manage/complianceRisk/complianceRisk.html", controllerPath: "../risk-manage/complianceRisk/complianceRiskCtrl.js", servicePath: "../risk-manage/complianceRisk/complianceRiskService.js", cssPath: "../risk-manage/complianceRisk/complianceRisk.css" });
        

        $scope.menuList.push({ id: 2004, title: "视图管理", parent: 2004, leaf: false, select: false, show: true, folded: false, icon: "", pagePath: "", controllerPath: "", servicePath: "", cssPath: "" });
        $scope.menuList.push({ id: 2004001, title: "产品监控", parent: 2004, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../monitor/index.html", controllerPath: "../monitor/monitorCtrl.js", servicePath: "../monitor/monitorService.js", cssPath: "../monitor/monitor.css" });
        $scope.menuList.push({ id: 2004002, title: "净值清单", parent: 2004, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../unitNetInfo/index.html", controllerPath: "../unitNetInfo/unitNetInfo.js", servicePath: "../unitNetInfo/unitNetInfoService.js", cssPath: "../unitNetInfo/unitNetInfo.css" });
        $scope.menuList.push({ id: 2004003, title: "持仓报表", parent: 2004, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../unitPositionInfo/index.html", controllerPath: "../unitPositionInfo/unitPositionInfo.js", servicePath: "../unitPositionInfo/unitPositionInfoService.js", cssPath: "../unitPositionInfo/unitPositionInfo.css" });
        $scope.menuList.push({ id: 2004004, title: "交易记录", parent: 2004, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../tradingRecord/index.html", controllerPath: "../tradingRecord/tradingRecord.js", servicePath: "../tradingRecord/tradingRecordService.js", cssPath: "../tradingRecord/tradingRecord.css" });
        $scope.menuList.push({ id: 2004005, title: "绩效报表", parent: 2004, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../profit-report/profitReport.html", controllerPath: "../profit-report/profitReportCtrl.js", servicePath: "../profit-report/profitReportService.js", cssPath: "../profit-report/profitReport.css" });
        $scope.menuList.push({ id: 2004006, title: "交易汇总", parent: 2004, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../transactionSummary/transactionSummary.html", controllerPath: "../transactionSummary/transactionSummaryCtrl.js", servicePath: "../transactionSummary/transactionSummaryService.js", cssPath: "../transactionSummary/transactionSummary.css" });


        $scope.menuList.push({ id: 2005, title: "系统管理", parent: 2005, leaf: false, select: false, show: true, folded: false, icon: "", pagePath: "", controllerPath: "", servicePath: "", cssPath: "" });
        $scope.menuList.push({ id: 2005001, title: "补单管理", parent: 2005, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../system-manage/supplement-orders/supplement.html", controllerPath: "../system-manage/supplement-orders/supplementCtrl.js", servicePath: "../system-manage/supplement-orders/supplementService.js", cssPath: "../system-manage/supplement-orders/supplement.css" });
        $scope.menuList.push({ id: 2005002, title: "除权除息", parent: 2005, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../system-manage/xrxdManage.html", controllerPath: "../system-manage/xrxdManageCtrl.js", servicePath: "../system-manage/xrxdManageService.js", cssPath: "../system-manage/xrxdManage.css" });
        $scope.menuList.push({ id: 2005003, title: "清算管理", parent: 2005, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../system-manage/clear-manage/clear.html", controllerPath: "../system-manage/clear-manage/clearCtrl.js", servicePath: "../system-manage/clear-manage/clearService.js", cssPath: "../system-manage/clear-manage/clear.css" });
        $scope.menuList.push({ id: 2005004, title: "全局设置", parent: 2005, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../system-manage/globalSettings.html", controllerPath: "../system-manage/globalSettingsCtrl.js", servicePath: "../system-manage/globalSettingsService.js", cssPath: "../system-manage/globalSettings.css" });
        $scope.menuList.push({ id: 2005005, title: "日志管理", parent: 2005, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../system-manage/logManage.html", controllerPath: "../system-manage/logManageCtrl.js", servicePath: "../system-manage/logManageService.js", cssPath: "../system-manage/logManage.css" });
        $scope.menuList.push({ id: 2005006, title: "MD5配置", parent: 2005, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../system-manage/md5Manage/md5Manage.html", controllerPath: "../system-manage/md5Manage/md5ManageCtrl.js", servicePath: "../system-manage/md5Manage/md5ManageService.js", cssPath: "../system-manage/md5Manage/md5Manage.css" });
        $scope.menuList.push({ id: 2005007, title: "期权管理", parent: 2005, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../option-manage/option-manage.html", controllerPath: "../option-manage/option-manage.js", servicePath: "../option-manage/option-manage-service.js", cssPath: "../option-manage/option-manage.css" });
        $scope.menuList.push({ id: 2005008, title: "自定义策略", parent: 2005, leaf: true, select: false, show: true, folded: false, icon: "", pagePath: "../system-manage/customStrategy/customStrategy.html", controllerPath: "../system-manage/customStrategy/customStrategyCtrl.js", servicePath: "../system-manage/customStrategy/customStrategyService.js", cssPath: "../system-manage/customStrategy/customStrategy.css" });


        $scope.modalInfo.state = 0;
        $scope.modalInfo.path = "";
        $scope.modalInfo.stateEnum = {};
        $scope.modalInfo.stateEnum.changepasstip = 1;
        $scope.modalInfo.stateEnum.changepass = 2;
        $scope.modalInfo.stateEnum.loginout = 3;
        $scope.modalInfo.stateEnum.relogin = 4;
        $scope.isChooseFirst = 0;

        //设置网络状态
        mainService.setNetworkState(true);
        mainService.testNetwork(function (res) {
            if (res.msret.msgcode != "00") {
                $interval.cancel($scope.heartbeat);
                $scope.heartbeat = null;
                $scope.iNetConnect = false;
                $scope.mainSysShowModal($scope.sysModalInfo.stateEnum.netBreak);
                $scope.$apply();
            }
        });
        $scope.heartbeat = $interval(function () {
            mainService.testNetwork(function (res) {
                if (res.msret.msgcode != "00") {
                    $interval.cancel($scope.heartbeat);
                    $scope.heartbeat = null;
                    $scope.iNetConnect = false;
                    $scope.mainSysShowModal($scope.sysModalInfo.stateEnum.netBreak);
                    $scope.accountResetPassSure$apply();
                }
            })
        }, 35 * 1000);

        $scope.userInfo = mainService.getUserInfo();
        mainService.currentOperator = $scope.userInfo;
        console.log($scope.userInfo);

        //获取用户权限
        //$rootScope.userRight = {};
        $rootScope.menuRight = [];
        $scope.getUserMenuRight();
        //$scope.getLoginUserRight();

        // 强制改密
        $scope.checkChangepassForce();

        // 自动更新
        $scope.autoUpdater();

        // 检查断线
        $scope.checkFgsConnect();
    }

    // 检查断线
    $scope.checkFgsConnect = function () {
        cms.listenQtpClose(function (res) {
            if (res.msret.msgcode != "00") {
                $scope.mainSysShowModal($scope.sysModalInfo.stateEnum.netBreak);
                $scope.$apply();
            }
        });
    }

    // 检查强制改密
    $scope.checkChangepassForce = function () {
        mainService.getGlobalConfig({ "body": {} }, function (res1) {
            if (res1.msret.msgcode !== "00" || res1.body.length == 0) {
                cms.message.error("版本有问题，请勿使用");
                return;
            }
            for (var i = 0; i < res1.body.length; ++i) {
                var data = res1.body[i];
                if (data.cfgid == "oper_chg_default_pass") {
                    if (data.cfgvalue !== "OFF") {
                        // 判断密码是否修改过
                        mainService.getOwnerInfo({ "body": { "oid": $scope.userInfo.oid } }, function (res) {
                            if (res.msret.msgcode !== "00") {
                                cms.message.error("查询操作员信息失败"+res.msret.msg);
                                return;
                            }
                            if (res.body.chg_default_pass == 0) {
                                // 弹框修改密码
                                $scope.changePassInfo.forceChange = true;
                                $scope.changePassInfo.oid = $scope.userInfo.oid;
                                $scope.changePassInfo.oldpass = "";
                                $scope.changePassInfo.newpass = "";
                                $scope.changePassInfo.passrep = "";
                                $scope.mainShowModal($scope.modalInfo.stateEnum.changepass);
                                $scope.$apply();
                            }
                        })
                    }
                } else if (data.cfgid == "passwd_complexity") {
                    $rootScope.passwordType = Number(data.cfgvalue);
                }                
            }
        });
    }

    //打开系统弹框
    $scope.mainSysShowModal = function (state) {
        $scope.sysModalInfo.state = state;
        switch (state) {
            case $scope.sysModalInfo.stateEnum.netBreak:
                $scope.sysModalInfo.path = "../mainwindow/netbreak.html";
                break;
            default:
                break;
        }
    }

    //系统弹框加载完成
    $scope.mainSysModalLoadReady = function () {
        switch ($scope.sysModalInfo.state) {
            case $scope.sysModalInfo.stateEnum.netBreak:
                mainService.showModal("common_sys_modal_back", "net_break_modal", "net_break_modal_title");
                $scope.sysModalInfo.tNumber = 30;
                $scope.sysModalInfo.timer = $interval(function () {
                    if ($scope.sysModalInfo.tNumber <= 0) {
                        $interval.cancel($scope.sysModalInfo.timer);
                        $scope.sysModalInfo.timer = null;
                        $scope.mainRelogin();
                    }
                    else {
                        $scope.sysModalInfo.tNumber--;
                    }
                }, 1000);
                break;
            default:
                break;
        }
    }

    //关闭系统弹框
    $scope.mainHideSysModal = function () {
        if ($scope.sysModalInfo.timer != null) {
            $interval.cancel($scope.sysModalInfo.timer);
            $scope.sysModalInfo.timer = null;
        }
        mainService.hideModal("common_sys_modal_back");
    }

    // //获取用户权限
    // $scope.getLoginUserRight = function () {
    //     mainService.getLoginUserRight({ body: {} }, function (res) {
    //         if (res.msret.msgcode == "00") {
    //             if (res.body.length > 0) {
    //                 switch (Number(res.body[0].rightlv)) {
    //                     case 10:
    //                         $scope.currentUserLvdes = "策略组合管理人";
    //                         break;
    //                     case 50:
    //                         $scope.currentUserLvdes = "产品管理员";
    //                         break;
    //                     case 70:
    //                         $scope.currentUserLvdes = "资产管理人";
    //                         break;
    //                     case 90:
    //                         $scope.currentUserLvdes = "全局管理人";
    //                         break;
    //                     default:
    //                         $scope.currentUserLvdes = "未知级别";
    //                         break;
    //                 }
    //                 mainService.currentOperator.rightlv = Number(res.body[0].rightlv);
    //                 //生成权限对象
    //                 angular.forEach(res.body, function (right) {
    //                     $rootScope.userRight[right.rightid] = Number(right.rightlv) >= Number(right.min_rightlv) ? Number(right.assigntype) : 0;
    //                 })
    //                 if ($rootScope.userRight["20100"] >= 3) {
    //                     $scope.mainClickPrimaryMenu("20000");
    //                     $rootScope.rootLoopMenu("20100");
    //                 }
    //             }
    //             $scope.$apply();
    //         }
    //         else {
    //             cms.message.error("读取权限失败.");
    //         }
    //     })
    // }

    //获取菜单权限
    $scope.getUserMenuRight = function () {
        mainService.getUserMenuRight({ serviceid: $rootScope.serviceid["ccms-server"], body: {rootid: 2, depth: 4} }, function (data) {
            console.log(data);
            if (data.error) {
                cms.message.error(data.error.msg);
                return;
            }

            if (data.res.length > 0) {
                console.log(data.res);
                console.log('获取菜单id列表-------');
                angular.forEach(data.res, function (right) {
                    $rootScope.menuRight.push(right.menuid);
                })
                if ($rootScope.menuRight.indexOf(2001001) != -1) {
                    $scope.mainClickPrimaryMenu(2001);
                    $rootScope.rootLoopMenu(2001001);
                } else {
                    for (var i = 0; i < $rootScope.menuRight.length; ++i) {
                        var menuid = $rootScope.menuRight[i];
                        if (String(menuid).length == 7) {
                            var sub_menuid = parseInt(menuid / 1000);
                            $scope.mainClickPrimaryMenu(sub_menuid);
                            $rootScope.rootLoopMenu(menuid);
                            break;
                        }
                    }
                }
            }
            $scope.$apply();
            console.log($rootScope.menuRight);
        })
    }

    $rootScope.rootLoopMenu = function (menuid) {
        var key = false;
        angular.forEach($scope.secondaryOpenMenuList, function (menu) {
            if (menu.id == menuid) {
                menu.active = true;
                key = true;
            }
            else {
                menu.active = false;
            }
        })
        angular.forEach($scope.secondaryMenuList, function (menu) {
            if (menu.id == menuid) {
                menu.active = true;
            }
            else {
                menu.active = false;
            }
        })
        if (key == false) {
            for (var i = 0; i < $scope.menuList.length; i++) {
                if ($scope.menuList[i].id == menuid) {
                    var newMenu = {};
                    newMenu.parent = $scope.menuList[i].parent;
                    newMenu.id = $scope.menuList[i].id;
                    newMenu.title = $scope.menuList[i].title;
                    newMenu.pagePath = $scope.menuList[i].pagePath;
                    newMenu.active = true;
                    //加载js
                    var loadList = [];
                    if ($scope.menuList[i].servicePath && $scope.menuList[i].servicePath != "") {
                        loadList.push($scope.menuList[i].servicePath);
                    }
                    if ($scope.menuList[i].controllerPath && $scope.menuList[i].controllerPath != "") {
                        loadList.push($scope.menuList[i].controllerPath);
                    }
                    if ($scope.menuList[i].cssPath && $scope.menuList[i].cssPath != "") {
                        loadList.push($scope.menuList[i].cssPath);
                    }
                    if (loadList.length > 0) {
                        $ocLazyLoad.load(loadList).then(function () {
                            $scope.secondaryOpenMenuList.push(newMenu);
                            $timeout(function () {
                                $scope.mainResetTabWidth();
                            }, 0);
                        })
                    }
                    else {
                        $scope.secondaryOpenMenuList.push(newMenu);
                        $timeout(function () {
                            $scope.mainResetTabWidth();
                        }, 0);
                    }
                }
            }
        }
    }

    //页面加载完毕
    $scope.$watch('$viewContentLoaded', function () {
        //初始化标题栏事件
        // mainService.registerTitleBar("main_title_bar");
        // mainService.registerTitleBar("main_lock_box" ,2);
        mainService.showMainWindow();
        window.onresize = function () {
            // $scope.showMax = mainService.getWindowState();
            // $scope.$apply();
            $timeout(function () {
                $scope.mainResetTabWidth();
            }, 0);
        };

        //先去读取一份内部配置并保存下来
        cms.readFile(path.join(__dirname, "..", "..", "userData.json"), function(err3, data3) {
            if (err3) {
                cms.message.error("读取行情站点信息失败");
            }
            if (data3.length) {
                try {
                    cms.inSideData = JSON.parse(data3);
                } catch (e) {
                    cms.message.error("读取用户数据失败");
                    return;
                }
            }
        })

        //读取配置，先读取包外的配置文件，如果包外没有配置，就读取内部配置，并拷贝一份到外边，如果外部存在
        //就将内部和外部对比
        cms.readFile("./userData.json", function(err1,data1) {
            if(err1) {
                console.log("外部文件不存在");
                //外部文件不存在
                cms.readFile(path.join(__dirname, "..", "..", "userData.json"), function(err, data) {
                    if (err) {
                        cms.message.error("读取行情站点信息失败");
                        return;
                    }
                    if (data.length) {
                        try {
                            cms.userData = JSON.parse(data);
                            cms.writeFile("./userData.json", JSON.stringify(cms.userData, null, "\t"), function (err) {
                                if (err) {
                                    cms.message.error("写用户信息文件失败");
                                    return;
                                }
                            });
                        } catch (e) {
                            cms.message.error("读取用户数据失败");
                            cms.userData.marketConfiguration = [];
                            return;
                        }
                    }

                    cmsNet.fgsLogin_setCallBack({ head: { pkgId: 2 } }, function (res) {
                        if (res.msret.msgcode != "00") {
                            cms.message.error("连接服务器出错." + res.msret.msg);
                            $scope.$apply();
                            return;
                        }
                    });
        
                    autoExportTableInfo();
                    //需要定时导出表格
                    $interval(autoExportTableInfo, 60000);
        
                    cms.deepCopy(cms.userData.marketConfiguration, $scope.allMarketCfg);
        
                    for (var i = 0; i < $scope.allMarketCfg.length; i++) {
                        $scope.allMarketCfg[i].station_psw = $scope.allMarketCfg[i].station_psw;
        
                        if ($scope.allMarketCfg[i].station_default == "1") {
                            $scope.currentMarketCfg = $scope.allMarketCfg[i];
                            $scope.usedMarketCfg = $scope.currentMarketCfg;
        
                            //连接行情
                            var loginData = {
                                head: { pkgId: 3 },
                                body: {
                                    maid: $scope.usedMarketCfg.station_maid, userid: parseInt($scope.usedMarketCfg.station_maid) * 10000 + parseInt($scope.usedMarketCfg.station_user),
                                    pass: $scope.usedMarketCfg.station_psw, md5: "", appname: "cms", version: $scope.clientVersion,
                                    fgs_ip: $scope.usedMarketCfg.station_addr, fgs_port: $scope.usedMarketCfg.station_port,
                                    dsn: "*", cpuid: "*", mac: "127.0.0.1", ip: "127.0.0.1", fgs_type: "marketConnection"
                                }
                            };
        
                            $scope.hq_connect = false;
        
                            cms.fgsLogin(loginData, function (res) {
                                if (res.msret.msgcode != 0) {
                                    // cms.message.error("连接行情服务器出错."+res.msret.msg);
                                    $scope.hq_connect = false;
                                    $scope.$apply();
                                    return;
                                }
        
                                $scope.hq_connect = true;
                                $scope.$apply();
                            });
                        }
                    }
                })
            } else {
                console.log("外部文件存在");
                // 当外部文件存在的时候去读取内部和外部文件，并做比较，如果内部的配置节点比外部的要多，就将内部的节点赋值给外部
                if (data1.length) {
                    cms.outSideData = JSON.parse(data1);
                    if (!cms.outSideData["lockScreenCfg"]) {
                        cms.outSideData["lockScreenCfg"] = cms.inSideData["lockScreenCfg"];
                        cms.writeFile("./userData.json", JSON.stringify(cms.outSideData, null, "\t"), function (err4) {
                            if (err4) {
                                cms.message.error("写用户信息文件失败");
                                return;
                            }
                        });
                    }
                    if (!cms.outSideData["marketConfiguration"]) {
                        cms.outSideData["marketConfiguration"] = cms.inSideData["marketConfiguration"];
                        cms.writeFile("./userData.json", JSON.stringify(cms.outSideData, null, "\t"), function (err5) {
                            if (err5) {
                                cms.message.error("写用户信息文件失败");
                                return;
                            }
                        });
                    }
                    try {
                        cms.userData = cms.outSideData;
                    } catch (e) {
                        cms.message.error("读取用户数据失败");
                        cms.userData.marketConfiguration = [];
                        return;
                    }
                }

                cmsNet.fgsLogin_setCallBack({ head: { pkgId: 2 } }, function (res) {
                    if (res.msret.msgcode != "00") {
                        cms.message.error("连接服务器出错." + res.msret.msg);
                        $scope.$apply();
                        return;
                    }
                });
    
                autoExportTableInfo();
                //需要定时导出表格
                $interval(autoExportTableInfo, 60000);
    
                cms.deepCopy(cms.userData.marketConfiguration, $scope.allMarketCfg);
    
                for (var i = 0; i < $scope.allMarketCfg.length; i++) {
                    $scope.allMarketCfg[i].station_psw = $scope.allMarketCfg[i].station_psw;
    
                    if ($scope.allMarketCfg[i].station_default == "1") {
                        $scope.currentMarketCfg = $scope.allMarketCfg[i];
                        $scope.usedMarketCfg = $scope.currentMarketCfg;
    
                        //连接行情
                        var loginData = {
                            head: { pkgId: 3 },
                            body: {
                                maid: $scope.usedMarketCfg.station_maid, userid: parseInt($scope.usedMarketCfg.station_maid) * 10000 + parseInt($scope.usedMarketCfg.station_user),
                                pass: $scope.usedMarketCfg.station_psw, md5: "", appname: "cms", version: $scope.clientVersion,
                                fgs_ip: $scope.usedMarketCfg.station_addr, fgs_port: $scope.usedMarketCfg.station_port,
                                dsn: "*", cpuid: "*", mac: "127.0.0.1", ip: "127.0.0.1", fgs_type: "marketConnection"
                            }
                        };
    
                        $scope.hq_connect = false;
    
                        cms.fgsLogin(loginData, function (res) {
                            if (res.msret.msgcode != 0) {
                                // cms.message.error("连接行情服务器出错."+res.msret.msg);
                                $scope.hq_connect = false;
                                $scope.$apply();
                                return;
                            }
    
                            $scope.hq_connect = true;
                            $scope.$apply();
                        });
                    }
                }
            }
        })

        // 行情相关,读取行情数据和用户锁屏设置
        // cms.readFile(path.join(__dirname, "..", "..", "userData.json"), function (err, data) {
        //     if (err) {
        //         cms.message.error("读取行情站点信息失败");
        //         return;
        //     }
        //     if (data.length) {
        //         try {
        //             cms.userData = JSON.parse(data);
        //         } catch (e) {
        //             cms.message.error("读取用户数据失败");
        //             cms.userData.marketConfiguration = [];
        //             return;
        //         }
        //     }

        //     cmsNet.fgsLogin_setCallBack({ head: { pkgId: 2 } }, function (res) {
        //         if (res.msret.msgcode != "00") {
        //             cms.message.error("连接服务器出错." + res.msret.msg);
        //             $scope.$apply();
        //             return;
        //         }
        //     });

        //     autoExportTableInfo();
        //     //需要定时导出表格
        //     $interval(autoExportTableInfo, 60000);

        //     cms.deepCopy(cms.userData.marketConfiguration, $scope.allMarketCfg);

        //     for (var i = 0; i < $scope.allMarketCfg.length; i++) {
        //         $scope.allMarketCfg[i].station_psw = $scope.allMarketCfg[i].station_psw;

        //         if ($scope.allMarketCfg[i].station_default == "1") {
        //             $scope.currentMarketCfg = $scope.allMarketCfg[i];
        //             $scope.usedMarketCfg = $scope.currentMarketCfg;

        //             //连接行情
        //             var loginData = {
        //                 head: { pkgId: 3 },
        //                 body: {
        //                     maid: $scope.usedMarketCfg.station_maid, userid: parseInt($scope.usedMarketCfg.station_maid) * 10000 + parseInt($scope.usedMarketCfg.station_user),
        //                     pass: $scope.usedMarketCfg.station_psw, md5: "", appname: "cms", version: $scope.clientVersion,
        //                     fgs_ip: $scope.usedMarketCfg.station_addr, fgs_port: $scope.usedMarketCfg.station_port,
        //                     dsn: "*", cpuid: "*", mac: "127.0.0.1", ip: "127.0.0.1", fgs_type: "marketConnection"
        //                 }
        //             };

        //             $scope.hq_connect = false;

        //             cms.fgsLogin(loginData, function (res) {
        //                 if (res.msret.msgcode != 0) {
        //                     // cms.message.error("连接行情服务器出错."+res.msret.msg);
        //                     $scope.hq_connect = false;
        //                     $scope.$apply();
        //                     return;
        //                 }

        //                 $scope.hq_connect = true;
        //                 $scope.$apply();
        //             });
        //         }
        //     }

        // });
    });

    //页面关闭
    $scope.$on("$destroy", function () {
        if ($scope.heartbeat != null) {
            $interval.cancel($scope.heartbeat);
            $scope.heartbeat = null;
        }
    });

    //只比较时分秒
    function compareTime(firstDate, secondDate) {
        if (firstDate.getHours() > secondDate.getHours()) {
            return 1;
        } else if (firstDate.getHours() == secondDate.getHours()) {
            if (firstDate.getMinutes() > secondDate.getMinutes()) {
                return 1;
            } else if (firstDate.getMinutes() == secondDate.getMinutes()) {

                if (firstDate.getSeconds() > secondDate.getSeconds()) {
                    return 1;
                } else if (firstDate.getSeconds() == secondDate.getSeconds()) {
                    return 0;
                }
                return -1;
            }
            return -1;
        }
        return -1;
    }

    function autoExportTableInfo() {
        var nowTime = new Date(),
            netInfoExportTime1 = new Date(cms.userData.netInfoCfg.exportTime1), netInfoExportTime2 = new Date(cms.userData.netInfoCfg.exportTime2), netInfoPrevTime = new Date(cms.userData.netInfoCfg.previousExportDate),
            unitPositionTime1 = new Date(cms.userData.unitPositionCfg.exportTime1), unitPositionTime2 = new Date(cms.userData.unitPositionCfg.exportTime2), positionPrevTime = new Date(cms.userData.unitPositionCfg.previousExportDate),
            tradingRecordTime1 = new Date(cms.userData.tradingRecordCfg.exportTime1), tradingRecordTime2 = new Date(cms.userData.tradingRecordCfg.exportTime2), recordPrevTime = new Date(cms.userData.tradingRecordCfg.previousExportDate);
        var nowDate = cms.formatDate_ex(nowTime);
        var hadExport = false;

        if ($rootScope.menuRight.indexOf(2004002) != -1 && cms.userData.netInfoCfg.autoExport) { //导出时间必须小于计划导出时间
            if (nowDate > cms.formatDate_ex(netInfoPrevTime) && compareTime(nowTime, netInfoExportTime1) > 0) {
                hadExport = true;
                cms.userData.netInfoCfg.previousExportDate = nowTime;
                autoExportNetInfo(1);
            } else if (nowDate == cms.formatDate_ex(netInfoPrevTime)) {

                if (compareTime(netInfoExportTime2, netInfoPrevTime) > 0 && compareTime(nowTime, netInfoExportTime2) > 0) {
                    hadExport = true;
                    cms.userData.netInfoCfg.previousExportDate = nowTime;
                    autoExportNetInfo(2);
                } else if (compareTime(netInfoExportTime1, netInfoPrevTime) > 0 && compareTime(nowTime, netInfoExportTime1) > 0) {
                    hadExport = true;
                    cms.userData.netInfoCfg.previousExportDate = nowTime;
                    autoExportNetInfo(1);
                }
            }
        }

        if ($rootScope.menuRight.indexOf(2004003) != -1 && cms.userData.unitPositionCfg.autoExport) { //导出时间必须小于计划导出时间
            if (nowDate > cms.formatDate_ex(positionPrevTime) && compareTime(nowTime, unitPositionTime1) > 0) {
                hadExport = true;
                cms.userData.unitPositionCfg.previousExportDate = nowTime;
                autoExportUnitPosition(1);
            } else if (nowDate == cms.formatDate_ex(positionPrevTime)) {
                if (compareTime(unitPositionTime2, positionPrevTime) > 0 && compareTime(nowTime, unitPositionTime2) > 0) {
                    hadExport = true;
                    cms.userData.unitPositionCfg.previousExportDate = nowTime;
                    autoExportUnitPosition(2);
                } else if (compareTime(unitPositionTime1, positionPrevTime) > 0 && compareTime(nowTime, unitPositionTime1) > 0) {
                    hadExport = true;
                    cms.userData.unitPositionCfg.previousExportDate = nowTime;
                    autoExportUnitPosition(1);
                }
            }
        }

        if ($rootScope.menuRight.indexOf(2004004) != -1 && cms.userData.tradingRecordCfg.autoExport) { //导出时间必须小于计划导出时间
            if (nowDate > cms.formatDate_ex(recordPrevTime) && compareTime(nowTime, tradingRecordTime1) > 0) {
                hadExport = true;
                cms.userData.tradingRecordCfg.previousExportDate = nowTime;
                autoExportTradingRecord(1);
            } else if (nowDate == cms.formatDate_ex(recordPrevTime)) {
                if (compareTime(tradingRecordTime2, recordPrevTime) > 0 && compareTime(nowTime, tradingRecordTime2) > 0) {
                    hadExport = true;
                    cms.userData.tradingRecordCfg.previousExportDate = nowTime;
                    autoExportTradingRecord(2);
                } else if (compareTime(tradingRecordTime1, recordPrevTime) > 0 && compareTime(nowTime, tradingRecordTime1) > 0) {
                    hadExport = true;
                    cms.userData.tradingRecordCfg.previousExportDate = nowTime;
                    autoExportTradingRecord(1);
                }
            }
        }

        if (hadExport) {
            //首先设置导出的时间,也就是不论成功与否只会导出一次
            cms.writeFile("./userData.json", JSON.stringify(cms.userData, null, "\t"), function (err) {
                if (err) {
                    cms.message.error("写用户信息文件失败");
                    return;
                }
                $scope.$apply();
            });
        }
    }

    function exportNetInfo(version, tridString) {
        var requestData = { body: { begin_date: cms.formatDate_ex(new Date()), end_date: cms.formatDate_ex(new Date()), trid: tridString, isToday: 1, page: 1, pageSize: 1000000 } };

        mainService.getCombStrategyNetInfo(requestData, function (res) {
            if (res.msret.msgcode != '00') {
                cms.message.error("获取组合的净值信息失败." + res.msret.msg);
                return;
            }

            var todayNetInfo = res.body.data;
            var today = cms.formatDate_ex(new Date());
            todayNetInfo.forEach(function (unitNetInfo) {
                unitNetInfo.trday = today;
                unitNetInfo.trid = parseInt(unitNetInfo.trid);
            });

            mainService.getUnitPositionInfo(requestData, function (res) {
                if (res.msret.msgcode != '00') {
                    cms.message.error("获取组合当日持仓数据失败." + res.msret.msg);
                    return;
                }
                var totalPosition = res.body.data;
                mainService.subscribeMarket(totalPosition);
                totalPosition.forEach(function (position) {
                    position.trid = parseInt(position.trid);
                });

                $scope.exportNetInfoCount = 0;
                $scope.exportNetInfoInterval = $interval(function () {
                    if (++$scope.exportNetInfoCount >= 30 ||
                        mainService.getUkeyMarketInfoForNetInfo(totalPosition, todayNetInfo)) {
                        $scope.exportNetInfoCount = -1;
                        $interval.cancel($scope.exportNetInfoInterval);
                        mainService.unsubscribeMarket(totalPosition);
                        var exportExceldata = [];
                        todayNetInfo.forEach(function (netInfo) {
                            exportExceldata.push([netInfo.trday, netInfo.trid, Number(netInfo.assets).toFixed(3), Number(netInfo.cost).toFixed(3),
                            Number(netInfo.cash).toFixed(3), Number(netInfo.percent).toFixed(3), Number(netInfo.value).toFixed(3)]);
                        });
                        var dataObj = {
                            data: exportExceldata, fileName: cms.formatDate_ex(new Date()) + "组合净值信息" + version, fileType: cms.userData.netInfoCfg.excelType,
                            headers: ["日期", "策略组合", "策略净值", "股票成本市值", "现金", "仓位", "股票最新市值"]
                        };
                        exportExcelFileWithoutSaveDialog(dataObj, cms.userData.netInfoCfg);
                    }
                }, 2000);
                $scope.$apply();
            });

        });
    }

    function autoExportNetInfo(version) {
        mainService.getCombStrategy({ body: {} }, function (res) {
            if (res.msret.msgcode != '00') {
                cms.message.error("获取组合当日持仓数据失败." + res.msret.msg);
                return;
            }
            if (!res.body.length) {
                cms.message.error("您当前没有任何组合,不导出净值." + res.msret.msg);
                return;
            }

            var tradeUnits = res.body, tradeUnitString = "";
            tradeUnitString += tradeUnits[0].trid;
            for (var i = 1; i < tradeUnits.length; i++) {
                tradeUnitString += "," + tradeUnits[i].trid;
            }
            exportNetInfo(version, tradeUnitString);

        });

    }





    function autoExportUnitPosition(version) {
        //首先设置导出的时间,也就是不论成功与否只会导出一次
        cms.userData.unitPositionCfg.previousExportDate = new Date();
        cms.writeFile("./userData.json", JSON.stringify(cms.userData, null, "\t"), function (err) {
            if (err) {
                cms.message.error("写用户信息文件失败");
                return;
            }
            $scope.$apply();
        });

        mainService.getCombStrategy({ body: {} }, function (res) {
            if (res.msret.msgcode != '00') {
                cms.message.error("获取组合失败." + res.msret.msg);
                return;
            }
            var tradeUnits = res.body;
            if (!tradeUnits.length) {
                cms.message.success("当前没有任何组合的权限,不导出报表");
                return;
            } else {
                var requestData = {
                    body: {
                        begin_date: cms.formatDate_ex(new Date()), end_date: cms.formatDate_ex(new Date()),
                        page: 1, isToday: 1, pageSize: 1000000
                    }
                };
                requestData.body.trid = String(tradeUnits[0].trid);
                for (var i = 1; i < tradeUnits.length; i++) {
                    requestData.body.trid += "," + tradeUnits[i].trid;
                }

                mainService.getUnitPositionInfo(requestData, function (res) {
                    if (res.msret.msgcode != '00') {
                        cms.message.error("获取组合当日持仓数据失败." + res.msret.msg);
                        return;
                    }
                    var totalPosition = res.body.data;
                    // console.log("autoExportUnitPosition", totalPosition);
                    var today = cms.formatDate_ex(new Date());
                    mainService.subscribeMarket(totalPosition);
                    totalPosition.forEach(function (position) {
                        position.trday = today;

                        switch (position.direction) {
                            case "1":
                                position.directionStr = "买";
                                break;
                            case "2":
                                position.directionStr = "卖";
                                break;
                            default:
                        }
                        switch (position.satype) {
                            case "10":
                                position.satypeStr = "底仓";
                                break;
                            case "11":
                                position.satypeStr = "外部底仓";
                            case "20":
                                position.satypeStr = "预约券";
                                break;
                            case "21":
                                position.satypeStr = "市场券";
                                break;
                            default:
                        }

                    });

                    $scope.exportUnitPositionCount = 0;
                    $scope.exportUnitPositionInterval = $interval(function () {
                        if (++$scope.exportUnitPositionCount >= 30 ||
                            mainService.getUkeyMarketInfo(totalPosition)) {
                            $interval.cancel($scope.exportUnitPositionInterval);
                            $scope.exportUnitPositionCount = -1;
                            mainService.unsubscribeMarket(totalPosition);

                            var exportExceldata = [];
                            totalPosition.forEach(function (obj) {
                                exportExceldata.push([obj.trday, obj.trid, obj.tracid, obj.marketcode, obj.directionStr, obj.satypeStr, obj.totalvol,
                                Number(obj.holdcost).toFixed(3), Number(obj.buyamt).toFixed(3), obj.validvol, obj.onwayvol, Number(obj.price).toFixed(3), Number(obj.value).toFixed(3)]);
                            });

                            var dataObj = {
                                data: exportExceldata, fileName: cms.formatDate_ex(new Date()) + "组合持仓信息" + version, fileType: cms.userData.unitPositionCfg.excelType,
                                headers: ["日期", "策略组合", "交易账户", "股票代码", "买卖方向", "持仓类型", "持股数量", "持仓成本",
                                    "买入金额", "可交易股数", "不可交易股数", "最新价格", "最新市值"]
                            };

                            exportExcelFileWithoutSaveDialog(dataObj, cms.userData.unitPositionCfg);
                        }
                    }, 2000);
                });

            }

        });


    }

    function autoExportTradingRecord(version) {
        var requestData = { body: {} };
        mainService.getCombStrategy(requestData, function (res) {
            if (res.msret.msgcode != '00') {
                cms.message.error("获取所有的组合策略失败." + res.msret.msg);
                return;
            }
            var tradeUnits = res.body, tradeyUnitString;
            if (tradeUnits.length) {
                tradeyUnitString = String(tradeUnits[0].trid);
                for (var i = 1; i < tradeUnits.length; i++) {
                    tradeyUnitString += "," + String(tradeUnits[i].trid);
                }

                requestData = {
                    body: {
                        begin_date: cms.formatDate_ex(new Date()), end_date: cms.formatDate_ex(new Date()),
                        pageSize: 1000000, page: 1, isToday: 1, trid: tradeyUnitString
                    }
                };
                mainService.getTradingRecord(requestData, function (res) {
                    if (res.msret.msgcode != '00') {
                        cms.message.error("获取组合的交易信息失败." + res.msret.msg);
                        return;
                    }

                    var exportData = res.body.data, exportExceldata = [];
                    exportData.forEach(function (obj) {
                        exportExceldata.push([obj.trday, obj.trid, obj.direction, obj.begin, obj.end,
                        obj.marketcode, obj.tradevol, Number(obj.avgprice).toFixed(3)]);
                    });

                    var dataObj = {
                        data: exportExceldata, fileName: cms.formatDate_ex(new Date()) + "组合交易汇总信息" + version, fileType: cms.userData.tradingRecordCfg.excelType,
                        headers: ["日期", "策略组合", "交易方向", "交易开始时间", "交易结束时间", "股票代码", "数量", "均价"]
                    };

                    exportExcelFileWithoutSaveDialog(dataObj, cms.userData.tradingRecordCfg);


                });
            } else {
                var dataObj = {
                    data: [], fileName: cms.formatDate_ex(new Date()) + "组合交易汇总信息" + version, fileType: cms.userData.tradingRecordCfg.excelType,
                    headers: ["日期", "策略组合", "交易方向", "交易开始时间", "交易结束时间", "股票代码", "数量", "均价"]
                };
                exportExcelFileWithoutSaveDialog(dataObj, cms.userData.tradingRecordCfg);
            }



        });
    }

    //fileName包含了所有的路径
    function exportExcelFileWithoutSaveDialog(dataObj, userDataCfg) {

        cmsFile.exportExcelFileWithoutSaveDialog(dataObj, function (err, res) {
            if (err) return;  //不需要处理??????????????

            if (!res.result) {
                cms.message.error("导出" + dataObj.fileName + "失败。" + res.reason);
                return;
            }
            cms.message.success("导出" + dataObj.fileName + "成功");

        }, cmsFile.join(userDataCfg.path, (dataObj.fileName + "." + userDataCfg.excelType)));
    }

    //新页面函数
    $scope.mainClickPrimaryMenu = function (id) {
        if ($rootScope.menuRight.indexOf(id) == -1) {
            return;
        }
        if ($scope.primaryMenu == id) {
            $scope.showSecondaryMenu = true;
            return;
        }
        $scope.primaryMenu = id;
        $scope.showSecondaryMenu = true;
        $scope.secondaryMenuList.splice(0, $scope.secondaryMenuList.length);
        angular.forEach($scope.menuList, function (menu) {
            if (menu.parent == id && menu.leaf == true) {
                var tmp = {};
                tmp.parent = id;
                tmp.id = menu.id;
                tmp.title = menu.title;
                tmp.active = false;
                tmp.pagePath = menu.pagePath;
                tmp.controllerPath = menu.controllerPath;
                tmp.servicePath = menu.servicePath;
                tmp.cssPath = menu.cssPath;
                $scope.secondaryMenuList.push(tmp);
            }
        })
        //设置选中
        if ($scope.secondaryOpenMenuList.length == 0) {
            return;
        }
        var activeMenuId = "";
        for (var i = 0; i < $scope.secondaryOpenMenuList.length; i++) {
            if ($scope.secondaryOpenMenuList[i].active == true) {
                activeMenuId = $scope.secondaryOpenMenuList[i].id;
            }
        }
        angular.forEach($scope.secondaryMenuList, function (menu) {
            if (menu.id == activeMenuId) {
                menu.active = true;
            }
        })
    }

    //广播选中的菜单
    $scope.mainBroadcastMenuChange = function (id) {
        $scope.$broadcast("mainMenuChange", { menuId: id });
    }

    //点击二级菜单
    $scope.mainClickSecondaryMenu = function (index) {
        var nowMenu = $scope.secondaryMenuList[index];
        // 这里注释权限控制,因为没有添加合规风控控制的id
        // if ($rootScope.menuRight.indexOf(nowMenu.id) == -1) {
        //     return;
        // }
        var key = false;
        angular.forEach($scope.secondaryMenuList, function (menu) {
            if (menu.id == nowMenu.id) {
                menu.active = true;
            }
            else {
                menu.active = false;
            }
        })
        angular.forEach($scope.secondaryOpenMenuList, function (menu) {
            if (menu.id == nowMenu.id) {
                menu.active = true;
                key = true;
            }
            else {
                menu.active = false;
            }
        })
        if (!key) {
            var newMenu = {};
            newMenu.parent = nowMenu.parent;
            newMenu.id = nowMenu.id;
            newMenu.title = nowMenu.title;
            newMenu.pagePath = nowMenu.pagePath;
            newMenu.active = true;
            //加载js
            var loadList = [];
            if (nowMenu.servicePath && nowMenu.servicePath != "") {
                loadList.push(nowMenu.servicePath);
            }
            if (nowMenu.controllerPath && nowMenu.controllerPath != "") {
                loadList.push(nowMenu.controllerPath);
            }
            if (nowMenu.cssPath && nowMenu.cssPath != "") {
                loadList.push(nowMenu.cssPath);
            }
            if (loadList.length > 0) {
                $ocLazyLoad.load(loadList).then(function () {
                    $scope.secondaryOpenMenuList.push(newMenu);
                    $scope.mainBroadcastMenuChange(newMenu.id);
                    $timeout(function () {
                        $scope.mainResetTabWidth();
                    }, 0);
                })
            }
            else {
                $scope.secondaryOpenMenuList.push(newMenu);
                $scope.mainBroadcastMenuChange(newMenu.id);
                $timeout(function () {
                    $scope.mainResetTabWidth();
                }, 0);
            }
        }
        else {
            $scope.mainBroadcastMenuChange(nowMenu.id);
        }
    }

    $scope.mainClickBodyTab = function (index) {
        angular.forEach($scope.secondaryOpenMenuList, function (menu) {
            menu.active = false;
        })
        $scope.secondaryOpenMenuList[index].active = true;
        angular.forEach($scope.secondaryMenuList, function (menu) {
            if (menu.id == $scope.secondaryOpenMenuList[index].id) {
                menu.active = true;
            }
            else {
                menu.active = false;
            }
        })
        $scope.mainBroadcastMenuChange($scope.secondaryOpenMenuList[index].id);
    }

    $scope.mainCloseBodyTab = function (index) {
        if ($scope.secondaryOpenMenuList[index].active == true) {
            $scope.secondaryOpenMenuList.splice(index, 1);
            if ($scope.secondaryOpenMenuList.length > 0) {
                if (index >= $scope.secondaryOpenMenuList.length) {
                    var nowMenu = $scope.secondaryOpenMenuList[index - 1];
                    $scope.secondaryOpenMenuList[index - 1].active = true;
                    $scope.mainBroadcastMenuChange($scope.secondaryOpenMenuList[index - 1].id);
                    angular.forEach($scope.secondaryMenuList, function (menu) {
                        if (menu.id == $scope.secondaryOpenMenuList[index - 1].id) {
                            menu.active = true;
                        }
                        else {
                            menu.active = false;
                        }
                    })
                }
                else {
                    var nowMenu = $scope.secondaryOpenMenuList[index];
                    $scope.secondaryOpenMenuList[index].active = true;
                    $scope.mainBroadcastMenuChange($scope.secondaryOpenMenuList[index].id);
                    angular.forEach($scope.secondaryMenuList, function (menu) {
                        if (menu.id == $scope.secondaryOpenMenuList[index].id) {
                            menu.active = true;
                        }
                        else {
                            menu.active = false;
                        }
                    })
                }
            }
            else {
                angular.forEach($scope.secondaryMenuList, function (menu) {
                    menu.active = false;
                })
            }
        }
        else {
            $scope.secondaryOpenMenuList.splice(index, 1);
        }
        $scope.mainResetTabWidth();
    }

    //关闭所有标签
    $scope.mainCloseAlTab = function () {
        $scope.secondaryOpenMenuList.splice(0, $scope.secondaryOpenMenuList.length);
        angular.forEach($scope.secondaryMenuList, function (menu) {
            menu.active = false;
        })
    }

    //重新设置标签宽度
    $scope.mainResetTabWidth = function () {
        var tab = document.getElementById("main_body_tab_div");
        if (tab) {
            var tabWidth = tab.offsetWidth;
            var normalList = document.getElementsByClassName('main_body_tab_active_item');
            var activeList = document.getElementsByClassName('main_body_tab_item');
            var blankList = document.getElementsByClassName('main_body_tab_item_blank');
            if (tabWidth >= $scope.secondaryOpenMenuList.length * 121 + 20) {
                angular.forEach(normalList, function (item) {
                    item.style.width = "120px";
                })
                angular.forEach(activeList, function (item) {
                    item.style.width = "120px";
                })
                angular.forEach(blankList, function (item) {
                    var temp = tabWidth - $scope.secondaryOpenMenuList.length * 121;
                    item.style.width = temp + "px";
                })
            }
            else {
                var newWidth = (tabWidth - 20) / $scope.secondaryOpenMenuList.length - 1;
                if (newWidth <= 35) {
                    newWidth = (tabWidth - 56) / ($scope.secondaryOpenMenuList.length - 1) - 1;
                }
                angular.forEach(normalList, function (item) {
                    item.style.width = newWidth + "px";
                })
                angular.forEach(activeList, function (item) {
                    item.style.width = newWidth + "px";
                })
                angular.forEach(blankList, function (item) {
                    item.style.width = "20px";
                })
            }
        }
    }

    //收起或者打开二级菜单
    $scope.mainFoldSecondaryMenu = function () {
        if ($scope.secondaryMenuList.length == 0) {
            return;
        }
        $scope.showSecondaryMenu = !$scope.showSecondaryMenu;
        $timeout(function () {
            $scope.mainResetTabWidth();
        }, 0);
    }

    //点击设置
    $scope.mainClickUserMenu = function (ev) {
        if ($scope.showTitleUserMenu == true) {
            $scope.showTitleUserMenu = false;
            document.body.removeEventListener('click', $scope.mainCLickBody, false);
            return;
        }
        $scope.showTitleUserMenuAuto = true;
        $scope.showTitleUserMenu = true;
        ev.preventDefault();
        document.body.addEventListener('click', $scope.mainCLickBody, false);
    }

    //点击body
    $scope.mainCLickBody = function (e) {
        if ($scope.showTitleUserMenu == true && $scope.showTitleUserMenuAuto == false) {
            $scope.showTitleUserMenu = false;
            $scope.$apply();
            document.body.removeEventListener('click', $scope.mainCLickBody, false);
        }
        $scope.showTitleUserMenuAuto = false;
        e.preventDefault();
    }

    //显示弹框
    $scope.mainShowModal = function (state) {
        $scope.modalInfo.state = state;
        switch (state) {
            case $scope.modalInfo.stateEnum.changepasstip:
                $scope.modalInfo.path = "../mainwindow/changepasstip.html";
                break;
            case $scope.modalInfo.stateEnum.changepass:
                $scope.modalInfo.path = "../mainwindow/changepass.html";
                break;
            case $scope.modalInfo.stateEnum.loginout:
                $scope.modalInfo.path = "../mainwindow/loginout.html";
                break;
            case $scope.modalInfo.stateEnum.relogin:
                $scope.modalInfo.path = "../mainwindow/relogin.html";
                break;
            default:
                break;
        }
    }

    //弹框加载完成
    $scope.mainModalLoadReady = function () {
        switch ($scope.modalInfo.state) {
            case $scope.modalInfo.stateEnum.changepasstip:
                mainService.showModal("main_modal_back", "main_change_tip_modal", "main_change_tip_modal_title");
                break;
            case $scope.modalInfo.stateEnum.changepass:
                $scope.inputErrorTips = {
                    oldPwd: "",
                    newPwd: "",
                    beSurePwd: ""
                }

                mainService.getGlobalConfig({ "body": {} }, function (res1) {
                    if (res1.msret.msgcode !== "00" || res1.body.length == 0) {
                        cms.message.error("版本有问题，请勿使用");
                        return;
                    }
                    for (var i = 0; i < res1.body.length; ++i) {
                        var data = res1.body[i];
                        if (data.cfgid == "passwd_complexity") {
                            $rootScope.passwordType = Number(data.cfgvalue);
                            if ($rootScope.passwordType == 0) {
                                $scope.placeholderText = "8-20位，任意字母、数字或者特殊字符均可";
                            } else if ($rootScope.passwordType == 1) {
                                $scope.placeholderText = "8-20位，需同时包含数字、字母、特殊字符";
                            }  
                        }                
                    }
                });              
                
                mainService.showModal("main_modal_back", "main_change_modal", "main_change_modal_title");
                break;
            case $scope.modalInfo.stateEnum.loginout:
                mainService.showModal("main_modal_back", "main_close_tip_modal", "main_close_tip_modal_title");
                break;
            case $scope.modalInfo.stateEnum.relogin:
                mainService.showModal("main_modal_back", "main_relogin_tip_modal", "main_relogin_tip_modal_title");
                break;
            case "setMarketInfo":
                mainService.showModal("main_modal_back", "marketInfoCfg_set_modal", "marketInfoCfg_set_modal_title");
                break;
            default:
                break;
        }
    }

    //二级弹框加载完成
    $scope.mainModalLv2LoadReady = function () {
        switch ($scope.modalInfoLv2.state) {
            case "marketInfoCfgDetail":
                mainService.showModal("main_modal_back_lv2", "marketInfoCfg_detail_modal", "marketInfoCfg_detail_modal_title");
                break;
            case "fgsLogout":
                mainService.showModal("main_modal_back_lv2", "main_fgsLogout_modal", "main_fgsLogout_modal_title");
                break;
            case "changeMarketInfo":
                mainService.showModal("main_modal_back_lv2", "marketInfoCfg_change_modal", "marketInfoCfg_change_modal_title");
                break;
            case "addMarketInfo":
                mainService.showModal("main_modal_back_lv2", "marketInfoCfg_add_modal", "marketInfoCfg_add_modal_title");
                break;
            case "deleteMarketInfo":
                mainService.showModal("main_modal_back_lv2", "marketInfoCfg_delete_modal", "marketInfoCfg_delete_modal_title");
                break;
            default:
                break;
        }
    }

    //关闭弹框
    $scope.mainHideModal = function () {
        if ($scope.modalInfo.state === $scope.modalInfo.stateEnum.changepass && $scope.changePassInfo.forceChange === true) {
            $scope.loginOut();
        }
        $scope.modalInfo.state = 0;
        $scope.modalInfo.path = "";
        mainService.hideModal("main_modal_back");
    }

    //关闭二级弹框
    $scope.mainHideModalLv2 = function () {
        $scope.modalInfoLv2.state = 0;
        $scope.modalInfoLv2.path = "";
        mainService.hideModal("main_modal_back_lv2");
    }

    //修改密码
    $scope.mainChangePassword = function () {
        $scope.mainShowModal($scope.modalInfo.stateEnum.changepasstip);
    }

    $scope.mainChangePasswordNext = function () {
        $scope.changePassInfo.forceChange = false;
        $scope.changePassInfo.oid = $scope.userInfo.oid;
        $scope.changePassInfo.oldpass = "";
        $scope.changePassInfo.newpass = "";
        $scope.changePassInfo.passrep = "";
        $scope.mainShowModal($scope.modalInfo.stateEnum.changepass);
    }
    $scope.pwdInputBlur = function () {
        let tips = mainService.pwdInputBlur($scope.changePassInfo.newpass, $scope.inputErrorTips.newPwd, $scope.changePassInfo.passrep, $scope.inputErrorTips.beSurePwd, $scope.changePassInfo.oldpass, $scope.inputErrorTips.oldPwd, $rootScope.passwordType);
        $scope.inputErrorTips.newPwd = tips.pwdTip;
        $scope.inputErrorTips.beSurePwd = tips.beSurePwdTip;
    }
    $scope.beSurePwdInputBlur = function () {
        let tips = mainService.beSurePwdInputBlur($scope.changePassInfo.newpass, $scope.inputErrorTips.newPwd, $scope.changePassInfo.passrep, $scope.inputErrorTips.beSurePwd, $rootScope.passwordType);
        $scope.inputErrorTips.newPwd = tips.pwdTip;
        $scope.inputErrorTips.beSurePwd = tips.beSurePwdTip;
    }
    $scope.oldPwdInputBlur = function () {
        if ($scope.changePassInfo.oldpass == "") {
            $scope.inputErrorTips.oldPwd = "原密码不能为空";
            return;
        } else {
            $scope.inputErrorTips.oldPwd = "";
            if ($scope.changePassInfo.oldpass == $scope.changePassInfo.newpass) {
                $scope.inputErrorTips.newPwd = "修改密码与原密码不能一致";
                return;
            } else {
                $scope.inputErrorTips.newPwd = "";
            }
        }
    }
    //确认修改密码
    $scope.mainChangePasswordSure = function () {
        if ($scope.changePassInfo.oldpass == "") {
            $scope.inputErrorTips.oldPwd = "原密码不能为空";
            return;
        }
        if ($scope.changePassInfo.newpass == "") {
            $scope.inputErrorTips.newPwd = "新密码不能为空";
            return;
        }
        if ($scope.changePassInfo.oldpass == $scope.changePassInfo.newpass) {
            $scope.inputErrorTips.newPwd = "修改密码与原密码不能一致";
            return;
        }
        if ($scope.changePassInfo.passrep == "") {
            $scope.inputErrorTips.beSurePwd = "确认密码不能为空";
            return;
        }
        if ($scope.inputErrorTips.oldPwd != "" || $scope.inputErrorTips.newPwd != "" || $scope.inputErrorTips.beSurePwd != "") {
            return;
        }
        var requestData = {
            "user_id": $scope.changePassInfo.oid,
            "password": mainService.getPasswordMd5("pass", $scope.changePassInfo.newpass),
            "old_password": mainService.getPasswordMd5("pass", $scope.changePassInfo.oldpass),
        };

		mainService.casUserChange({ serviceid: $rootScope.serviceid["cas"], body: requestData }, function (ret) {
			console.log(ret);
			if (ret.data.ret_code != 0) {
				cms.message.error("修改密码失败." + ret.data.ret_msg);
				return;
			}
            //重新登录
            $scope.changePassInfo.forceChange = false;
            $scope.mainRelogin();
		});
    }

    //提示退出
    $scope.mainCloseWindowTip = function () {
        $scope.mainShowModal($scope.modalInfo.stateEnum.loginout);
    }

    //重新登录提示
    $scope.mainReloginTip = function () {
        $scope.mainShowModal($scope.modalInfo.stateEnum.relogin);
    }

    //打开系统设置弹框
    $scope.clickMarketInfo = function () {
        console.log($scope.currentMarketCfg);
        for(var i = 0; i< $scope.allMarketCfg.length;i++) {
            if ($scope.allMarketCfg[i]["station_default"] === "1") {
                $scope.currentMarketCfg = $scope.allMarketCfg[i];
            }
        }
        console.log('打开行情站点设置');
        $scope.isDiabledSettime["isOpen"] = cms.userData["lockScreenCfg"]["isOpen"];
        $scope.isDiabledSettime["time"] = cms.userData["lockScreenCfg"]["time"];
        if ($scope.isDiabledSettime.isOpen) {
            $scope.isDisableLockInput = false;
        } else {
            $scope.isDisableLockInput = true;
        }
        console.log(cms.userData["lockScreenCfg"]["isOpen"]);
        console.log($scope.isDiabledSettime);
        console.log("+++++++++++++++++");
        $scope.modalInfo.path = "./marketInfoCfg/setMarketInfo.html";
        $scope.modalInfo.state = "setMarketInfo";

    }
    //打开修改行情站点弹框
    $scope.changeMarketInfo = function() {
        //将当前选中的数据赋值一份给修改弹框
        cms.deepCopy($scope.currentMarketCfg, $scope.changeMarketData);
        resetMarketCfgCopy($scope.changeMarketData);
        $scope.modalInfoLv2.path = "./marketInfoCfg/changeMarketCfg.html";
        $scope.modalInfoLv2.state = "changeMarketInfo";
    }

    //打开新增行情站点的弹框
    $scope.addMarketInfo = function() {
        cms.deepCopy($scope.currentMarketCfg, $scope.addMarketData);
        resetMarketCfgCopy($scope.addMarketData);
        $scope.addMarketData.station_name_copy = "";
        $scope.addMarketData.station_addr_copy = "";
        $scope.addMarketData.station_port_copy = "";
        $scope.modalInfoLv2.path = "./marketInfoCfg/addMarketCfg.html";
        $scope.modalInfoLv2.state = "addMarketInfo";
    }

    //点击添加站点行情弹框的确定按钮
    $scope.confirmAddMarketInfo = function(newMarketCfg) {
        setMarketCfgFromCopy(newMarketCfg);
        console.log(newMarketCfg);
        var addMarketCfgObj = {};
        if ($scope.addMarketData.station_name_copy === "") {
            cms.message.error("站点名称不可以为空");
            return;
        } else if ($scope.addMarketData.station_addr_copy === "") {
            cms.message.error("IP地址不可以为空");
            return;
        } else if ($scope.addMarketData.station_port_copy === "") {
            cms.message.error("端口号不可以为空");
            return;
        } else {
            if ($scope.allMarketCfg.length) {
                console.log("userData不为空");
                var lastObj = $scope.allMarketCfg[$scope.allMarketCfg.length - 1];
                var nowID = parseInt(lastObj.station_id);
                nowID = isNaN(nowID) ? 0 : nowID + 1;
                addMarketCfgObj.station_id = nowID;
                addMarketCfgObj.station_name = newMarketCfg.station_name;
                addMarketCfgObj.station_maid = newMarketCfg.station_maid;
                addMarketCfgObj.station_user = newMarketCfg.station_user;
                addMarketCfgObj.station_psw = newMarketCfg.station_psw;
                addMarketCfgObj.station_addr = newMarketCfg.station_addr;
                addMarketCfgObj.station_port = newMarketCfg.station_port;
                addMarketCfgObj.station_default = "0";
                addMarketCfgObj.system_station = "0";
            } else {
                console.log("userData为空");
                addMarketCfgObj = {
                    station_name: "station_name", station_id: 0, station_maid: "station_maid",
                    station_user: "station_user", station_psw: "BB",
                    station_addr: "0.0.0.0", station_port: "0",
                    station_default: "1", system_station: "0",
                };
    
            }
            console.log(addMarketCfgObj);
            cms.userData.marketConfiguration.push(addMarketCfgObj);
            cms.writeFile("./userData.json", JSON.stringify(cms.userData, null, "\t"), function (err) {
                $scope.mainHideModalLv2();//关闭二级弹框
                if (err) {
                    cms.message.error("写用户信息文件失败");
                    return;
                }
                $scope.allMarketCfg.push(addMarketCfgObj);
                cms.message.success("添加行情站点信息成功");
                $scope.$apply();
    
            });
        }
    }

    //打开删除行情站点的弹框
    $scope.deleteMarketInfo = function() {
        cms.deepCopy($scope.currentMarketCfg, $scope.deleteMarketData);
        $scope.modalInfoLv2.path = "./marketInfoCfg/deleteMarketCfg.html";
        $scope.modalInfoLv2.state = "deleteMarketInfo";
    }

    //点击删除行情站点弹框的确认按钮
    $scope.confirmDeleteMarketInfo = function() {
        var deleteIndex = 0;//获取当前要删除的元素在数组中的index位置
        for(var i = 0; i< $scope.allMarketCfg.length; i++) {
            if ($scope.deleteMarketData["station_id"] === $scope.allMarketCfg[i]["station_id"]) {
                deleteIndex = i;
            }
        }
        cms.userData.marketConfiguration.splice(deleteIndex,1);
        $scope.allMarketCfg.splice(deleteIndex, 1);
        if (($scope.deleteMarketData.station_default === "1") && $scope.allMarketCfg.length) {
            $scope.allMarketCfg[0].station_default = "1";
            cms.userData.marketConfiguration[0].station_default = "1";
        }
        cms.writeFile("./userData.json", JSON.stringify(cms.userData, null, "\t"), function (err) {
            $scope.mainHideModal();
            $scope.mainHideModalLv2();
            if (err) {
                cms.message.error("写用户信息文件失败");
                return;
            }
            console.log($scope.currentMarketCfg);
            console.log("+++++++++++++++++++");
            cms.message.success("删除行情站点信息成功");
            $scope.$apply();
        });
    }

    function resetMarketCfgCopy(obj) {
        obj.station_default_copy = obj.station_default;
        obj.station_name_copy = obj.station_name;
        obj.station_maid_copy = obj.station_maid;
        obj.station_user_copy = obj.station_user;
        obj.station_psw_copy = obj.station_psw;
        obj.station_addr_copy = obj.station_addr;
        obj.station_port_copy = obj.station_port;
    }

    function setMarketCfgFromCopy(obj) {
        obj.station_default = obj.station_default_copy;
        obj.station_name = obj.station_name_copy;
        obj.station_maid = obj.station_maid_copy;
        obj.station_user = obj.station_user_copy;
        obj.station_psw = obj.station_psw_copy;
        obj.station_addr = obj.station_addr_copy;
        obj.station_port = obj.station_port_copy;
    }

    $scope.saveMarketCfg = function (saveAll) {
        var tallMarketCfg = [], defaultHost = "0.0.0.0", defaultPort = "6123", defaultIndex = -1;

        for (var i = 0; i < $scope.allMarketInfoCfg.length; i++) {

            if (!saveAll && $scope.allMarketInfoCfg[i].addMarketCfg) {
                continue;
            }

            var temp = {
                station_id: $scope.allMarketInfoCfg[i].station_id, station_name: $scope.allMarketInfoCfg[i].station_name,
                station_maid: $scope.allMarketInfoCfg[i].station_maid,
                station_user: $scope.allMarketInfoCfg[i].station_user, station_psw: $scope.allMarketInfoCfg[i].station_psw,
                station_addr: $scope.allMarketInfoCfg[i].station_addr, station_port: $scope.allMarketInfoCfg[i].station_port,
                station_default: $scope.allMarketInfoCfg[i].station_default, system_station: $scope.allMarketInfoCfg[i].system_station
            };

            // temp.station_psw = cms.simple_encrypt(temp.station_psw);


            tallMarketCfg.push(temp);

            if (!saveAll && $scope.allMarketInfoCfg[i].station_default == "1") {
                defaultIndex = i;
                defaultHost = $scope.allMarketInfoCfg[i].station_addr;
                defaultPort = $scope.allMarketInfoCfg[i].station_port;
            }
        }

        cms.userData.marketConfiguration = tallMarketCfg;

        cms.writeFile("./userData.json", JSON.stringify(cms.userData, null, "\t"), function (err) {
            if (err) {
                cms.message.error("写用户信息文件失败");
                return;
            }
            cms.message.success("配置行情站点信息成功");
            if (defaultIndex == -1) { //断开连接
                $scope.currentMarketCfg = {};
                $scope.usedMarketCfg = $scope.currentMarketCfg;
                if (saveAll) {
                    $scope.mainHideModalLv2();
                }
                $scope.$apply();
                return;
            }

            //重置当前所选
            var existCurrentMarketCfg = false;
            for (var i = 0; i < tallMarketCfg.length; i++) {
                tallMarketCfg[i].station_psw = $scope.allMarketInfoCfg[i].station_psw;  //写文件完成后,重新使用明文的密码

                if (tallMarketCfg[i].station_id == $scope.currentMarketCfg.station_id) {
                    $scope.currentMarketCfg = tallMarketCfg[i];
                    existCurrentMarketCfg = true;
                }
            }

            $scope.allMarketCfg = tallMarketCfg;

            if (!existCurrentMarketCfg) {
                $scope.currentMarketCfg = tallMarketCfg[defaultIndex];
            }

            if (saveAll) {
                $scope.mainHideModalLv2();
            }
            $scope.$apply();

        });
    }

    //当点击修改弹框的确定按钮的时候调用保存一条记录的方法
    $scope.saveMarketCfgSingleLIne = function() {
        var tempIndex = 0;
        for(var i = 0;i<cms.userData.marketConfiguration.length;i++) {
            if ($scope.changeMarketData["station_id"] === cms.userData.marketConfiguration[i]["station_id"]){
                var temp = {
                    station_id: $scope.changeMarketData.station_id, station_name: $scope.changeMarketData.station_name,
                    station_maid: $scope.changeMarketData.station_maid,
                    station_user: $scope.changeMarketData.station_user, station_psw: $scope.changeMarketData.station_psw,
                    station_addr: $scope.changeMarketData.station_addr, station_port: $scope.changeMarketData.station_port,
                    station_default: $scope.changeMarketData.station_default, system_station: $scope.changeMarketData.system_station
                };
    
                // temp.station_psw = cms.simple_encrypt(temp.station_psw);
                cms.userData.marketConfiguration[i]["station_id"] = temp["station_id"];
                cms.userData.marketConfiguration[i]["station_name"] = temp["station_name"];
                cms.userData.marketConfiguration[i]["station_maid"] = temp["station_maid"];
                cms.userData.marketConfiguration[i]["station_user"] = temp["station_user"];
                cms.userData.marketConfiguration[i]["station_addr"] = temp["station_addr"];
                cms.userData.marketConfiguration[i]["station_psw"] = temp["station_psw"];
                cms.userData.marketConfiguration[i]["station_port"] = temp["station_port"];
                cms.userData.marketConfiguration[i]["station_default"] = temp["station_default"];
                cms.userData.marketConfiguration[i]["system_station"] = temp["system_station"];
                tempIndex = i;
            }
        }
        cms.writeFile("./userData.json", JSON.stringify(cms.userData, null, "\t"), function (err) {
            $scope.mainHideModalLv2();//关闭二级弹框
            if (err) {
                cms.message.error("写用户信息文件失败");
                return;
            }
            $scope.allMarketCfg[tempIndex]["station_id"] = temp["station_id"];
                $scope.allMarketCfg[tempIndex]["station_name"] = temp["station_name"];
                $scope.allMarketCfg[tempIndex]["station_maid"] = temp["station_maid"];
                $scope.allMarketCfg[tempIndex]["station_user"] = temp["station_user"];
                $scope.allMarketCfg[tempIndex]["station_addr"] = temp["station_addr"];
                $scope.allMarketCfg[tempIndex]["station_psw"] = temp["station_psw"];
                $scope.allMarketCfg[tempIndex]["station_port"] = temp["station_port"];
                $scope.allMarketCfg[tempIndex]["station_default"] = temp["station_default"];
                $scope.allMarketCfg[tempIndex]["system_station"] = temp["system_station"];
            // for(var j = 0; j< $scope.allMarketCfg.length;j++) {
            //     if ($scope.allMarketCfg[j]["station_default"] === "1") {
            //         $scope.currentMarketCfg = $scope.allMarketCfg[j];
            //     }
            // }
            console.log($scope.allMarketCfg);
            console.log($scope.currentMarketCfg);
            cms.message.success("修改行情站点信息成功");
            $scope.$apply();

        });
    }

    $scope.addMarketCfg = function () {
        var addMarketCfgObj = {};
        if ($scope.allMarketInfoCfg.length) {
            var lastObj = $scope.allMarketInfoCfg[$scope.allMarketInfoCfg.length - 1];
            var nowID = parseInt(lastObj.station_id);
            nowID = isNaN(nowID) ? 0 : nowID + 1;
            addMarketCfgObj.station_id = nowID;
            addMarketCfgObj.station_name = lastObj.station_name;
            addMarketCfgObj.station_maid = lastObj.station_maid;
            addMarketCfgObj.station_user = lastObj.station_user;
            addMarketCfgObj.station_psw = lastObj.station_psw;
            addMarketCfgObj.station_addr = lastObj.station_addr;
            addMarketCfgObj.station_port = lastObj.station_port;
            addMarketCfgObj.station_default = "0";
            addMarketCfgObj.system_station = "0";
            addMarketCfgObj.addMarketCfg = true;
        } else {
            addMarketCfgObj = {
                station_name: "station_name", station_id: 0, station_maid: "station_maid",
                station_user: "station_user", station_psw: "BB",
                station_addr: "0.0.0.0", station_port: "0",
                station_default: "1", system_station: "0", addMarketCfg: true
            };

        }
        addMarketCfgObj.edit = true;
        resetMarketCfgCopy(addMarketCfgObj);

        $scope.allMarketInfoCfg.push(addMarketCfgObj);

    }

    $scope.clickRadio = function (marketCfg) {
        if (marketCfg.station_default_copy == "1") {
            return;
        }
        $scope.allMarketInfoCfg.forEach(function (obj) {
            obj.station_default = "0";
            obj.station_default_copy = "0";
        });
        marketCfg.station_default = "1";
        marketCfg.station_default_copy = "1";
    }

    $scope.editMarketCfg = function (marketCfg) {
        marketCfg.edit = true;
    }

    $scope.saveChangeMarketCfg = function (marketCfg) {
        var IPRegulation = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/;
        if (!IPRegulation.test(marketCfg.station_addr_copy)) {
            cms.message.error("行情服务器IP地址不正确");
            return;
        }
        var PortRegulation = /^((6[0-5][0-5][0-3][0-5])|([0-5]\d{0,4}|\d{0,4}))$/;
        if (!PortRegulation.test(marketCfg.station_port_copy)) {
            cms.message.error("行情服务器端口不正确");
            return;
        }
        setMarketCfgFromCopy(marketCfg);
        if ($scope.changeMarketData.station_name_copy === "") {
            cms.message.error("行情站点名称不可以为空");
            return;
        } else if ($scope.changeMarketData.station_addr_copy === "") {
            cms.message.error("行情站点IP不可以为空");
            return;
        } else if ($scope.changeMarketData.station_port_copy === "") {
            cms.message.error("行情站点端口不可以为空");
            return;
        } else {
            $scope.saveMarketCfgSingleLIne();
        }
    }

    $scope.cancelChangeMarketCfg = function (marketCfg) {
        resetMarketCfgCopy(marketCfg);
        $scope.mainHideModalLv2();//取消之后关闭弹框
    }

    $scope.delMarketCfg = function (marketCfg, index) {
        $scope.allMarketInfoCfg.splice(index, 1);
        if (marketCfg.station_default == "1" && $scope.allMarketInfoCfg.length) {
            $scope.allMarketInfoCfg[0].station_default = "1";
            $scope.allMarketInfoCfg[0].station_default_copy = "1";
        }
        $scope.saveMarketCfg(false);
    }

    $scope.clickMarketCfg = function () {

        // $scope.modalInfoLv2.path = "./marketInfoCfg/marketInfoCfgDetail.html";
        // $scope.modalInfoLv2.state = "marketInfoCfgDetail";

        $scope.allMarketInfoCfg = [];
        cms.deepCopy($scope.allMarketCfg, $scope.allMarketInfoCfg);
        $scope.allMarketInfoCfg.forEach(function (obj) {
            resetMarketCfgCopy(obj);
        });
    }

    //判断event是否为null
    $scope.isNull = function(obj) {
        return obj === null;
    }

    //当点击了下拉框的时候出发事件
    $scope.changeSelectOption = function(event) {
        console.log("selectchange事件");
        $scope.clickAllMarketCfg = [];
        cms.deepCopy($scope.allMarketCfg, $scope.clickAllMarketCfg);
        if ($scope.isNull(event)) {
            console.log("change is null对象")
            if ($scope.allMarketCfg.length) {
                for(var j = 0; j<$scope.allMarketCfg.length;j++) {
                    if ($scope.allMarketCfg[j]["station_default"] === "1") {
                        $scope.currentMarketCfg = $scope.allMarketCfg[j];
                        console.log("存在被选项")
                    }
                }
            }
            console.log($scope.allMarketCfg);
            console.log($scope.currentMarketCfg);
        } else {
            console.log("change is no null 对象");
            //点击选中之后将具体的某一个的station_default设置为1，其余的设置为0
            for (var i = 0; i < $scope.clickAllMarketCfg.length; i++) {
                if (event && event["station_id"] === $scope.clickAllMarketCfg[i]["station_id"]) {
                    $scope.currentMarketCfg = event;
                    $scope.clickAllMarketCfg[i]["station_default"] = "1";
                } else {
                    $scope.clickAllMarketCfg[i]["station_default"] = "0";
                }
            }
            console.log($scope.currentMarketCfg);
        }
    }

    $scope.confirmMarketCfg = function () {
        if ($scope.clickAllMarketCfg.length === 0) {
            cms.deepCopy($scope.allMarketCfg, $scope.clickAllMarketCfg);
        };
        //点击确认就会重新登录行情,因为不知道时候修改了数据
        $scope.usedMarketCfg = $scope.currentMarketCfg;
        //连接行情
        var loginData = {
            head: { pkgId: 3 },
            body: {
                maid: $scope.usedMarketCfg.station_maid, userid: parseInt($scope.usedMarketCfg.station_maid) * 10000 + parseInt($scope.usedMarketCfg.station_user),
                pass: $scope.usedMarketCfg.station_psw, md5: "", appname: "cms", version: $scope.clientVersion,
                fgs_ip: $scope.usedMarketCfg.station_addr, fgs_port: $scope.usedMarketCfg.station_port,
                dsn: "*", cpuid: "*", mac: "127.0.0.1", ip: "127.0.0.1", fgs_type: "marketConnection"
            }
        };
        $scope.hq_connect = false;
        console.log("点击连接行情");
        console.log(loginData);
        cms.fgsLogin(loginData, function (res) {
            console.log(res);
            if (res.msret.msgcode != 0) {
                $scope.hq_connect = false;
                $scope.$apply();
                return;
            }

            $scope.hq_connect = true;
            $scope.$apply();
        });
        // $scope.mainHideModal();
        //点击确定按钮将当前选中的项目写入到文件之中
        var tallMarketCfg = [], defaultHost = "0.0.0.0", defaultPort = "6123", defaultIndex = -1;

        for (var i = 0; i < $scope.clickAllMarketCfg.length; i++) {
            var temp = {
                station_id: $scope.clickAllMarketCfg[i].station_id, station_name: $scope.clickAllMarketCfg[i].station_name,
                station_maid: $scope.clickAllMarketCfg[i].station_maid,
                station_user: $scope.clickAllMarketCfg[i].station_user, station_psw: $scope.clickAllMarketCfg[i].station_psw,
                station_addr: $scope.clickAllMarketCfg[i].station_addr, station_port: $scope.clickAllMarketCfg[i].station_port,
                station_default: $scope.clickAllMarketCfg[i].station_default, system_station: $scope.clickAllMarketCfg[i].system_station
            };
            // temp.station_psw = cms.simple_encrypt(temp.station_psw);
            tallMarketCfg.push(temp);
            if ($scope.clickAllMarketCfg[i].station_default == "1") {
                defaultIndex = i;
                defaultHost = $scope.clickAllMarketCfg[i].station_addr;
                defaultPort = $scope.clickAllMarketCfg[i].station_port;
            }
        }
        console.log("______");
        console.log($scope.clickAllMarketCfg);
        console.log(tallMarketCfg);
        cms.userData.marketConfiguration = tallMarketCfg;
        cms.writeFile("./userData.json", JSON.stringify(cms.userData, null, "\t"), function (err) {
            if (err) {
                cms.message.error("写用户信息文件失败");
                return;
            }
            cms.message.success("配置行情站点信息成功");
            if (defaultIndex == -1) { //断开连接
                console.log('断开链接');
                $scope.currentMarketCfg = {};
                $scope.usedMarketCfg = $scope.currentMarketCfg;
                $scope.$apply();
                return;
            }
            //重置当前所选
            var existCurrentMarketCfg = false;
            for (var j = 0; j < tallMarketCfg.length; j++) {
                tallMarketCfg[j].station_psw = $scope.clickAllMarketCfg[j].station_psw;  //写文件完成后,重新使用明文的密码
                if ($scope.currentMarketCfg["station_id"] === tallMarketCfg[j]["station_id"]) {
                    $scope.currentMarketCfg = tallMarketCfg[j];
                    // existCurrentMarketCfg = true;
                }
            }
            $scope.allMarketCfg = $scope.clickAllMarketCfg;
            console.log($scope.currentMarketCfg);
            console.log("allMarketCfg");
            if (!existCurrentMarketCfg) {
                $scope.currentMarketCfg = tallMarketCfg[defaultIndex];
            }
            $scope.mainHideModal();
        });

    }

    //当切换锁屏设置的时候
    $scope.changeSettingState = function(tempSate) {
        if (tempSate) {
            $scope.isDisableLockInput = false;
        } else {
            $scope.isDisableLockInput = true;
        }
        console.log("change");
    }

    //确定修改锁屏时间
    $scope.confirmSetLockTime = function() {
        console.log($scope.isDiabledSettime.isOpen);
        console.log($scope.isDiabledSettime.time);
        var tempOBj = {"time": parseInt($scope.isDiabledSettime.time),"isOpen":$scope.isDiabledSettime.isOpen};
        cms.userData["lockScreenCfg"] = tempOBj;
        cms.writeFile("./userData.json", JSON.stringify(cms.userData, null, "\t"), function (err) {
            if (err) {
                cms.message.error("写用户信息文件失败");
                return;
            }
            $scope.userLockScreen = tempOBj;
            cms.message.success("配置锁屏信息成功");
            $interval.cancel($scope.lockViewInterval);//清除定时器
            $interval.cancel($scope.restLockViewInterval);
            if (tempOBj["isOpen"] == true) {
                //重新设置 
                console.log(tempOBj["isOpen"]);
                $interval.cancel($scope.lockViewInterval);//清除定时器
                $interval.cancel($scope.restLockViewInterval);
                $scope.lockViewCount = parseInt($scope.isDiabledSettime.time);
                $scope.restLockViewInterval = $interval(function () {
                    --$scope.lockViewCount;
                    // 这里需要取消所有的元素聚焦,特别是select
                    if ($scope.lockViewCount == 0) {
                        document.activeElement.blur();
                    }
                }, 1000);
            } else {
                $interval.cancel($scope.lockViewInterval);//关闭定时器
                $interval.cancel($scope.restLockViewInterval);
            }
            $scope.mainHideModal();
        });

    }



    //重新登录
    $scope.mainRelogin = function () {
        // mainService.loginOut({ body: {} }, function (res) { });
        $scope.mainHideModal();
        mainService.relogin();
    }

    //退出登录
    $scope.loginOut = function () {
        // mainService.loginOut({ body: {} }, function (res) { });
        $scope.mainCloseWindow();
    }


    $scope.readMarketConfiguration = function () {

    }
    $scope.clickBody = function () {
        if ($scope.lockViewCount < 1) {
            return;
        }
        $scope.lockViewCount = parseInt($scope.userLockScreen["time"]) ? parseInt($scope.userLockScreen["time"]) : 120;
    }

    $scope.lockViewKeyDown = function (ev) {
        if (ev.keyCode == "13") {
            $scope.unlockView();
            return;
        }
    }

    $scope.unlockView = function () {
        var requestData = { body: { pass: $scope.lockPassword } };
        $scope.lockPassword = "";
        mainService.unlockView(requestData, function (res) {

            if (res.msret.msgcode != "00") {
                cms.message.error("解锁失败");
                return;
            }
            $scope.lockViewCount = parseInt($scope.userLockScreen["time"]) ? parseInt($scope.userLockScreen["time"]) : 120;
        });
    }


});

function Drag() {
    //初始化
    this.initialize.apply(this, arguments)
}
Drag.prototype = {
    //初始化
    initialize: function (drag, options) {
        this.drag = this.$(drag);
        this._x = this._y = 0;
        this._moveDrag = this.bind(this, this.moveDrag);
        this._stopDrag = this.bind(this, this.stopDrag);

        this.setOptions(options);

        this.handle = this.$(this.options.handle);
        this.maxContainer = this.$(this.options.maxContainer);

        this.maxTop = Math.max(this.maxContainer.clientHeight, this.maxContainer.scrollHeight) - this.drag.offsetHeight;
        this.maxLeft = Math.max(this.maxContainer.clientWidth, this.maxContainer.scrollWidth) - this.drag.offsetWidth;

        this.limit = this.options.limit;
        this.lockX = this.options.lockX;
        this.lockY = this.options.lockY;
        this.lock = this.options.lock;

        this.onStart = this.options.onStart;
        this.onMove = this.options.onMove;
        this.onStop = this.options.onStop;

        this.handle.style.cursor = "move";

        this.changeLayout();

        this.addHandler(this.handle, "mousedown", this.bind(this, this.startDrag))
    },
    changeLayout: function () {
        this.drag.style.top = this.drag.offsetTop + "px";
        this.drag.style.left = this.drag.offsetLeft + "px";
        this.drag.style.position = "absolute";
        this.drag.style.margin = "0"
    },
    startDrag: function (event) {
        var event = event || window.event;

        this._x = event.clientX - this.drag.offsetLeft;
        this._y = event.clientY - this.drag.offsetTop;

        this.addHandler(document, "mousemove", this._moveDrag);
        this.addHandler(document, "mouseup", this._stopDrag);

        event.preventDefault && event.preventDefault();
        this.handle.setCapture && this.handle.setCapture();

        this.onStart()
    },
    moveDrag: function (event) {
        var event = event || window.event;

        var iTop = event.clientY - this._y;
        var iLeft = event.clientX - this._x;

        if (this.lock) return;

        this.limit && (iTop < 5 && (iTop = 5), iLeft < 5 && (iLeft = 5), iTop > this.maxTop - 5 && (iTop = this.maxTop - 5), iLeft > this.maxLeft - 5 && (iLeft = this.maxLeft - 5));

        this.lockY || (this.drag.style.top = iTop + "px");
        this.lockX || (this.drag.style.left = iLeft + "px");

        event.preventDefault && event.preventDefault();

        this.onMove()
    },
    stopDrag: function () {
        this.removeHandler(document, "mousemove", this._moveDrag);
        this.removeHandler(document, "mouseup", this._stopDrag);

        this.handle.releaseCapture && this.handle.releaseCapture();

        this.onStop()
    },
    //参数设置
    setOptions: function (options) {
        this.options =
            {
                handle: this.drag, //事件对象
                limit: true, //锁定范围
                lock: false, //锁定位置
                lockX: false, //锁定水平位置
                lockY: false, //锁定垂直位置
                maxContainer: document.documentElement || document.body, //指定限制容器
                onStart: function () { }, //开始时回调函数
                onMove: function () { }, //拖拽时回调函数
                onStop: function () { }  //停止时回调函数
            };
        for (var p in options) this.options[p] = options[p]
    },
    //获取id
    $: function (id) {
        return typeof id === "string" ? document.getElementById(id) : id
    },
    //添加绑定事件
    addHandler: function (oElement, sEventType, fnHandler) {
        return oElement.addEventListener ? oElement.addEventListener(sEventType, fnHandler, false) : oElement.attachEvent("on" + sEventType, fnHandler)
    },
    //删除绑定事件
    removeHandler: function (oElement, sEventType, fnHandler) {
        return oElement.removeEventListener ? oElement.removeEventListener(sEventType, fnHandler, false) : oElement.detachEvent("on" + sEventType, fnHandler)
    },
    //绑定事件到对象
    bind: function (object, fnHandler) {
        return function () {
            return fnHandler.apply(object, arguments)
        }
    }
};


//定义窗口标题栏事件类
function TitleBarEventer() {
    this.initialize.apply(this, arguments);
}

TitleBarEventer.prototype = {
    //初始化
    initialize: function (titleBar) {
        this.titleBar = document.getElementById(titleBar);
        this.remote = nodeRequire('electron').remote;
        this.win = this.remote.getCurrentWindow();
        this.screen = nodeRequire('electron').screen;
        this.display = this.screen.getPrimaryDisplay();
        this.workArea = this.display.workArea;
        this._x = 0;
        this._y = 0;
        this.mouse_x = 0;
        this.mouse_y = 0;
        this.isMax = false;
        this._moveDrag = this.bind(this, this.moveDrag);
        this._stopDrag = this.bind(this, this.stopDrag);
        this._dblClickBar = this.bind(this, this.dblClickBar);
        this.addHandler(this.titleBar, "mousedown", this.bind(this, this.startDrag));
        this.addHandler(this.titleBar, "dblclick", this.bind(this, this._dblClickBar));
        this._setWindowState = this.bind(this, this.setWindowState);
        this._getWindowState = this.bind(this, this.getWindowState);
        this._changeWindowState = this.bind(this, this.dblClickBar);
        this._minWindow = this.bind(this, this.minWindow);
        this._closeWindow = this.bind(this, this.closeWindow);
    },
    //开始拖拽
    startDrag: function (event) {
        if (this.isMax) return;
        var event = event || window.event;
        this.mouse_x = event.screenX;
        this.mouse_y = event.screenY;
        var pos = this.win.getPosition();
        this._x = pos[0];
        this._y = pos[1];
        this.addHandler(document, "mousemove", this._moveDrag);
        this.addHandler(document, "mouseup", this._stopDrag);
        event.preventDefault && event.preventDefault();
        this.titleBar.setCapture && this.titleBar.setCapture();
    },
    //拖动
    moveDrag: function (event) {
        this.setPosition(event);
        event.preventDefault && event.preventDefault();
    },
    stopDrag: function () {
        this.removeHandler(document, "mousemove", this._moveDrag);
        this.removeHandler(document, "mouseup", this._stopDrag);
        this.titleBar.releaseCapture && this.titleBar.releaseCapture();
        var pos = this.win.getPosition();
        var pos_x = pos[0];
        var pos_y = pos[1];
        var size = this.win.getSize();
        var width = size[0];
        var height = size[1];
        if (pos_y < this.workArea.y + 5) {
            pos_y = this.workArea.y + 5;
        }
        if (pos_y > this.workArea.y + this.workArea.height - 35) {
            pos_y = this.workArea.y + this.workArea.height - 35;
        }
        // if(pos_x < - width / 2) {
        // 	pos_x = - width / 2;
        // }
        // if(pos_x > this.workArea.x + this.workArea.width - width / 2) {
        // 	pos_x = this.workArea.x + this.workArea.width - width / 2;
        // }
        this.win.setPosition(pos_x, pos_y);
    },
    //重新设置窗口位置
    setPosition: function (event) {
        var event = event || window.event;
        this.win.setPosition(this._x + (event.screenX - this.mouse_x), this._y + (event.screenY - this.mouse_y))
    },
    //双击窗口
    dblClickBar: function () {
        if (this.isMax) {
            this.win.unmaximize();
            this.win.setResizable(true);
        }
        else {
            this.win.maximize();
            this.win.setResizable(false);
        }
        this.isMax = !this.isMax;
    },
    //添加绑定事件
    addHandler: function (oElement, sEventType, fnHandler) {
        return oElement.addEventListener ? oElement.addEventListener(sEventType, fnHandler, false) : oElement.attachEvent("on" + sEventType, fnHandler)
    },
    //删除绑定事件
    removeHandler: function (oElement, sEventType, fnHandler) {
        return oElement.removeEventListener ? oElement.removeEventListener(sEventType, fnHandler, false) : oElement.detachEvent("on" + sEventType, fnHandler)
    },
    //绑定事件到对象
    bind: function (object, fnHandler) {
        return function () {
            return fnHandler.apply(object, arguments)
        }
    },
    //设置窗口状态
    setWindowState: function (state) {
        this.isMax = state;
    },
    getWindowState: function () {
        return this.isMax;
    },
    minWindow: function () {
        this.win.minimize();
    },
    closeWindow: function () {
        this.win.close();
    }
}
