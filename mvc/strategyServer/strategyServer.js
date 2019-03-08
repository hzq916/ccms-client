angular.module('cmsController').controller('strategyServerCtrl',
function($scope,strategyServerService,mainService) {
    $scope.scope = $scope;
    $scope.allStrategyServer=[];
    $scope.allStrategyServerTemplate=[];

    $scope.selectedStrategyConfig={};

    $scope.allAssetManager=[];
    $scope.products=[];
    $scope.showSubguide=true;

    $scope.currentUnit={};

    $scope.currentManager={};
    $scope.currentProduct={};

    $scope.operateStrategy={};

    $scope.operateManagerTraders = []; //保存当前资产管理人下的交易员

    $scope.modalInfo={path:"", state:""};
    $scope.filterOption={searchFeild:""};

    $scope.guideTree = [];

    // $scope.userInfo = mainService.currentOperator;

    $scope.filterStrategyServer = function(strategyServer) {
        return strategyServer.stname.indexOf($scope.filterOption.searchFeild) !== -1 ||
            strategyServer.stgid.indexOf($scope.filterOption.searchFeild) !== -1 ;
    }

    //页面加载完毕
    $scope.$watch('$viewContentLoaded', function(){
        $scope.getAllTaMgr();
    });

    $scope.getAllTaMgr=function(){
        //首先清空已有数据
        $scope.allAssetManager=[];

        var requestData = {body:{}};
        strategyServerService.getAllTaMgr(requestData,function(res){
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
            // if ($scope.allAssetManager.length) {
            //     $scope.currentManager=$scope.allAssetManager[0];
            //     $scope.getStrategyServer({maid:$scope.currentManager.maid});
            // }
            $scope.getProducts();
            $scope.$apply();
        });
    }

    $scope.getProducts=function(){
        var requestData = {body:{}};
        strategyServerService.getProducts(requestData,function(res){
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
                var maIndex=cms.binarySearch($scope.allAssetManager,"maid",($scope.products[i].maid));
                if (maIndex != -1) {
                    $scope.allAssetManager[maIndex].children.push($scope.products[i]);
                }
            }
            $scope.getCombStrategy();
            // $scope.getAssetAccounts();

            $scope.$apply();
        });


    }

    $scope.clickGuideMenu = function(menu) {
        $scope.currentUnit = menu;
        $scope.getStrategyServer({maid:$scope.currentUnit.maid, caid:$scope.currentUnit.caid, trid:$scope.currentUnit.trid});

    }

    $scope.getStrategyServer=function(option) {

        strategyServerService.getStrategyServer({body:option},function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取策略失败."+res.msret.msg);
                return;
            }
            $scope.allStrategyServer=res.body;
            $scope.$apply();
        });
    }


    $scope.getStrategyTemplate=function() {

        strategyServerService.getStrategyTemplate({body:{}},function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取策略模板失败."+res.msret.msg);
                return;
            }
            $scope.allStrategyServerTemplate=res.body;
            $scope.$apply();
        });
    }

    $scope.getCombStrategy=function(){
        var requestData = {body:{}};
        strategyServerService.getCombStrategy(requestData,function(res){
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

                var maIndex=cms.binarySearch($scope.allAssetManager,"maid",(tradeUnits[i].maid));
                if (maIndex != -1) {
                    var caIndex=cms.binarySearch($scope.allAssetManager[maIndex].children,"caid",(tradeUnits[i].caid));
                    if (caIndex != -1) {
                        $scope.allAssetManager[maIndex].children[caIndex].children.push(tradeUnits[i]);
                    }
                }
            }
            $scope.guideTree=$scope.allAssetManager;
            $scope.$apply();
        });
    }

    $scope.getTrader=function(maid) {

        strategyServerService.getTrader({body:{maid:maid}},function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取指定的交易员失败."+res.msret.msg);
                return;
            }
            $scope.allTrader=res.body;
            $scope.$apply();
        });
    }

    $scope.changeStrategeManager=function() {
        $scope.getStrategyServer({maid:$scope.currentUnit.maid, caid:$scope.currentUnit.caid, trid:$scope.currentUnit.trid});

    }

    $scope.changeConfigTemplate=function() {
        $scope.operateStrategy.parms = $scope.operateStrategy.configTemplate.parms;
        $scope.operateStrategy.ui_parms = $scope.operateStrategy.configTemplate.ui_parms;
    }

    $scope.changeTemplate=function() {
        $scope.operateStrategy.configTemplate = {};
    }



    $scope.clickTr=function(strategyConfig) {
        $scope.selectedStrategyConfig.selected=false;
        strategyConfig.selected=true;
        $scope.selectedStrategyConfig=strategyConfig;
    }

    //点击表头
    $scope.clickTableHeader = function(keyName,isNumber) {
        $scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
        $scope.keyName = keyName;
        $scope.sortFunction = mainService.getSortFunc($scope.reverse,isNumber);
    }

    $scope.clickAddStrategyServer=function() {
        $scope.modalInfo.path = "../strategyServer/strategyDetail.html";
        $scope.modalInfo.state = "addStrategyServer";
        $scope.operateStrategy = {maid:$scope.currentUnit.maid, trid:$scope.currentUnit.trid,  stname:"", stat:"1"};

        strategyServerService.getTrader({body:{maid:$scope.currentUnit.maid}},function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取指定的交易员失败."+res.msret.msg);
                return;
            }
            $scope.allTrader=res.body;
            if ($scope.allTrader.length) {
                $scope.operateStrategy.traderid = $scope.allTrader[0].traderid;
            }
            $scope.$apply();
        });
    }

    $scope.clickEditStrategyServer=function(strategyServer) {
        $scope.modalInfo.path="../strategyServer/strategyDetail.html";
        $scope.modalInfo.state = "editStrategyServer";
        cms.deepCopy(strategyServer, $scope.operateStrategy);
        $scope.getTrader($scope.currentManager.maid);
    }

    $scope.clickDelStrategyServer=function(strategyServer) {
        $scope.modalInfo.path="../strategyServer/strategyServerDeleteDialog.html";
        $scope.modalInfo.state = "delStrategyServer";
        $scope.operateStrategy = strategyServer;
    }

    $scope.clickStrategySPermission=function(strategyServer) {
        $scope.operateStrategy = strategyServer;

        strategyServerService.getOperator({body:{maid:strategyServer.maid, roleid: 6, stat:1 }},function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取交易员失败."+res.msret.msg);
                return;
            }
            $scope.operateManagerTraders = res.body;
            strategyServerService.getStrategyPermission({body:{stgid:$scope.operateStrategy.stgid}},function(res) {
                if(res.msret.msgcode != '00') {
                    cms.message.error("获取指定的交易员失败."+res.msret.msg);
                    return;
                }
                var strategyPermissions = res.body.traderidArray;
                for (var i = 0; i < $scope.operateManagerTraders.length; i++) {
                    $scope.operateManagerTraders[i].checked = false;
                    for (var j = 0; j < strategyPermissions.length; j++) {
                        if ($scope.operateManagerTraders[i].oid == strategyPermissions[j]) {
                            $scope.operateManagerTraders[i].checked = true;
                        } else if ($scope.operateManagerTraders[i].oid > strategyPermissions[j]) {
                            continue;
                        } else {
                            break;
                        }
                    }
                }

                $scope.modalInfo.path="../strategyServer/strategyPermission.html";
                $scope.modalInfo.state = "editStrategyPermission";
            });
        });

    }

    $scope.clickAddStrategyServerConfig=function(strategyServer) {
        $scope.modalInfo.path="../strategyServer/strategyServerDetail.html";
        $scope.modalInfo.state = "addStrategyServerConfig";
        cms.deepCopy(strategyServer, $scope.operateStrategy);

        strategyServerService.getStrategyServerConfig({body:{stgid:strategyServer.stgid}}, function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取策略配置失败."+res.msret.msg);
                return;
            }
            var strategyConfig=res.body;
            if (strategyConfig.length == 1) {
                $scope.operateStrategy.parms=strategyConfig[0].parms;
                $scope.operateStrategy.parms=strategyConfig[0].ui_parms;
            } else {
                $scope.operateStrategy.parms = "";
                $scope.operateStrategy.parms = "";
            }

            $scope.$apply();
        });
    }

    $scope.addStrategyServerConfig=function() {
        var requestData = {body:{maid:$scope.operateStrategy.maid, traderid:$scope.operateStrategy.traderid,
            stname:$scope.operateStrategy.stname, stat:$scope.operateStrategy.stat }};
        strategyServerService.addStrategyServerConfig(requestData, function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("增加策略失败."+res.msret.msg);
                return;
            }
            $scope.getStrategyServer({maid:$scope.currentUnit.maid, caid:$scope.currentUnit.caid, trid:$scope.currentUnit.trid});
            $scope.$apply();
        });
    }

    $scope.addStrategyServer=function() {
        if(!$scope.checkStrategyServerAddData($scope.operateStrategy)) {
            return;
        }

        var requestData = {body:{maid:$scope.operateStrategy.maid, traderid:$scope.operateStrategy.traderid, trid:$scope.operateStrategy.trid,
            stname:$scope.operateStrategy.stname, stat:$scope.operateStrategy.stat }};

        strategyServerService.addStrategyServer(requestData, function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("增加策略失败."+res.msret.msg);
                return;
            }
            $scope.getStrategyServer({maid:$scope.currentUnit.maid, caid:$scope.currentUnit.caid, trid:$scope.currentUnit.trid});
            $scope.hideStrategyServerModal();
            $scope.$apply();
        });
    }

    $scope.checkStrategyServerAddData=function(strategyServer) {
        // if (isNaN(strategyServer.stgid)) {
        //     cms.message.error("策略的ID不正确");
        //     return false;
        // }

        if (isNaN(strategyServer.traderid)) {
            cms.message.error("策略的交易员ID不正确");
            return false;
        }

        if (!strategyServer.stname) {
            cms.message.error("策略的名字不能为空");
            return false;
        }

        if (isNaN(strategyServer.stat)) {
            cms.message.error("策略的状态不正确");
            return false;
        }
        return true;
    }

    $scope.checkStrategyServerEditData=function(strategyServer) {

        if (!strategyServer.stname) {
            cms.message.error("策略的名字不能为空");
            return false;
        }

        if (isNaN(strategyServer.stat)) {
            cms.message.error("策略的状态不正确");
            return false;
        }
        return true;
    }

    $scope.editStrategyServer=function() {
        if(!$scope.checkStrategyServerEditData($scope.operateStrategy)) {
            return;
        }

        var requestData = {body:{stgid:$scope.operateStrategy.stgid, stname:$scope.operateStrategy.stname, stat:$scope.operateStrategy.stat }};
        strategyServerService.editStrategyServer(requestData,function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("编辑策略失败."+res.msret.msg);
                return;
            }
            $scope.getStrategyServer({maid:$scope.currentUnit.maid, caid:$scope.currentUnit.caid, trid:$scope.currentUnit.trid});
            $scope.hideStrategyServerModal();
            $scope.$apply();
        });
    }

    $scope.deleteStrategyServer=function() {
        strategyServerService.deleteStrategyServer({body:{stgid:$scope.operateStrategy.stgid}},function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取指定的交易员失败."+res.msret.msg);
                return;
            }
            $scope.hideStrategyServerModal();
            $scope.getStrategyServer({maid:$scope.currentUnit.maid, caid:$scope.currentUnit.caid, trid:$scope.currentUnit.trid});
            $scope.$apply();
        });
    }

    $scope.hideStrategyServerModal=function() {
        $scope.modalInfo.path="";
        $scope.modalInfo.state = "";
        mainService.hideModal("strategyServer_modal_back");
    }

    $scope.strategyServerLoadModalReady=function() {
        switch ($scope.modalInfo.state) {
            case "addStrategyServerConfig":

                mainService.showModal("strategyServer_modal_back","strategyServer_config_modal","strategyServer_config_modal_title");
                break;
            case "addStrategyServer":

                mainService.showModal("strategyServer_modal_back","strategyServer_detail_modal","strategyServer_detail_modal_title");
                break;
            case "editStrategyServer":
                mainService.showModal("strategyServer_modal_back","strategyServer_detail_modal","strategyServer_detail_modal_title");
                break;
            case "delStrategyServer":
                mainService.showModal("strategyServer_modal_back","strategyServer_del_modal","strategyServer_del_modal_title");
                break;
            case "editStrategyPermission":
                mainService.showModal("strategyServer_modal_back","strategyServer_permission_modal","strategyServer_permission_modal_title");

                break;
            default:

        }
    }

    $scope.refreshStrategyServer=function() {
        $scope.getStrategyServer({maid:$scope.currentUnit.maid, caid:$scope.currentUnit.caid, trid:$scope.currentUnit.trid});

    }

    $scope.relateStrategyServer=function() {
        strategyServerService.deleteStrategyServer({body:{stgid:$scope.operateStrategy.stgid}},function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取指定的交易员失败."+res.msret.msg);
                return;
            }
            $scope.hideStrategyServerModal();
            $scope.getStrategyServer({maid:$scope.currentUnit.maid, caid:$scope.currentUnit.caid, trid:$scope.currentUnit.trid});
            $scope.$apply();
        });
    }

    $scope.clickRelateStrategyServer=function(strategyServer) {
        $scope.modalInfo.path="../strategyServer/strategyServerDeleteDialog.html";
        $scope.modalInfo.state = "delStrategyServer";
        $scope.operateStrategy = strategyServer;
    }

    $scope.clickPermCheckBox=function(trader) {
        trader.checked = !trader.checked;
    }

    $scope.confirmStrategyPermission = function() {
        var traderidArray = [];
        for (var i = 0; i < $scope.operateManagerTraders.length; i++) {
            if ($scope.operateManagerTraders[i].checked) {
                traderidArray.push($scope.operateManagerTraders[i].oid);
            }
        }
        strategyServerService.editStrategyPermission({body:{stgid:$scope.operateStrategy.stgid, traderidArray:traderidArray}},function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("编辑策略权限失败."+res.msret.msg);
                return;
            }
            $scope.hideStrategyServerModal();
        });
    }


});
