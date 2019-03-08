angular.module('cmsController').controller('unitNetInfoCtrl',
    function ($scope, $interval, $timeout, unitNetInfoService, mainService) {
        $scope.dialogModalInfo = { path: "", state: "" }; // 第二次弹框的地址
        $scope.showSubguide = true;
        $scope.allAssetManager = [];

        $scope.currentUnit = {};
        var currentNetInfo = {};
        var exportEveryPositionVol = []; // 保存每一支持仓
        var totalPosition = [];
        var currentDateNetInfo = [];

        var refreshTimer; //保存定时获取行情刷新界面的定时器

        var subscribeMarketForDisplay = false;

        $scope.currentPage = 1;
        $scope.allPage = 1;
        $scope.pageSize = 20;

        $scope.guideTree = [];
        $scope.keyName = "";
        $scope.reverse = false;
        $scope.sortFunction = null;

        $scope.exportNetInfoCount = -1; // 导出时间的计数，没两秒加一

        $scope.begin_date = new Date();
        $scope.end_date = new Date();

        $scope.unitNetInfoArray = [];

        $scope.configuration = {
            exportTime1: new Date(cms.userData.netInfoCfg.exportTime1), exportTime2: new Date(cms.userData.netInfoCfg.exportTime2), path: cms.userData.netInfoCfg.path,
            excelType: cms.userData.netInfoCfg.excelType, applyAll: cms.userData.netInfoCfg.applyAll, autoExport: cms.userData.netInfoCfg.autoExport
        };

        $scope.filterOption = { begin_date: cms.formatDate_ex($scope.begin_date), end_date: cms.formatDate_ex($scope.end_date), page: 1, isToday: 1 };
        //页面加载完毕
        $scope.$watch('$viewContentLoaded', function () {
            $scope.getAllTaMgr();
        });

        //菜单改变
        $scope.$on("mainMenuChange", function (event, menu) {
            if (menu.menuId == "2004002") {
                $scope.getCombStrategyNetInfo();
            } else {
                if (refreshTimer) {
                    $interval.cancel(refreshTimer);
                    refreshTimer = null;
                    tryUnsubscribe();
                }
            }
        });

        function tryUnsubscribe() {
            if (subscribeMarketForDisplay) {
                mainService.unsubscribeMarket(totalPosition);
                subscribeMarketForDisplay = false;
            }
        }

        //点击表头
        $scope.clickTableHeader = function (keyName, isNumber) {
            $scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
            $scope.keyName = keyName;
            $scope.sortFunction = mainService.getSortFunc($scope.reverse, isNumber);
        }

        $scope.$on("changedManager_broadcast", function (event, message) {
            $scope.getAllTaMgr();
        });

        $scope.$on("changedProduct_broadcast", function (event, message) {
            $scope.getAllTaMgr();

        });

        $scope.getAllTaMgr = function () {
            //首先清空已有数据
            $scope.allAssetManager = [];

            var requestData = { body: {} };
            unitNetInfoService.getAllTaMgr(requestData, function (res) {
                if (res.msret.msgcode != '00') {
                    cms.message.error("获取所有资产管理人失败." + res.msret.msg);
                    return;
                }
                $scope.allAssetManager = res.body;

                $scope.allAssetManager.forEach(function (obj) {
                    obj.maid = parseInt(obj.maid);
                    obj.menuId = obj.maid;
                    obj.menuName = obj.maname + "(" + obj.maid + ")";
                    obj.type = 'maid';
                    obj.children = [];

                });
                if ($scope.allAssetManager.length) {
                    $scope.getProducts();
                }

                $scope.$apply();
            });
        }

        $scope.getProducts = function () {
            var requestData = { body: {} };
            unitNetInfoService.getProducts(requestData, function (res) {
                if (res.msret.msgcode != '00') {
                    cms.message.error("获取所有产品失败." + res.msret.msg);
                    return;
                }

                $scope.products = res.body;
                var i = 0, j = 0;
                for (; i < $scope.products.length; i++) {
                    $scope.products[i].maid = parseInt($scope.products[i].maid);
                    $scope.products[i].caid = parseInt($scope.products[i].caid);
                    $scope.products[i].menuId = $scope.products[i].caid;
                    $scope.products[i].menuName = $scope.products[i].caname + "(" + $scope.products[i].caid + ")";
                    $scope.products[i].type = 'caid';
                    $scope.products[i].children = [];
                    var maIndex = cms.accurateSearch($scope.allAssetManager, "maid", ($scope.products[i].maid));
                    if (maIndex != -1) {
                        $scope.allAssetManager[maIndex].children.push($scope.products[i]);
                    } else {
                        var newManager = {maid: $scope.products[i].maid, menuId: $scope.products[i].maid, menuName: "("+$scope.products[i].maid+")", type: 'maid', children: []};
                        newManager.children.push($scope.products[i]);
                        $scope.allAssetManager.push(newManager);
                    }
                }
                $scope.getCombStrategy();

                $scope.$apply();
            });


        }

        $scope.getCombStrategy = function () {
            var requestData = { body: {} };
            unitNetInfoService.getCombStrategy(requestData, function (res) {
                if (res.msret.msgcode != '00') {
                    cms.message.error("获取所有的组合策略失败." + res.msret.msg);
                    return;
                }
                var tradeUnits = res.body;
                var i = 0, j = 0;
                for (; i < tradeUnits.length; i++) {
                    tradeUnits[i].maid = parseInt(tradeUnits[i].maid);
                    tradeUnits[i].caid = parseInt(tradeUnits[i].caid);
                    tradeUnits[i].trid = parseInt(tradeUnits[i].trid);

                    tradeUnits[i].menuId = tradeUnits[i].trid;
                    tradeUnits[i].menuName = tradeUnits[i].trname + "(" + tradeUnits[i].trid + ")";
                    tradeUnits[i].type = 'trid';

                    var maIndex = cms.accurateSearch($scope.allAssetManager, "maid", (tradeUnits[i].maid));
                    if (maIndex != -1) {
                        var caIndex = cms.accurateSearch($scope.allAssetManager[maIndex].children, "caid", (tradeUnits[i].caid));
                        if (caIndex != -1) {
                            $scope.allAssetManager[maIndex].children[caIndex].children.push(tradeUnits[i]);
                        } else {
                            var newProduct = {maid: tradeUnits[i].maid, caid: tradeUnits[i].caid, menuId: tradeUnits[i].caid, menuName: "("+tradeUnits[i].caid+")", type: 'caid',
                            children: []};
                            newProduct.children.push(tradeUnits[i]);
                            $scope.allAssetManager[maIndex].children.push(newProduct);
                        }
                    } else {
                        var newManager = {maid: tradeUnits[i].maid, menuId: tradeUnits[i].maid, menuName: "("+tradeUnits[i].maid+")", type: 'maid', children: []};
                        var newProduct = {maid: tradeUnits[i].maid, caid: tradeUnits[i].caid, menuId: tradeUnits[i].caid, menuName: "("+tradeUnits[i].caid+")", type: 'caid',
                        children: []};
                        newProduct.children.push(tradeUnits[i]);
                        newManager.children.push(newProduct);
                        $scope.allAssetManager.push(newManager);
                    }
                }
                $scope.guideTree = $scope.allAssetManager;
                $scope.$apply();
            });
        }

        $scope.getCombStrategyNetInfo = function () {
            if (!$scope.filterOption.trid)
                return;

            if ($scope.filterOption.isToday === 0) {
                if ($scope.begin_date > $scope.end_date) {
                    cms.message.error("开始日期不能大于结束日期");
                    return;
                }
                // 判断时间是否大于3个月
                if (($scope.end_date.getTime() - $scope.begin_date.getTime()) > 7948800000) {
                    cms.message.error("只能查询3个月的记录");
                    return;
                }
            }

            if (refreshTimer) {
                $interval.cancel(refreshTimer);
                refreshTimer = null;
            }

            var requestNetData = {
                body: {
                    begin_date: $scope.filterOption.begin_date,
                    end_date: $scope.filterOption.end_date,
                    trid: $scope.filterOption.trid,
                    isToday: $scope.filterOption.isToday,
                    page: $scope.filterOption.page,
                    pageSize: $scope.pageSize
                }
            };
            unitNetInfoService.getCombStrategyNetInfo(requestNetData, function (res) {
                if (res.msret.msgcode != '00') {
                    tryUnsubscribe();
                    $scope.unitNetInfoArray = [];
                    cms.message.error("获取所有的组合的净值信息失败." + res.msret.msg);
                    return;
                }
                $scope.allPage = Math.ceil(res.body.totalCount / $scope.pageSize);
                $scope.allPage = $scope.allPage || 1;
                var unitNetInfoArray = res.body.data;

                if (requestNetData.body.isToday != $scope.filterOption.isToday) {
                    tryUnsubscribe();
                    return;
                }

                if (requestNetData.body.isToday === 1) {
                    var today = cms.formatDate_ex(new Date());
                    unitNetInfoArray.forEach(function (unitNetInfo) {
                        unitNetInfo.trday = today;
                        unitNetInfo.trid = parseInt(unitNetInfo.trid);
                    });

                    var requestData = {
                        body: {
                            begin_date: $scope.filterOption.begin_date, end_date: $scope.filterOption.end_date,
                            page: 1, isToday: 1, pageSize: 1000000, trid: $scope.filterOption.trid
                        }
                    };
                    unitNetInfoService.getUnitPositionInfo(requestData, function (res) {
                        if (res.msret.msgcode != '00') {
                            tryUnsubscribe();
                            totalPosition = [];
                            $scope.unitNetInfoArray = unitNetInfoArray;
                            cms.message.error("获取组合当日持仓数据失败." + res.msret.msg);
                            return;
                        }
                        tryUnsubscribe();

                        totalPosition = res.body.data;
                        totalPosition.forEach(function (position) {
                            position.trid = parseInt(position.trid);
                        });

                        subscribeMarketForDisplay = true;
                        mainService.subscribeMarket(totalPosition);
                        mainService.getUkeyMarketInfoForNetInfo(totalPosition, unitNetInfoArray);
                        $scope.unitNetInfoArray = unitNetInfoArray;

                        if (totalPosition.length) {
                            $interval.cancel(refreshTimer);
                            refreshTimer = $interval(function () {
                                mainService.getUkeyMarketInfoForNetInfo(totalPosition, $scope.unitNetInfoArray);
                                cms.log("refreshTimer getUkeyMarketInfoForNetInfo unitNetInfoArray", requestNetData.body.isToday);
                            }, 3000);
                        }
                        $scope.$apply();
                    });
                } else {
                    tryUnsubscribe();
                    totalPosition = [];
                    $scope.unitNetInfoArray = unitNetInfoArray;
                    $scope.$apply();
                }

            });
        }


        $scope.clickUnit = function (unit) {
            $scope.currentUnit = unit;
            $scope.filterOption.trid = unit.trid;
            $scope.filterOption.page = 1;
            $scope.currentPage = 1;
            $scope.getCombStrategyNetInfo();
        }

        $scope.changeStartDate = function () {
            $scope.filterOption.begin_date = cms.formatDate_ex($scope.begin_date);
            $scope.filterOption.page = 1;
            $scope.currentPage = 1;
            $scope.getCombStrategyNetInfo();
        }

        $scope.changeEndDate = function () {
            $scope.filterOption.end_date = cms.formatDate_ex($scope.end_date);
            $scope.filterOption.page = 1;
            $scope.currentPage = 1;
            $scope.getCombStrategyNetInfo();
        }

        $scope.goToPage = function (page) {
            page = page > $scope.allPage ? $scope.allPage : page;
            page = page < 1 ? 1 : page;
            $scope.currentPage = page;

            $scope.filterOption.page = $scope.currentPage;
            $scope.getCombStrategyNetInfo();

        }

        $scope.clickApplyAll = function () {
            $scope.configuration.applyAll = !$scope.configuration.applyAll;
        }


        $scope.clickAutoExport = function () {
            $scope.configuration.autoExport = !$scope.configuration.autoExport;
        }

        $scope.confirmNetInfoCfg = function () {

            if (!cms.userData.hasOwnProperty("netInfoCfg")) {
                cms.userData.netInfoCfg = {};
            }
            cms.userData.netInfoCfg.exportTime1 = $scope.configuration.exportTime1;
            cms.userData.netInfoCfg.exportTime2 = $scope.configuration.exportTime2;
            cms.userData.netInfoCfg.path = $scope.configuration.path;
            cms.userData.netInfoCfg.excelType = $scope.configuration.excelType;
            cms.userData.netInfoCfg.applyAll = $scope.configuration.applyAll;
            cms.userData.netInfoCfg.autoExport = $scope.configuration.autoExport;

            if ($scope.configuration.applyAll) {
                cms.userData.unitPositionCfg.path = cms.userData.netInfoCfg.path;
                cms.userData.tradingRecordCfg.path = cms.userData.netInfoCfg.path;

                cms.userData.unitPositionCfg.excelType = cms.userData.netInfoCfg.excelType;
                cms.userData.tradingRecordCfg.excelType = cms.userData.netInfoCfg.excelType;

                cms.userData.unitPositionCfg.applyAll = cms.userData.netInfoCfg.applyAll;
                cms.userData.tradingRecordCfg.applyAll = cms.userData.netInfoCfg.applyAll;

                cms.userData.unitPositionCfg.autoExport = cms.userData.netInfoCfg.autoExport;
                cms.userData.tradingRecordCfg.autoExport = cms.userData.netInfoCfg.autoExport;

                cms.userData.unitPositionCfg.exportTime1 = $scope.configuration.exportTime1;
                cms.userData.tradingRecordCfg.exportTime1 = $scope.configuration.exportTime1;

                cms.userData.unitPositionCfg.exportTime2 = $scope.configuration.exportTime2;
                cms.userData.tradingRecordCfg.exportTime2 = $scope.configuration.exportTime2;
            }

            cms.writeFile("./userData.json", JSON.stringify(cms.userData, null, "\t"), function (err) {
                if (err) {
                    cms.message.error("写行情站点信息文件失败");
                    return;
                }
                $scope.unitNetHideModal();
            });
        }

        $scope.cancelChangeNetInfoCfg = function () {
            $scope.configuration = {
                exportTime1: new Date(cms.userData.netInfoCfg.exportTime1), exportTime2: new Date(cms.userData.netInfoCfg.exportTime2), path: cms.userData.netInfoCfg.path,
                excelType: cms.userData.netInfoCfg.excelType, applyAll: cms.userData.netInfoCfg.applyAll, autoExport: cms.userData.netInfoCfg.autoExport
            };
            $scope.unitNetHideModal();
        }

        $scope.setConfiguration = function () {
            $scope.dialogModalInfo.path = "../unitNetInfo/setConfiguration.html";
            $scope.dialogModalInfo.state = "setConfiguration";
        }


        $scope.manuallyExport = function () {
            if ($scope.exportNetInfoCount != -1) {
                return;
            }
            $scope.exportNetInfoCount = 0;

            if ($scope.filterOption.isToday === 0) {
                if ($scope.begin_date > $scope.end_date) {
                    cms.message.error("开始日期不能大于结束日期");
                    $scope.exportNetInfoCount = -1;
                    return;
                }
                // 判断时间是否大于3个月,92*24*60*60*1000
                if (($scope.end_date.getTime() - $scope.begin_date.getTime()) > 7948800000) {
                    cms.message.error("只能导出3个月的记录");
                    $scope.exportNetInfoCount = -1;
                    return;
                }
            }
            var requestData = {
                body: {
                    begin_date: $scope.filterOption.begin_date, end_date: $scope.filterOption.end_date, trid: $scope.filterOption.trid,
                    isToday: $scope.filterOption.isToday, page: 1, pageSize: 1000000
                }
            };

            unitNetInfoService.getCombStrategyNetInfo(requestData, function (res) {
                if (res.msret.msgcode != '00') {
                    cms.message.error("获取组合的净值信息失败." + res.msret.msg);
                    $scope.exportNetInfoCount = -1;
                    $scope.$apply();
                    return;
                }
                if (!res.body.data.length) {
                    cms.message.success("当前没有数据可以导出.");
                    $scope.exportNetInfoCount = -1;
                    $scope.$apply();
                    return;
                }

                if (requestData.body.isToday === 1) {
                    currentDateNetInfo = res.body.data;
                    var today = cms.formatDate_ex(new Date());
                    currentDateNetInfo.forEach(function (unitNetInfo) {
                        unitNetInfo.trid = parseInt(unitNetInfo.trid);
                        unitNetInfo.trday = today;
                    });

                    cmsFile.getSaveExcelFileName("组合" + currentDateNetInfo[0].trid + "净值信息.xlsx", function (fileName) {
                        if (!fileName) {
                            cms.message.error("获取导出文件的路径失败.");
                            $scope.exportNetInfoCount = -1;
                            $scope.$apply();
                            return;
                        }
                        unitNetInfoService.getUnitPositionInfo(requestData, function (res) {
                            if (res.msret.msgcode != '00') {
                                cms.message.error("获取组合当日持仓数据失败,无法导出净值数据." + res.msret.msg);
                                $scope.exportNetInfoCount = -1;
                                $scope.$apply();
                                return;
                            }
                            cms.message.success("正在获取数据,需要一分钟左右,请稍后.");
                            exportEveryPositionVol = res.body.data;
                            exportEveryPositionVol.forEach(function (position) {
                                position.trid = parseInt(position.trid);
                            });

                            $scope.exportNetInfoCount = 0;
                            mainService.subscribeMarket(exportEveryPositionVol);

                            $scope.exportNetInfoInterval = $interval(function manuallyExportMarketData() {
                                if (++$scope.exportNetInfoCount >= 30 ||
                                    mainService.getUkeyMarketInfoForNetInfo(exportEveryPositionVol, currentDateNetInfo)) {
                                    $scope.exportNetInfoCount = -1;
                                    $interval.cancel($scope.exportNetInfoInterval);
                                    mainService.unsubscribeMarket(exportEveryPositionVol); //取消之前的行情信息

                                    var exportExceldata = [[currentDateNetInfo[0].trday, currentDateNetInfo[0].trid, Number(currentDateNetInfo[0].assets).toFixed(3),
                                    Number(currentDateNetInfo[0].cost).toFixed(3), Number(currentDateNetInfo[0].cash).toFixed(3), Number(currentDateNetInfo[0].percent).toFixed(3),
                                    Number(currentDateNetInfo[0].value).toFixed(3)]];

                                    var dataObj = {
                                        data: exportExceldata, fileName: "组合" + currentDateNetInfo[0].trid + "净值信息", fileType: "xlsx",
                                        headers: ["日期", "策略组合", "策略净值", "股票成本市值", "现金", "仓位", "股票最新市值"]
                                    };

                                    cmsFile.exportExcelFileWithoutSaveDialog(dataObj, function (err, res) {
                                        if (err) {
                                            cms.message.error("导出表格数据失败。");
                                            return;
                                        }
                                        if (!res.result) {
                                            cms.message.error("导出表格数据失败。" + res.reason);
                                            return;
                                        }
                                        cms.message.success("导出组合净值信息成功");
                                    }, fileName);
                                }
                            }, 2000);
                            $scope.$apply();
                        });
                    });
                } else {
                    $scope.exportNetInfoCount = -1;
                    var exportData = res.body.data, exportExceldata = [];
                    exportData.forEach(function (obj) {
                        exportExceldata.push([obj.trday, obj.trid, Number(obj.assets).toFixed(3), Number(obj.cost).toFixed(3), Number(obj.cash).toFixed(3), Number(obj.percent).toFixed(3), Number(obj.value).toFixed(3)]);
                    });

                    var dataObj = {
                        data: exportExceldata, fileName: "组合" + $scope.filterOption.trid + "净值信息", fileType: "xlsx",
                        headers: ["日期", "策略组合", "策略净值", "股票成本市值", "现金", "仓位", "股票最新市值"]
                    };

                    cms.exportExcelFile(dataObj, function (err, res) {
                        if (err) {
                            cms.message.error("导出表格数据失败。");
                            return;
                        }
                        if (!res.result) {
                            cms.message.error("导出表格数据失败。" + res.reason);
                            return;
                        }
                        cms.message.success("导出组合净值信息成功");
                    });
                }
            });




        }

        $scope.showUnitNetModalLoadReady = function () {
            switch ($scope.dialogModalInfo.state) {
                case "setConfiguration":
                    mainService.showModal("unitNet_modal_back", "unitNetInfo_configuration_modal", "unitNetInfo_configuration_modal_title");
                    break;
                default:

            }
        }

        $scope.unitNetHideModal = function () {
            mainService.hideModal("unitNet_modal_back", "unitNetInfo_configuration_modal");
            $scope.dialogModalInfo.path = "";
            $scope.dialogModalInfo.state = "";
        }

        $scope.getDirectory = function () {
            cmsFile.getDirectory(2, function (files) {
                if (files) {
                    $scope.configuration.path = files[0];
                    $scope.$apply();
                }


            });
        }

        $scope.retrieveToday = function () {
            $scope.currentPage = 1;
            $scope.filterOption.page = 1;
            $scope.filterOption.isToday = 1;
            $scope.getCombStrategyNetInfo();
        }

        $scope.retrieveHistory = function () {
            $scope.currentPage = 1;
            $scope.filterOption.page = 1;
            $scope.filterOption.isToday = 0;
            $scope.getCombStrategyNetInfo();
        }

        $scope.clickNetInfoTr = function (netInfo) {
            currentNetInfo.selected = false;
            netInfo.selected = true;
            currentNetInfo = netInfo;
        }

    });
