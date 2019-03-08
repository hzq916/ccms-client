angular.module('cmsController').controller('ukcodeManageCtrl',
function($scope,ukcodeManageService,mainService) {
    $scope.markets=[]; // 保存所有的市场信息
    $scope.uktypes=[]; //保存所有的ukcode的品种类型
    $scope.currentUktype={majortype:"0", minortype:"0"};
    $scope.currentTrIndex=-1;

    $scope.modalInfo={path:"", state:""};
    $scope.operateUkCode={};

    $scope.allUkCode=[];
    $scope.selectedUkCode={};

    $scope.currentPage=1;
    // $scope.lastVersionPage=1;
    $scope.allPage=1;
    $scope.pageSize=20;
    $scope.filterOption={marketid:"0", majortype:$scope.currentUktype.majortype, minortype:$scope.currentUktype.minortype};

    $scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;

    $scope.marketObj = {};
    $scope.currencyObj = {};

    //页面加载完毕
    $scope.$watch('$viewContentLoaded', function(){
        $scope.getMarket();
        $scope.getCurrency();
        $scope.getUktype($scope.goToPage);
        // $scope.goToPage(1);
    });

    $scope.clickTr=function(ukcode) {
        $scope.selectedUkCode.selected=false;
        ukcode.selected=true;
        $scope.selectedUkCode=ukcode;
    }

    //点击表头
	$scope.clickTableHeader = function(keyName,isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse,isNumber);
	}

    $scope.getMarket=function( ) {
        var requestData={body:{}};
        ukcodeManageService.getMarket(requestData, function(res ) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取所有市场信息失败."+res.msret.msg);
                return;
            }
            $scope.markets=res.body;
            for (var i = 0; i < $scope.markets.length; i ++) {
                $scope.marketObj[$scope.markets[i].marketid] = $scope.markets[i];
            }
            $scope.$apply();
        });
    }

    $scope.getUktype=function( goToPage ) {
        $scope.uktypes=[];
        var requestData={body:{}};
        ukcodeManageService.getUkType(requestData, function(res ) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取ukcode的品种失败."+res.msret.msg);
                return;
            }
            $scope.uktypes=res.body;
            $scope.uktypes.splice(0,0,{majortype:"0", minortype:"0", typechname:"全部品种", typeenname:"allType"});
            $scope.currentUktype=$scope.uktypes[0];

            if (typeof goToPage == "function") {
                goToPage(1);
            }

            $scope.$apply();
        });
    }

    $scope.getCurrency=function() {
        var requestData = {body:{}};
        ukcodeManageService.getCurrency(requestData,function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("获取币种失败."+res.msret.msg);
                return;
            }
            $scope.allCurrency=res.body;
            for (var i = 0; i < $scope.allCurrency.length; i ++) {
                $scope.currencyObj[$scope.allCurrency[i].currencyid] = $scope.allCurrency[i];
            }
            $scope.$apply();
        });
    }

    $scope.resetUkcode=function( ) {
        $scope.filterOption={marketid:"0", majortype:"0", minortype:"0", pageNum:1, searchFeild:""};
        $scope.goToPage(1);
    }

    $scope.getUkcode=function( option ) {
        option=option||{pageSize:20,pageNum:1};
        $scope.allUkCode=[];

        var requestData={body:{}};

        requestData.body.pageNum=option.pageNum;
        requestData.body.pageSize=option.pageSize;
        if (option.searchFeild != "") {
            requestData.body.searchFeild=option.searchFeild;
        }
        if(option.marketid != "0") {
            requestData.body.marketid=option.marketid;
        }
        if(option.majortype != "0") {
            requestData.body.majortype=option.majortype;
            requestData.body.minortype=option.minortype;
        }
        ukcodeManageService.getUkcode(requestData, function(res ) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取ukcode失败."+res.msret.msg);
                return;
            }

            $scope.allUkCode=res.body;
            $scope.allPage=Math.ceil(parseInt(res.recordNumber)/$scope.pageSize);
            $scope.allPage=isNaN( $scope.allPage ) ? 1 : $scope.allPage;

            $scope.allUkCode.forEach(function(obj) {
                for (var i = 0; i < $scope.uktypes.length; i++) {
                    if ($scope.uktypes[i].majortype == obj.majortype &&
                        $scope.uktypes[i].minortype == obj.minortype ) {
                            obj.uktype=$scope.uktypes[i];
                            obj.uktypeStr=$scope.uktypes[i].typechname;
                            break;
                    }
                }
            });
            $scope.$apply();
        });
    }

    $scope.addUkcode=function(ukcodeObj ) {
        if(!$scope.checkUKcodeDataValid(ukcodeObj)) {
            return;
        }

        var requestData={body:{ukcode:ukcodeObj.ukcode, ukext:ukcodeObj.ukext, marketid:ukcodeObj.marketid,
            majortype:ukcodeObj.uktype.majortype,minortype:ukcodeObj.uktype.minortype, marketcode:ukcodeObj.marketcode,
            chname:ukcodeObj.chname, enname:ukcodeObj.enname, chabbr:ukcodeObj.chabbr, currencyid:ukcodeObj.currencyid,
            jycode:ukcodeObj.jycode, windcode:ukcodeObj.windcode, listdate:ukcodeObj.listdate, delistdate:ukcodeObj.delistdate, inputcode:ukcodeObj.inputcode}};
        ukcodeManageService.addUkcode(requestData, function(res ) {
            if(res.msret.msgcode != '00') {
                cms.message.error("增加ukcode失败."+res.msret.msg);
                return;
            }
            $scope.hideUkCodeModal();
            cms.message.success("增加ukcode成功");
            $scope.goToPage($scope.currentPage);
            $scope.$apply();
        });
    }

    $scope.editUkcode=function(ukcodeObj ) {
        if(!$scope.checkUKcodeDataValid(ukcodeObj)) {
            return;
        }

        var requestData={body:{ukcode:ukcodeObj.ukcode, ukext:ukcodeObj.ukext, marketid:ukcodeObj.marketid,
            majortype:ukcodeObj.uktype.majortype,minortype:ukcodeObj.uktype.minortype, marketcode:ukcodeObj.marketcode,
            chname:ukcodeObj.chname, enname:ukcodeObj.enname, chabbr:ukcodeObj.chabbr, currencyid:ukcodeObj.currencyid,
            jycode:ukcodeObj.jycode, windcode:ukcodeObj.windcode, listdate:ukcodeObj.listdate, delistdate:ukcodeObj.delistdate, inputcode:ukcodeObj.inputcode}};
        ukcodeManageService.editUkcode(requestData, function(res ) {
            if(res.msret.msgcode != '00') {
                cms.message.error("编辑ukcode失败."+res.msret.msg);
                return;
            }
            $scope.hideUkCodeModal();
            cms.message.success("编辑ukcode成功");
            $scope.goToPage($scope.currentPage);
            $scope.$apply();
        });
    }

    $scope.checkUKcodeDataValid=function (ukcodeObj) {
        if (!ukcodeObj.ukcode) {
            cms.message.error("ukcode不能为空");
            return false;
        }

        if (!ukcodeObj.ukext) {
            cms.message.error("ukext不能为空");
            return false;
        }

        return true;
    }

    $scope.delUkcode=function( ) {
        var requestData={body:{ukcode:$scope.operateUkCode.ukcode, ukext:$scope.operateUkCode.ukext }};
        ukcodeManageService.delUkcode(requestData, function(res ) {
            if(res.msret.msgcode != '00') {
                cms.message.error("删除ukcode失败."+res.msret.msg);
                return;
            }
            $scope.hideUkCodeModal();
            $scope.currentTrIndex=-1;
            cms.message.success("删除ukcode成功");
            $scope.goToPage($scope.currentPage);
            $scope.$apply();
        });
    }

    $scope.clickAddUkcode=function() {
        $scope.operateUkCode={marketid:"0"};
        if($scope.uktypes.length) {
            $scope.operateUkCode.uktype=$scope.uktypes[0];
        }
        if ($scope.allCurrency.length) {
            $scope.operateUkCode.currencyid=$scope.allCurrency[0].currencyid;
        }
        $scope.modalInfo.state = "addUkcode";
        $scope.modalInfo.path = "../system-manage/ukcodeManage/ukcodeDetailDialog.html";
    }

    $scope.clickEditUkcode=function(ukcode) {
        $scope.operateUkCode=cms.deepCopy(ukcode,{});
        $scope.operateUkCode.uktype=ukcode.uktype;

        $scope.modalInfo.state = "editUkcode";
        $scope.modalInfo.path = "../system-manage/ukcodeManage/ukcodeDetailDialog.html";

    }

    $scope.clickDelUkcode=function(ukcode) {
        $scope.operateUkCode=ukcode;
        $scope.modalInfo.state = "delUkcode";
        $scope.modalInfo.path = "../system-manage/ukcodeManage/delUkCodeDialog.html";
    }

    $scope.hideUkCodeModal=function() {
        $scope.modalInfo={path:"", state:""};
        mainService.hideModal("ukcodeManage_modal_back");
    }

    $scope.ukcodeManageLoadModalReady=function() {
        if ($scope.modalInfo.state === "addUkcode") {
            mainService.showModal("ukcodeManage_modal_back","ukcodeManage_add_modal","ukcodeManage_add_modal_title");
        } else if ($scope.modalInfo.state === "editUkcode") {
            mainService.showModal("ukcodeManage_modal_back","ukcodeManage_add_modal","ukcodeManage_add_modal_title");
        } else if ($scope.modalInfo.state === "delUkcode") {
            mainService.showModal("ukcodeManage_modal_back","ukcodeManage_del_modal","ukcodeManage_del_modal_title");
        }
    }

    // $scope.pageToolsKeyUp=function(keyevent) {
    //     if (keyevent.keyCode === 13) { //回车
    //         if (isNaN( parseInt($scope.currentPage) )) {
    //             // $scope.currentPage=$scope.lastVersionPage;
    //             $scope.currentPage=1;
    //             return ;
    //         }
    //         $scope.goToPage($scope.currentPage);

    //     } else if (keyevent.keyCode === 27) {  //escape
    //         // $scope.currentPage=$scope.lastVersionPage;
    //         $scope.currentPage=1;
    //     }
    // }

    $scope.seachUkcode=function(keyevent) {
        if (keyevent.keyCode === 13) { //回车
            $scope.goToPage(1);

        } else if (keyevent.keyCode === 27) {  //escape
            $scope.filterOption.searchFeild="";
        }
    }

    $scope.goToPage=function (page) {
        page=page > $scope.allPage ? $scope.allPage : page;
        page=page < 1 ? 1 : page;
        // $scope.lastVersionPage=$scope.currentPage;
        $scope.currentPage=page;

        $scope.filterOption.pageNum=$scope.currentPage;
        $scope.filterOption.pageSize=$scope.pageSize;
        $scope.getUkcode($scope.filterOption);

    }

    $scope.changeMarket =function () {
        // $scope.filterOption.marketid=$scope.currentMarket.marketid;
        $scope.goToPage($scope.currentPage);
    }

    $scope.changeUKtype =function () {
        $scope.filterOption.majortype=$scope.currentUktype.majortype;
        $scope.filterOption.minortype=$scope.currentUktype.minortype;
        $scope.goToPage($scope.currentPage);
    }

});
