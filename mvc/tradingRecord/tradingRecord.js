angular.module('cmsController').controller('tradingRecordCtrl',
function($scope, $interval, tradingRecordService, mainService) {
    $scope.dialogModalInfo={path:"", state:""}; // 第二次弹框的地址
    $scope.showSubguide=true;
    $scope.allAssetManager=[];

    $scope.currentUnit = {};
    var currentTradingRecord = {};

    $scope.currentPage=1;
    $scope.allPage=1;
    $scope.pageSize=20;

    $scope.guideTree = [];
    $scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;

    $scope.begin_date = new Date();
    $scope.end_date = new Date();

    $scope.exporting = false; //标示当前是否正在导出数据

    $scope.configuration = {exportTime1:new Date(cms.userData.tradingRecordCfg.exportTime1), exportTime2:new Date(cms.userData.tradingRecordCfg.exportTime2), path:cms.userData.tradingRecordCfg.path,
        excelType:cms.userData.tradingRecordCfg.excelType, applyAll:cms.userData.tradingRecordCfg.applyAll, autoExport:cms.userData.tradingRecordCfg.autoExport};

    $scope.filterOption = {begin_date: cms.formatDate_ex($scope.begin_date), end_date: cms.formatDate_ex($scope.end_date), page:1, isToday:1};
    //页面加载完毕
    $scope.$watch('$viewContentLoaded', function(){
        $scope.getAllTaMgr();
    });

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
        tradingRecordService.getAllTaMgr(requestData,function(res){
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
        tradingRecordService.getProducts(requestData,function(res){
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
        tradingRecordService.getCombStrategy(requestData,function(res){
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

    $scope.getTradingRecord = function () {
        if (!$scope.filterOption.isToday) {
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
        if(!$scope.filterOption.trid)
            return ;

        tradingRecordService.getTradingRecord({body:$scope.filterOption}, function(res) {
            if(res.msret.msgcode != '00') {
                $scope.tradingRecordArray = [];
                cms.message.error("获取所有的组合的净值信息失败."+res.msret.msg);
                return;
            }
            $scope.allPage = Math.ceil(res.body.totalCount/$scope.pageSize );
            $scope.allPage = $scope.allPage || 1;
            $scope.tradingRecordArray = res.body.data;
            $scope.$apply();
        });
    }

    $scope.clickUnit = function(unit) {
        $scope.currentUnit = unit;
        $scope.filterOption.trid = unit.trid;
        $scope.filterOption.page = 1;
        $scope.currentPage = 1;
        $scope.getTradingRecord();
    }

    $scope.changeStartDate = function( ) {
        $scope.filterOption.begin_date = cms.formatDate_ex($scope.begin_date) ;
        $scope.filterOption.page = 1;
        $scope.currentPage = 1;
        $scope.getTradingRecord();
    }

    $scope.changeEndDate = function( ) {
        $scope.filterOption.end_date = cms.formatDate_ex($scope.end_date) ;
        $scope.filterOption.page = 1;
        $scope.currentPage = 1;
        $scope.getTradingRecord();
    }

    $scope.goToPage=function (page) {
        page=page > $scope.allPage ? $scope.allPage : page;
        page=page < 1 ? 1 : page;
        $scope.currentPage=page;

        $scope.filterOption.page=$scope.currentPage;
        $scope.getTradingRecord();

    }

    $scope.clickApplyAll = function() {
        $scope.configuration.applyAll = !$scope.configuration.applyAll;
    }


    $scope.clickAutoExport = function() {
        $scope.configuration.autoExport = !$scope.configuration.autoExport;
    }

    $scope.confirmNetInfoCfg = function () {

        if (!cms.userData.hasOwnProperty("tradingRecordCfg")) {
            cms.userData.tradingRecordCfg = {};
        }
        cms.userData.tradingRecordCfg.exportTime1 = $scope.configuration.exportTime1;
        cms.userData.tradingRecordCfg.exportTime2 = $scope.configuration.exportTime2;
        cms.userData.tradingRecordCfg.path = $scope.configuration.path;
        cms.userData.tradingRecordCfg.excelType = $scope.configuration.excelType;
        cms.userData.tradingRecordCfg.applyAll = $scope.configuration.applyAll;
        cms.userData.tradingRecordCfg.autoExport = $scope.configuration.autoExport;

        if ($scope.configuration.applyAll) {
            cms.userData.netInfoCfg.path = $scope.configuration.path;
            cms.userData.unitPositionCfg.path = $scope.configuration.path;

            cms.userData.netInfoCfg.excelType = $scope.configuration.excelType;
            cms.userData.unitPositionCfg.excelType = $scope.configuration.excelType;

            cms.userData.netInfoCfg.applyAll = $scope.configuration.applyAll;
            cms.userData.unitPositionCfg.applyAll = $scope.configuration.applyAll;

            cms.userData.netInfoCfg.autoExport = $scope.configuration.autoExport;
            cms.userData.unitPositionCfg.autoExport = $scope.configuration.autoExport;

            cms.userData.netInfoCfg.exportTime1 = $scope.configuration.exportTime1;
            cms.userData.unitPositionCfg.exportTime1 = $scope.configuration.exportTime1;

            cms.userData.netInfoCfg.exportTime2 = $scope.configuration.exportTime2;
            cms.userData.unitPositionCfg.exportTime2 = $scope.configuration.exportTime2;
        }

        cms.writeFile("./userData.json",JSON.stringify(cms.userData, null, "\t"),function(err){
            if (err) {
                cms.message.error("写行情站点信息文件失败");
                return;
            }
            $scope.tradingRecordHideModal();
        });
    }

    $scope.cancelChangeNetInfoCfg = function () {
        $scope.configuration = {exportTime1:new Date(cms.userData.tradingRecordCfg.exportTime1), exportTime2:new Date(cms.userData.tradingRecordCfg.exportTime2), path:cms.userData.tradingRecordCfg.path,
            excelType:cms.userData.tradingRecordCfg.excelType, applyAll:cms.userData.tradingRecordCfg.applyAll, autoExport:cms.userData.tradingRecordCfg.autoExport};
            $scope.tradingRecordHideModal();
    }

    $scope.setConfiguration = function( ) {
        $scope.dialogModalInfo.path = "../tradingRecord/setConfiguration.html";
        $scope.dialogModalInfo.state = "setConfiguration";

    }

    $scope.manuallyExport = function () {
        if($scope.exporting) {
            return;
        }
        $scope.exporting = true;

        if (!$scope.filterOption.isToday) {
            if ($scope.begin_date > $scope.end_date) {
                cms.message.error("开始日期不能大于结束日期");
                $scope.exporting = false;
                return ;
            }
            // 判断时间是否大于3个月
            if (($scope.end_date.getTime() - $scope.begin_date.getTime()) > 92*24*60*60*1000 ) {
                cms.message.error("只能导出3个月的记录");
                $scope.exporting = false;
                return ;
            }
        }

        var requestData = {body:{begin_date:$scope.filterOption.begin_date, end_date:$scope.filterOption.end_date, trid:$scope.filterOption.trid,
            isToday:$scope.filterOption.isToday, page:1, pageSize:1000000}};
        tradingRecordService.getTradingRecord(requestData, function(res) {
            $scope.exporting = false;
            if(res.msret.msgcode != '00') {
                cms.message.error("获取组合的净值信息失败."+res.msret.msg);
                return;
            }
            if (!res.body.data.length) {
                cms.message.success("当前没有数据可以导出.");
                return;
            }
            var exportData = res.body.data, exportExceldata=[];
            exportData.forEach(function (obj) {
                exportExceldata.push([obj.trday, obj.trid, obj.direction, obj.begin, obj.end,
                    obj.marketcode, obj.tradevol, Number(obj.avgprice).toFixed(3)]);
            });

            var dataObj={data:exportExceldata,fileName:"组合"+$scope.filterOption.trid+"交易汇总信息", fileType:"xlsx",
            headers:["日期", "策略组合", "交易方向", "交易开始时间", "交易结束时间", "股票代码", "数量", "均价"]};

            cms.exportExcelFile(dataObj,function(err,res){
                if (err) {
                    cms.message.error("导出表格数据失败。");
                    return;
                }
                if (!res.result) {
                    cms.message.error("导出表格数据失败。"+res.reason);
                    return;
                }
                cms.message.success("导出组合交易汇总信息成功");
            });
        });
    }

    $scope.showtradingRecordModalLoadReady = function () {
        switch ($scope.dialogModalInfo.state) {
            case "setConfiguration":
                mainService.showModal("tradingRecord_modal_back","tradingRecord_configuration_modal","tradingRecord_configuration_modal_title");
                break;
            default:

        }
    }

    $scope.tradingRecordHideModal = function( ) {
        mainService.hideModal("tradingRecord_modal_back","tradingRecord_configuration_modal");
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
        if ($scope.filterOption.isToday) {
            return;
        }
        $scope.currentPage = 1;
        $scope.filterOption.page = 1;
        $scope.filterOption.isToday = 1;
        $scope.getTradingRecord();
    }

    $scope.retrieveHistory= function( ) {

        if (!$scope.filterOption.isToday) {
            return;
        }
        $scope.currentPage = 1;
        $scope.filterOption.page = 1;
        $scope.filterOption.isToday = 0;
        $scope.getTradingRecord();
    }

    $scope.clickTradingRecordTr = function(tradingRecord) {
        currentTradingRecord.selected = false;
        tradingRecord.selected = true;
        currentTradingRecord = tradingRecord;
    }

});
