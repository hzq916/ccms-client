angular.module('cmsController').controller('unitPositionInfoCtrl',
function($scope, $interval,$timeout, unitPositionInfoService, mainService) {
    $scope.dialogModalInfo={path:"", state:""}; // 第二次弹框的地址
    $scope.showSubguide=true;
    $scope.allAssetManager=[];

    $scope.currentUnit = {};
    var currentPosition = {};
    var refreshTimer ; //保存定时获取行情刷新界面的定时器
    $scope.unitPositionInfoArray = [];

    $scope.currentPage=1;
    $scope.allPage=1;
    $scope.pageSize=20;

    $scope.guideTree = [];
    $scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;

    $scope.exportUnitPositionCount = -1; // 导出时间的计数，没两秒加一

    $scope.begin_date = new Date();
    $scope.end_date = new Date();

    $scope.configuration = {exportTime1:new Date(cms.userData.unitPositionCfg.exportTime1), exportTime2:new Date(cms.userData.unitPositionCfg.exportTime2), path:cms.userData.unitPositionCfg.path,
        excelType:cms.userData.unitPositionCfg.excelType, applyAll:cms.userData.unitPositionCfg.applyAll, autoExport:cms.userData.unitPositionCfg.autoExport};

    $scope.filterOption = {begin_date: cms.formatDate_ex($scope.begin_date), end_date: cms.formatDate_ex($scope.end_date), page:1, isToday:1};

    var subscribeMarketForDisplay = false;

    //页面加载完毕
    $scope.$watch('$viewContentLoaded', function(){
        $scope.getAllTaMgr();
    });

    //菜单改变
    $scope.$on("mainMenuChange",function(event,menu) {
        if(menu.menuId == "2004003" ) {
            $scope.getUnitPositionInfo();
        } else {
            if(refreshTimer) {
                $interval.cancel(refreshTimer);
                refreshTimer = null;
                tryUnsubscribe(); //取消之前的行情信息
            }
        }
    });

    function tryUnsubscribe () {
        if (subscribeMarketForDisplay) {
            mainService.unsubscribeMarket($scope.unitPositionInfoArray);
            subscribeMarketForDisplay = false ;
        }
    }

    //点击表头
	$scope.clickTableHeader = function(keyName,isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse,isNumber);
	}

	$scope.$on("changedManager_broadcast", function(event, message) {
        $scope.getAllTaMgr();
	});

	$scope.$on("changedProduct_broadcast", function(event, message) {
        $scope.getAllTaMgr();

	});

    $scope.getAllTaMgr=function(){
        //首先清空已有数据
        $scope.allAssetManager=[];

        var requestData = {body:{}};
        unitPositionInfoService.getAllTaMgr(requestData,function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("获取所有资产管理人失败."+res.msret.msg);
                return;
            }
            $scope.allAssetManager=res.body;

            $scope.allAssetManager.forEach(function(obj){
                obj.maid=parseInt(obj.maid);
                obj.menuId = obj.maid;
                obj.menuName = obj.maname+"("+obj.maid+")";
                obj.type = 'maid';
                obj.children = [];

            });
            if ($scope.allAssetManager.length) {
                $scope.getProducts();
            }

            $scope.$apply();
        });
    }

    $scope.getProducts=function(){
        var requestData = {body:{}};
        unitPositionInfoService.getProducts(requestData,function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("获取所有产品失败."+res.msret.msg);
                return;
            }

            $scope.products=res.body;
            var i = 0,j=0;
            for (; i < $scope.products.length; i++) {
                $scope.products[i].maid=parseInt($scope.products[i].maid);
                $scope.products[i].caid=parseInt($scope.products[i].caid);
                $scope.products[i].menuId = $scope.products[i].caid;
                $scope.products[i].menuName = $scope.products[i].caname+"("+$scope.products[i].caid+")";
                $scope.products[i].type = 'caid';
                $scope.products[i].children=[];
                var maIndex=cms.accurateSearch($scope.allAssetManager,"maid",($scope.products[i].maid));
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

    $scope.getCombStrategy=function(){
        var requestData = {body:{}};
        unitPositionInfoService.getCombStrategy(requestData,function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("获取所有的组合策略失败."+res.msret.msg);
                return;
            }
            var tradeUnits=res.body;
            var i = 0,j=0;
            for (; i < tradeUnits.length; i++) {
                tradeUnits[i].maid=parseInt(tradeUnits[i].maid);
                tradeUnits[i].caid=parseInt(tradeUnits[i].caid);
                tradeUnits[i].trid=parseInt(tradeUnits[i].trid);

                tradeUnits[i].menuId = tradeUnits[i].trid;
                tradeUnits[i].menuName = tradeUnits[i].trname+"("+tradeUnits[i].trid+")";
                tradeUnits[i].type = 'trid';

                var maIndex=cms.accurateSearch($scope.allAssetManager,"maid",(tradeUnits[i].maid));
                if (maIndex != -1) {
                    var caIndex=cms.accurateSearch($scope.allAssetManager[maIndex].children,"caid",(tradeUnits[i].caid));
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
            $scope.guideTree=$scope.allAssetManager;
            $scope.$apply();
        });
    }

    $scope.getUnitPositionInfo = function () {
        if(!$scope.filterOption.trid) {
            return;
        }
        if ($scope.filterOption.isToday === 0) {
            if ($scope.begin_date > $scope.end_date) {
                cms.message.error("开始日期不能大于结束日期");
                return ;
            }
            // 判断时间是否大于3个月
            if (($scope.end_date.getTime() - $scope.begin_date.getTime()) > 92*24*60*60*1000 ) {
                cms.message.error("只能查询3个月的记录");
                return ;
            }
        }

        if(refreshTimer) {
            $interval.cancel(refreshTimer);
            refreshTimer = null;
        }

        var requestPositionData = {body:{begin_date:$scope.filterOption.begin_date, end_date:$scope.filterOption.end_date, trid:$scope.filterOption.trid,
            isToday: $scope.filterOption.isToday, page:$scope.filterOption.page, pageSize:$scope.pageSize}};
        if ($scope.filterOption.isToday === 1) {
            unitPositionInfoService.getUnitPositionInfo(requestPositionData, function(res) {
                if(res.msret.msgcode != '00') {
                    tryUnsubscribe();
                    $scope.unitPositionInfoArray = [];
                    cms.message.error("获取组合当日持仓数据失败."+res.msret.msg);
                    return;
                }

                tryUnsubscribe();
                if (requestPositionData.body.isToday != $scope.filterOption.isToday) {
                    return;
                }

                var totalPosition = res.body.data,  hadStock =false, hadFutures =false;
                var today = cms.formatDate_ex(new Date());
                totalPosition.forEach(function(position) {
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

                $scope.allPage = Math.ceil(res.body.totalCount/$scope.pageSize );
                $scope.allPage = $scope.allPage || 1;

                mainService.subscribeMarket(totalPosition);
                subscribeMarketForDisplay = true;
                mainService.getUkeyMarketInfo(totalPosition);
                $scope.unitPositionInfoArray = totalPosition;

                if(totalPosition.length) {
                    $interval.cancel(refreshTimer);
                    refreshTimer = $interval(function() {
                        mainService.getUkeyMarketInfo($scope.unitPositionInfoArray);
                        console.log("refreshTimer getUkeyMarketInfo", new Date());
                    }, 3000);
                }
                $scope.$apply();
            });
        } else {
            tryUnsubscribe();
            if (requestPositionData.body.isToday != $scope.filterOption.isToday) {
                return;
            }

            unitPositionInfoService.getUnitPositionInfo({body:$scope.filterOption}, function(res) {
                if(res.msret.msgcode != '00') {
                    cms.message.error("获取所有的组合的净值信息失败."+res.msret.msg);
                    return;
                }
                $scope.allPage = Math.ceil(res.body.totalCount/$scope.pageSize );
                $scope.allPage = $scope.allPage || 1;
                $scope.unitPositionInfoArray = res.body.data;

                $scope.unitPositionInfoArray.forEach(function(position) {
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
                $scope.$apply();
            });
        }
    }

    $scope.clickUnit = function(unit) {
        $scope.currentUnit = unit;
        $scope.filterOption.trid = unit.trid;
        $scope.filterOption.page = 1;
        $scope.currentPage = 1;

        $scope.getUnitPositionInfo();
    }

    $scope.changeStartDate = function( ) {
        $scope.filterOption.begin_date = cms.formatDate_ex($scope.begin_date) ;
        $scope.filterOption.page = 1;
        $scope.currentPage = 1;
        $scope.getUnitPositionInfo();
    }

    $scope.changeEndDate = function( ) {
        $scope.filterOption.end_date = cms.formatDate_ex($scope.end_date) ;
        $scope.filterOption.page = 1;
        $scope.currentPage = 1;
        $scope.getUnitPositionInfo();
    }

    $scope.goToPage=function (page) {
        page=page > $scope.allPage ? $scope.allPage : page;
        page=page < 1 ? 1 : page;
        $scope.currentPage=page;

        $scope.filterOption.page=$scope.currentPage;
        $scope.getUnitPositionInfo();

    }

    $scope.clickApplyAll = function() {
        $scope.configuration.applyAll = !$scope.configuration.applyAll;
    }


    $scope.clickAutoExport = function() {
        $scope.configuration.autoExport = !$scope.configuration.autoExport;
    }

    $scope.confirmNetInfoCfg = function () {

        if (!cms.userData.hasOwnProperty("unitPositionCfg")) {
            cms.userData.unitPositionCfg = {};
        }
        cms.userData.unitPositionCfg.exportTime1 = $scope.configuration.exportTime1;
        cms.userData.unitPositionCfg.exportTime2 = $scope.configuration.exportTime2;
        cms.userData.unitPositionCfg.path = $scope.configuration.path;
        cms.userData.unitPositionCfg.excelType = $scope.configuration.excelType;
        cms.userData.unitPositionCfg.applyAll = $scope.configuration.applyAll;
        cms.userData.unitPositionCfg.autoExport = $scope.configuration.autoExport;

        if ($scope.configuration.applyAll) {
            cms.userData.netInfoCfg.path = $scope.configuration.path;
            cms.userData.tradingRecordCfg.path = $scope.configuration.path;

            cms.userData.netInfoCfg.excelType = $scope.configuration.excelType;
            cms.userData.tradingRecordCfg.excelType = $scope.configuration.excelType;

            cms.userData.netInfoCfg.applyAll = $scope.configuration.applyAll;
            cms.userData.tradingRecordCfg.applyAll = $scope.configuration.applyAll;

            cms.userData.netInfoCfg.autoExport = $scope.configuration.autoExport;
            cms.userData.tradingRecordCfg.autoExport = $scope.configuration.autoExport;

            cms.userData.netInfoCfg.exportTime1 = $scope.configuration.exportTime1;
            cms.userData.tradingRecordCfg.exportTime1 = $scope.configuration.exportTime1;

            cms.userData.netInfoCfg.exportTime2 = $scope.configuration.exportTime2;
            cms.userData.tradingRecordCfg.exportTime2 = $scope.configuration.exportTime2;
        }

        cms.writeFile("./userData.json",JSON.stringify(cms.userData, null, "\t"),function(err){
            if (err) {
                cms.message.error("写行情站点信息文件失败");
                return;
            }
            $scope.unitPositionHideModal();
        });
    }

    $scope.cancelChangeNetInfoCfg = function () {
        $scope.configuration = {exportTime1:new Date(cms.userData.unitPositionCfg.exportTime1),  exportTime2:new Date(cms.userData.unitPositionCfg.exportTime2), path:cms.userData.unitPositionCfg.path,
            excelType:cms.userData.unitPositionCfg.excelType, applyAll:cms.userData.unitPositionCfg.applyAll, autoExport:cms.userData.unitPositionCfg.autoExport};
            $scope.unitPositionHideModal();
    }

    $scope.setConfiguration = function( ) {
        $scope.dialogModalInfo.path = "../unitPositionInfo/setConfiguration.html";
        $scope.dialogModalInfo.state = "setConfiguration";

    }

    $scope.manuallyExport = function () {
        if ($scope.exportUnitPositionCount != -1) {
            return;
        }
        $scope.exportUnitPositionCount = 0;

        if ($scope.filterOption.isToday === 0) {
            if ($scope.begin_date > $scope.end_date) {
                cms.message.error("开始日期不能大于结束日期");
                $scope.exportUnitPositionCount = -1;
                return ;
            }
            // 判断时间是否大于3个月
            if (($scope.end_date.getTime() - $scope.begin_date.getTime()) > 92*24*60*60*1000 ) {
                cms.message.error("只能导出3个月的记录");
                $scope.exportUnitPositionCount = -1;
                return ;
            }
        }

        if(!$scope.filterOption.trid) {
            $scope.exportUnitPositionCount = -1;
            return ;
        }

        if ($scope.filterOption.isToday  === 1) {
            cmsFile.getSaveExcelFileName("组合"+$scope.filterOption.trid+"持仓信息.xlsx",function(fileName) {
                if (!fileName) {
                    cms.message.error("获取导出文件的路径失败.");
                    $scope.exportUnitPositionCount = -1;
                    $scope.$apply();
                    return;
                }
                cms.message.success("正在获取数据,需要一分钟左右,请稍后.");
                var requestData = {body:{begin_date:$scope.filterOption.begin_date, end_date:$scope.filterOption.end_date,
                    page:1, isToday:1, pageSize:1000000, trid:$scope.filterOption.trid}};

                unitPositionInfoService.getUnitPositionInfo(requestData, function(res) {
                    if(res.msret.msgcode != '00') {
                        cms.message.error("获取组合当日持仓数据失败."+res.msret.msg);
                        $scope.exportUnitPositionCount = -1;
                        $scope.$apply();
                        return;
                    }
                    var totalPosition = res.body.data,  hadStock =false, hadFutures =false;
                    var today = cms.formatDate_ex(new Date());

                    mainService.subscribeMarket(totalPosition);
                    totalPosition.forEach(function(position) {
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
                    $scope.exportUnitPositionInterval = $interval(function() {
                        if (++$scope.exportUnitPositionCount >= 30 ||
                            mainService.getUkeyMarketInfo(totalPosition)) {
                                $interval.cancel($scope.exportUnitPositionInterval);
                                mainService.unsubscribeMarket(totalPosition); //取消之前的行情信息
                                $scope.exportUnitPositionCount = -1;

                                var exportExceldata=[];
                                totalPosition.forEach(function (obj) {
                                    exportExceldata.push([obj.trday, obj.trid, obj.tracid, obj.marketcode, obj.directionStr,  obj.satypeStr, obj.totalvol,
                                    Number(obj.holdcost).toFixed(3), Number(obj.buyamt).toFixed(3), obj.validvol, obj.onwayvol, Number(obj.price).toFixed(3), Number(obj.value).toFixed(3)]);
                                });

                                var dataObj={data:exportExceldata,fileName:"组合"+$scope.filterOption.trid+"持仓信息", fileType:"xlsx",
                                headers:["日期", "策略组合", "交易账户", "股票代码", "买卖方向", "持仓类型", "持股数量", "持仓成本",
                                 "买入金额", "可交易股数", "不可交易股数", "最新价格", "最新市值"]};

                                cmsFile.exportExcelFileWithoutSaveDialog(dataObj,function(err,res){
                                    if (err) {
                                        cms.message.error("导出表格数据失败。");
                                        return;
                                    }
                                    if (!res.result) {
                                        cms.message.error("导出表格数据失败。"+res.reason);
                                        return;
                                    }
                                    cms.message.success("导出组合持仓信息成功");
                                }, fileName);
                        }
                    }, 2000);
                });
            });


        } else {
            var requestData = {body:{begin_date:$scope.filterOption.begin_date, end_date:$scope.filterOption.end_date,
                page:1, isToday:0, pageSize:1000000, trid:$scope.filterOption.trid}};
            unitPositionInfoService.getUnitPositionInfo(requestData, function(res) {
                $scope.exportUnitPositionCount = -1;
                if(res.msret.msgcode != '00') {
                    cms.message.error("获取所有的组合的净值信息失败."+res.msret.msg);
                    $scope.$apply();
                    return;
                }
                if (!res.body.data.length) {
                    cms.message.success("当前没有数据可以导出.");
                    $scope.$apply();
                    return;
                }

                var exportData = res.body.data, exportExceldata=[];
                exportData.forEach(function (obj) {
                    switch (obj.direction) {
                        case "1":
                            obj.directionStr = "买";
                            break;
                        case "2":
                            obj.directionStr = "卖";
                            break;
                        default:

                    }
                    switch (obj.satype) {
                        case "10":
                            obj.satypeStr = "底仓";
                            break;
                        case "11":
                            obj.satypeStr = "外部底仓";
                        case "20":
                            obj.satypeStr = "预约券";
                            break;
                        case "21":
                            obj.satypeStr = "市场券";
                            break;
                        default:
                    }
                    exportExceldata.push([obj.trday, obj.trid, obj.tracid, obj.marketcode, obj.directionStr,  obj.satypeStr, obj.totalvol,
                        Number(obj.holdcost).toFixed(3), Number(obj.buyamt).toFixed(3), obj.validvol, obj.onwayvol, Number(obj.price).toFixed(3), Number(obj.value).toFixed(3)]);
                });

                var dataObj={data:exportExceldata,fileName:"组合"+$scope.filterOption.trid+"持仓信息", fileType:"xlsx",
                headers:["日期", "策略组合", "交易账户", "股票代码", "买卖方向", "持仓类型", "持股数量", "持仓成本",
                 "买入金额", "可交易股数", "不可交易股数", "最新价格", "最新市值"]};

                cms.exportExcelFile(dataObj,function(err,res){
                    if (err) {
                        cms.message.error("导出表格数据失败。");
                        return;
                    }
                    if (!res.result) {
                        cms.message.error("导出表格数据失败。"+res.reason);
                        return;
                    }
                    cms.message.success("导出组合持仓信息成功");
                });
                $scope.$apply();
            });
        }


    }

    $scope.showunitPositionModalLoadReady = function () {
        switch ($scope.dialogModalInfo.state) {
            case "setConfiguration":
                mainService.showModal("unitPosition_modal_back","unitPosition_configuration_modal","unitPositionInfo_configuration_modal_title");
                break;
            default:

        }
    }

    $scope.unitPositionHideModal = function( ) {
        mainService.hideModal("unitPosition_modal_back","unitPosition_configuration_modal");
        $scope.dialogModalInfo.path = "";
        $scope.dialogModalInfo.state = "";
    }

    $scope.getDirectory= function( ) {
        cmsFile.getDirectory(2, function(files) {
            if (files) {
                $scope.configuration.path = files[0];
                $scope.$apply();
            }


        });
    }

    $scope.retrieveToday= function( ) {
        $scope.currentPage = 1;
        $scope.filterOption.page = 1;
        $scope.filterOption.isToday = 1;
        $scope.getUnitPositionInfo();
    }

    $scope.retrieveHistory= function( ) {
        $scope.currentPage = 1;
        $scope.filterOption.page = 1;
        $scope.filterOption.isToday = 0;
        $scope.getUnitPositionInfo();
    }

    $scope.clickPositionInfoTr = function(positionInfo) {
        currentPosition.selected = false;
        positionInfo.selected = true;
        currentPosition = positionInfo;
    }

});
