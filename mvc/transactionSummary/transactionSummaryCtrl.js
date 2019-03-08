angular.module('cmsController').controller('transactionSummaryCtrl',
function($scope,transactionSummaryService,mainService) {

    $scope.currentTrIndex=-1;
    $scope.currentAuthTrIndex=-1;
    $scope.selectedVersionMD5={};

    $scope.alltransationSummaryData = [];
    $scope.transationSummaryList = {};

    $scope.addCustomStrategy={
        "type":"0",
        "name":"",
        "mark":"",
        "operatorId":"",
        "product":"",
        "strategy":""
    };
    
    $scope.changeCustomStrategy={
        "type":"0",
        "name":"",
        "mark":"",
        "operatorId":"",
        "product":"",
        "strategy":"",
        "ssid":"",
        "stgid":""
    };

    $scope.changeScriptData = {
        "path":"",
        "name":"",
        "params":"",
        "ssid":"",
        "type":""
    };
    $scope.changeScriptArr = {};

    $scope.stopScriptData = {
        "path":"",
        "name":"",
        "params":"",
        "ssid":"",
        "type":""
    };
    $scope.stopScriptArr = {};


    $scope.modalProduct = {
        caid:"0000",
        caname: "请选择产品"
    };

    $scope.modalStrategy = {
        acid:"0000",
        acname: "请选择账户"
    };

    $scope.modalTamgr = {
        maid:"0000",
        maname: "请选择资产管理人"
    };

    $scope.modalInfo={path:"", state:""};
    $scope.searchFeild="";

    $scope.keyName = "";
	$scope.reverse = false;
    $scope.sortFunction = null;
    

    $scope.selectedTamgrAll = []; //外边的资产管理人
    $scope.selectedProductAll =[]; //外边的产品
    $scope.selectedSttrategyAll = []; //外边的组合
    $scope.selectedProduct = "0000"; //外边下拉产品
    $scope.selectedSttrategy = "0000"; //外边下拉组合
    $scope.selectedTamgr = "0000";

    $scope.allcustomStrategyPage = 1; //总页数
    $scope.currentcustomStrategyPagePage = 1; //当前页
    $scope.pagesize = 20;


    $scope.begin_date = new Date();
    $scope.end_date = new Date();














    //页面加载完毕
    $scope.$watch('$viewContentLoaded', function(){
        $scope.getSelectTamgr();
        $scope.getSelectProduct();
        $scope.getSelectStrategy();
        $scope.getTransactionSummary();
    });

    //点击表头
	$scope.clickTableHeader = function(keyName,isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse,isNumber);
    }

    $scope.changOutSideTamgr = function(){
        $scope.getSelectProduct();
    }


    $scope.changOutSideProduct = function(){
        $scope.getSelectStrategy();
        // $scope.getTransactionSummary();
    }

    $scope.changOutSideStrategy=function(){
        $scope.getTransactionSummary();
    }




    $scope.getSelectTamgr = function() {
        var requestData={body:{}};
        transactionSummaryService.getTamgr(requestData,function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取资产管理人失败."+res.msret.msg);
                return;
            }
            $scope.selectedTamgrAll = res.body;
            $scope.selectedTamgrAll.unshift($scope.modalTamgr);
            $scope.selectedTamgr = "0000";
            console.log($scope.selectedTamgrAll);
            $scope.$apply();
            $scope.getSelectProduct();
        });
    };


    

    //获取外边的产品下拉列表
    $scope.getSelectProduct = function() {
        var requestData={body:{}};
        transactionSummaryService.getSelectProduct(requestData,function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取产品失败."+res.msret.msg);
                return;
            }
            $scope.selectedProductAll = res.body;
            $scope.selectedProductAll.unshift($scope.modalProduct);
            $scope.selectedProduct = "0000";
            console.log($scope.selectedProductAll);
            $scope.$apply();
            $scope.getTransactionSummary();
        });
    };
    //获取外边组合的下拉列表
    $scope.getSelectStrategy = function() {
        if ($scope.selectedTamgr != "0000") {
            var requestData = {body:{maid: $scope.selectedTamgr}};
        } else {
            var requestData = {body:{}};
        }
        transactionSummaryService.getAssetAccount(requestData,function(res) {
            console.log(res);
            if(res.msret.msgcode != '00') {
                cms.message.error("获取资金账户失败."+res.msret.msg);
                return;
            }
            $scope.selectedSttrategyAll = res.body;
            if ($scope.selectedProduct != "0000") {
                $scope.selectedSttrategy = $scope.selectedSttrategyAll[0]["acid"];
            } else {
                $scope.selectedSttrategyAll.unshift($scope.modalStrategy);
                $scope.selectedSttrategy = "0000";
            }
            console.log($scope.selectedSttrategyAll);
            $scope.$apply();
            $scope.getTransactionSummary();
        });
    }
    //获取交易汇总数据
     /**
         * actype: １(普通股票账户) 2(信用股票账户) 3(期货账户) 4(虚拟货比账户) 5(股票齐全账户)
        */
    $scope.getTransactionSummary=function() {
        var requestData={body:{begin_date:cms.formatDate_ex($scope.begin_date),end_date: cms.formatDate_ex($scope.end_date)}};
        console.log("____________________");
        console.log($scope.selectedProduct);
        console.log($scope.selectedSttrategy);
        if ($scope.selectedTamgr != "0000") {
            requestData.body.maid = $scope.selectedTamgr;
            console.log("选中了资产管理人");
        }
        if ($scope.selectedProduct != "0000") {
            //表示查询所有
            requestData.body.caid = $scope.selectedProduct;
            console.log("选中了产品");
        }
        if ($scope.selectedSttrategy != "0000") {
            console.log("选中了组合");
            requestData.body.acid = $scope.selectedSttrategy;
        }
        console.log(requestData);
        console.log("请求交易汇总数据");
        transactionSummaryService.getTransactionSummary(requestData,function(res) {
            console.log(res);
            if(res.msret.msgcode != '00') {
                cms.message.error("获取交易汇总数据失败."+res.msret.msg);
                return;
            }

            console.log(res.body);
            $scope.transationSummaryList = res.body;
            $scope.alltransationSummaryData = res.body.data;
           for(var i = 0; i<$scope.alltransationSummaryData.length; i++) {
            if ($scope.alltransationSummaryData[i]["stgtype"] === "1") {
                //1代表仿真 0代表实盘 2代表回测
                $scope.alltransationSummaryData[i]["stgtype"] = "仿真";
            } else if ($scope.alltransationSummaryData[i]["stgtype"] === "0") {
                $scope.alltransationSummaryData[i]["stgtype"] = "实盘";
            } else {
                $scope.alltransationSummaryData[i]["stgtype"] = "回测";
            }
            if ($scope.alltransationSummaryData[i]["actype"] === "1") {
                $scope.alltransationSummaryData[i]["actype"] = "普通股票账户";
            } else if ($scope.alltransationSummaryData[i]["actype"] === "2") {
                $scope.alltransationSummaryData[i]["actype"] = "信用股票账户";
            } else if ($scope.alltransationSummaryData[i]["actype"] === "3") {
                $scope.alltransationSummaryData[i]["actype"] = "期货账户";
            } else if ($scope.alltransationSummaryData[i]["actype"] === "4") {
                $scope.alltransationSummaryData[i]["actype"] = "虚拟货比账户";
            } else if ($scope.alltransationSummaryData[i]["actype"] === "5") {
                $scope.alltransationSummaryData[i]["actype"] = "股票期权账户";
            } else {
                //
            }
           }
            $scope.$apply();
        });
    }

   
    //隐藏弹框
    $scope.hidecustomStrategyModal=function() {
        $scope.modalInfo={path:"", state:""};
        mainService.hideModal("transactionSummary_modal_back");
    }

    	//导出自定义策略数据
	$scope.exportCustomStrategyData = function(){

		if($scope.alltransationSummaryData.length<=0){
			cms.message.error("表中没有可导出的数据");
			return;
		}
		var exportData = {};
		var headers = ["资产管理人","产品","资产账户","资金账号","账户类型","创建日期","总成交金额","总成交数量","买入数量","买入成交金额", "卖出数量","卖出成交金额","总费用","平仓盈亏"];
		exportData.headers = headers;
		exportData.fileType = "xlsx";
		exportData.fileName = "交易汇总";
		exportData.data = [];

		angular.forEach($scope.alltransationSummaryData,function(dataCell) {
			var tempCell = [];
				tempCell.push(dataCell.maname + '(' + dataCell.maid + ")");
				tempCell.push(dataCell.caname + "(" + dataCell.caid + ")");
				tempCell.push(dataCell.acname + "(" + dataCell.acid + ")");
				tempCell.push(dataCell.bacid);
				tempCell.push(dataCell.actype);
				tempCell.push(dataCell.createtime);
                tempCell.push(dataCell.allvol);
                tempCell.push(dataCell.allamt);
                tempCell.push(dataCell.buyvol);
                tempCell.push(dataCell.buyamt);
                tempCell.push(dataCell.sellvol);
                tempCell.push(dataCell.sellamt);
                tempCell.push(dataCell.tractfee);
                tempCell.push(dataCell.holdclosepl);

				exportData.data.push(tempCell);
		})

		transactionSummaryService.exportDataToExcelFile(exportData,function(err,res) {
			if(err) return ;
			if(res.result == true) {
				cms.message.success("导出数据成功.");
			}
			else {
				cms.message.error("导出数据失败."+res.reason);
				cms.log("导出数据失败：",res.reason);
			}
		})
	}



    // $scope.customStrategyLoadModalReady=function() {
    //     if ($scope.modalInfo.state === "addCustomStrategy") {
    //         console.log("显示新增自定义策略");
    //         mainService.showModal("transactionSummary_modal_back","addCustomStrategy_modal_back_add_modal","addCustomStrategy_modal_back_add_modal_title");
    //     } else if ($scope.modalInfo.state === "changeCustomStrategy") {
    //         mainService.showModal("transactionSummary_modal_back","changeCustomStrategy_add_modal","changeCustomStrategy_add_modal_title");
    //     } else if ($scope.modalInfo.state === "changeScript") {
    //         mainService.showModal("transactionSummary_modal_back","changeScript_del_modal","changeScript_del_modal_title");
    //     } else if ($scope.modalInfo.state === "stopScript") {
    //         mainService.showModal("transactionSummary_modal_back","stopScript_auth_modal","stopScript_auth_modal_title");
    //     }
    // }


    $scope.filterMd5=function(obj) {
        return (obj.appname.indexOf($scope.searchFeild) !== -1) || (obj.version.indexOf($scope.searchFeild) !== -1);
    }

    $scope.seachUkcode=function(keyevent) {
        if (keyevent.keyCode === 13) { //回车
            $scope.getVersionMD5();

        } else if (keyevent.keyCode === 27) {  //escape
            $scope.searchFeild="";
        }
    }
});
