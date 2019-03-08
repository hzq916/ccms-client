angular.module('cmsController').controller('tradeAccountManageCtrl',
function($scope,$rootScope,$timeout,tradeAccountService,mainService) {
    $scope.operateModelPath="";
    $scope.operateModelState="";

    $scope.operateTradeAccount={}; // 当前交易账户
    $scope.currentTradeAccount={};

    $scope.operateTractFutureFeeRate={}; // 当前交易账户期货费率
    $scope.accountTypeMap = {};
    $scope.accountTypeArray = [];

    $scope.allTradeAccount=[]; // 保存所有的交易账户
    $scope.allCurrency=[];
    $scope.allMarket=[];
    $scope.ogsServices=[];

    $scope.brokers=[];  // 保存券商的信息
    $scope.currentAssetAccount={};
    $scope.excelData=[];

    $scope.allStockFeeRateTemplate=[]; //保存所有的股票费率模板
    $scope.allStockFeeRate=[]; // 保存指定交易账户所有的股票费率
    $scope.allCommand=[];
    $scope.allAssetManager=[]; // 保存账户体系的数组

    $scope.dialogModalInfo={path:"", state:""}; // 第二次弹框的地址
    $scope.showSubguide=true;

    $scope.stockFeeRateInfo={state:"showFee", currentMarketID:"-1", showStockFeeIndex:-1, editStockFeeIndex:-1}; //addFee, editFee
    $scope.tradeAccountMarkets=[]; //保存交易账户的交易市场
    $scope.editTradeMarket=false; // 是否编辑交易市场

    $scope.guideTree = [];

    $scope.assetAccounts=[];
    var noProductSize=0;

    //期货费率相关
	$scope.currentMargin = {};
	$scope.currentOrderFee = {};
	$scope.currentFuturesFeerate = {};
	$scope.currentDelayFeerate = {};

    $scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;

    //点击表头
	$scope.clickTableHeader = function(keyName,isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse,isNumber);
	}

	$scope.$on("changedManager_broadcast", function(event, message) {
        $scope.getAllTaMgr();
        if ($scope.currentAssetAccount.acid) {
            mainService.currentAcid=$scope.currentAssetAccount.acid;
        }
	});

	$scope.$on("changedProduct_broadcast", function(event, message) {
        $scope.getAllTaMgr();
        if ($scope.currentAssetAccount.acid) {
            mainService.currentAcid=$scope.currentAssetAccount.acid;
        }

	});

    $scope.$on("changedAssetAccount_broadcast", function(event, message) {
        $scope.getAllTaMgr();
        if ($scope.currentAssetAccount.acid) {
            mainService.currentAcid=$scope.currentAssetAccount.acid;
        }
    });

    $scope.$on("redirectTradeAccount_broadcast", function(event, message) {
        if (mainService.currentAcid ) {
            var acidIndex= cms.binarySearch($scope.assetAccounts, "acid" ,parseInt(mainService.currentAcid),noProductSize);
            if (acidIndex != -1) {
                $scope.clickAssetAccount($scope.assetAccounts[acidIndex]);
                $scope.setGuideMenu($scope.assetAccounts[acidIndex].maid+"/"+$scope.assetAccounts[acidIndex].caid+"/"+$scope.assetAccounts[acidIndex].acid);
            }
            mainService.currentAcid="";
        }

    });

    // $scope.$on("changedChannel_broadcast", function(event, message) {
    //     var requestData = {body:{}};
    //     tradeAccountService.getTschannel(requestData,function(res){
    //         if(res.msret.msgcode != '00') {
    //             cms.message.error("获取通道信息失败."+res.msret.msg);
    //             return;
    //         }
    //         $scope.ogsServices=res.body;
    //         $scope.ogsServices.forEach(function(channel) {
    //             channel.chid=parseInt(channel.chid);
    //         });
    //
    //         $scope.$apply();
    //     });
    // });

    //页面加载完毕
    $scope.$watch('$viewContentLoaded', function(){

        // $scope.getTradeAccount($scope.currentAssetAccount.acid);
        var requestData = {body:{}};
        tradeAccountService.getCurrency(requestData,function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("获取币种失败."+res.msret.msg);
                return;
            }
            $scope.allCurrency=res.body;
            $scope.allCurrency.forEach(function(currency) {
                currency.currencyid=parseInt(currency.currencyid);
            });

            $scope.$apply();
        });

        tradeAccountService.getMarket(requestData,function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("获取市场信息失败.",res.msret.msg);
                return;
            }
            $scope.allMarket=res.body;
            $scope.allMarket.forEach(function(market) {
                market.marketid=parseInt(market.marketid);
            });
            // $scope.allMarket.splice(0,0,{marketid:-1,marketchname:"所有市场"})

            $scope.stockFeeRateInfo.currentMarketID="-1";

            $scope.$apply();
        });

        $scope.getAllTaMgr();
        // $scope.getTsBroker();
        $scope.getCommand();
        $scope.getStockFeeRateTemplate();
        $scope.getAccountType();

    });
    $scope.refresh=function() {
        if ($scope.currentAssetAccount.acid) {
            $scope.getTradeAccount($scope.currentAssetAccount.acid);
        }
    }

    $scope.getAllTaMgr=function(){
        //首先清空已有数据
        $scope.allAssetManager=[];

        var requestData = {body:{}};
        tradeAccountService.getAllTaMgr(requestData,function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("获取所有资产管理人失败."+res.msret.msg);
                return;
            }
            $scope.allAssetManager=res.body;
            $scope.allAssetManager.forEach(function(obj){
                obj.maid=parseInt(obj.maid);

                obj.products=[];
                obj.showChildren=true;
            });
            $scope.getProducts();
            $scope.$apply();
        });
    }

    $scope.getProducts=function(){
        var requestData = {body:{}};
        tradeAccountService.getProducts(requestData,function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("获取所有产品失败."+res.msret.msg);
                return;
            }
            var products=res.body;
            var i = 0,j=0;
            for (; i < products.length; i++) {
                products[i].showChildren=true;
                products[i].maid=parseInt(products[i].maid);
                products[i].caid=parseInt(products[i].caid);

                var maIndex=cms.accurateSearch($scope.allAssetManager,"maid",(products[i].maid));
                if (maIndex != -1) {
                    $scope.allAssetManager[maIndex].products.push(products[i]);
                    products[i].assetAccounts=[];
                    products[i].tradeUnits=[];
                } else {
                    var newManager = {maid: products[i].maid, products: [], showChildren: true};
                    newManager.products.push(products[i]);
                    products[i].assetAccounts=[];
                    products[i].tradeUnits=[];
                    $scope.allAssetManager.push(newManager);
                }
            }
            // $scope.getTatrd();
            $scope.getAssetAccounts();

            $scope.$apply();
        });
    }


    $scope.getAssetAccounts=function(){
        var requestData = {body:{}};
        tradeAccountService.getAssetAccounts(requestData,function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("获取所有资产账户失败."+res.msret.msg);
                return;
            }
            var assetAccounts=res.body;
            $scope.assetAccounts=res.body;
            var i = 0,j=0;
            noProductSize=0;
            console.log(assetAccounts);
            for (; i < assetAccounts.length; i++) {
                assetAccounts[i].maid=parseInt(assetAccounts[i].maid);
                assetAccounts[i].caid=parseInt(assetAccounts[i].caid);
                assetAccounts[i].acid=parseInt(assetAccounts[i].acid);
                
                assetAccounts[i].actypeStr = $scope.accountTypeMap[assetAccounts[i].actype];

                if (assetAccounts[i].caid == -1) {
                    ++noProductSize;
                    continue; //不显示没有绑定产品的资产账户
                }

                var maIndex=cms.accurateSearch($scope.allAssetManager,"maid",(assetAccounts[i].maid));
                if (maIndex != -1) {
                    var caIndex=cms.accurateSearch($scope.allAssetManager[maIndex].products,"caid",(assetAccounts[i].caid));
                    if (caIndex != -1) {
                        $scope.allAssetManager[maIndex].products[caIndex].assetAccounts.push(assetAccounts[i]);
                    } else {
                        var newProduct = {maid: assetAccounts[i].maid, caid: assetAccounts[i].caid, showChildren: true, assetAccounts: [], tradeUnits: []};
                        newProduct.assetAccounts.push(assetAccounts[i]);
                        $scope.allAssetManager[maIndex].products.push(newProduct);
                    }
                } else {
                    var newManager = {maid: assetAccounts[i].maid, products: [], showChildren: true};
                    var newProduct = {maid: assetAccounts[i].maid, caid: assetAccounts[i].caid, showChildren: true, assetAccounts: [], tradeUnits: []};
                    newProduct.assetAccounts.push(assetAccounts[i]);
                    newManager.products.push(newProduct);
                    $scope.allAssetManager.push(newManager);
                }
            }

            $scope.guideTree.splice(0,$scope.guideTree.length);
            $scope.makeNewTree($scope.allAssetManager,$scope.guideTree);

            $scope.$apply();

            if (mainService.currentAcid ) {
                var acidIndex= cms.binarySearch(assetAccounts, "acid" ,parseInt(mainService.currentAcid),noProductSize);
                if (acidIndex != -1) {
                    $scope.clickAssetAccount(assetAccounts[acidIndex]);
                    // setTimeout(function() {
                        $scope.setGuideMenu($scope.assetAccounts[acidIndex].maid+"/"+$scope.assetAccounts[acidIndex].caid+"/"+$scope.assetAccounts[acidIndex].acid);
                    //     $scope.$apply();
                    // });
                }
                mainService.currentAcid="";
            }
        });
    }

    $scope.makeNewTree = function(srcArray,destArray) {
        for(var i = 0; i < srcArray.length; i ++) {
            var temp = srcArray[i];
            temp.menuId = temp.maid;
            temp.menuName = temp.maname;
            temp.type = 'maid';
            temp.children = [];
            if(typeof temp.products != "undefined") {
                for(var j = 0; j < temp.products.length; j++) {
                    var temp1 = temp.products[j];
                    temp1.menuId = temp1.caid;
                    temp1.menuName = temp1.caname;
                    temp1.type = 'caid';
                    temp1.children = [];
                    if(typeof temp1.assetAccounts != "undefined") {
                        for(var k = 0; k < temp1.assetAccounts.length; k ++) {
                            var temp2 = temp1.assetAccounts[k];
                            temp2.menuId = temp2.acid;
                            temp2.menuName = temp2.acname;
                            temp2.type = 'acid';
                            temp1.children.push(temp2);
                        }
                    }
                    temp.children.push(temp1);
                }
            }
            destArray.push(temp);
        }
    }


    $scope.getTradeAccountStockFeeRate=function (options) {
        var requestData = {body:options};
        tradeAccountService.getTradeAccountStockFeeRate(requestData, function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取交易账户的股票费率失败.",res.msret.msg);
                return;
            }
            $scope.allStockFeeRate=res.body;
            $scope.resetCommandAndStockFeeRate();
            $scope.$apply();
        });
    }

    $scope.resetCommandAndStockFeeRate=function() {

        $scope.allCommand.forEach(function(obj){
            obj.template={};
            obj.cmdid=parseInt(obj.cmdid);
            obj.checked=false;
            obj.error=false;
            obj.hadStockFee=false;
            obj.changed=false;
            obj.celltype=6;
            obj.cellid=$scope.operateTradeAccount.tracid;
            obj.valid = false ;
            if ( obj.acttype == $scope.currentAssetAccount.actype &&
                (obj.marketid == 0 ||cms.binarySearch($scope.tradeAccountMarkets, "marketid", obj.marketid) != -1 )) {
                obj.valid = true ;
            }

            obj.taxrate="10";
            obj.commissionrate="3";
            obj.min_commissionfee="0";
            obj.max_commissionfee="999999999.00";
            obj.transrate="0.2";
            obj.min_transfee="0";
            obj.max_transfee="999999999.00";
            obj.handingrate="0";
            obj.sec_mgt_rate="0";

            obj.checked_original=false;
            obj.hadStockFee_original=false;
            obj.celltype_original=6;
            obj.cellid_original=$scope.operateTradeAccount.tracid;

            obj.taxrate_original=obj.taxrate;
            obj.commissionrate_original=obj.commissionrate;
            obj.min_commissionfee_original=obj.min_commissionfee;
            obj.max_commissionfee_original=obj.max_commissionfee;
            obj.transrate_original=obj.transrate;
            obj.min_transfee_original=obj.min_transfee;
            obj.max_transfee_original=obj.max_transfee;
            obj.handingrate_original=obj.handingrate;
            obj.sec_mgt_rate_original=obj.sec_mgt_rate;
        });

        $scope.allStockFeeRate.forEach(function(obj){
            obj.cmdidStr=obj.cmdid;
            obj.cmdid=parseInt(obj.cmdid);

            var commandIndex=cms.binarySearch($scope.allCommand, "cmdid", obj.cmdid);
            if(commandIndex != -1){
                obj.cmdname=$scope.allCommand[commandIndex].cmdname;
                obj.marketid=$scope.allCommand[commandIndex].marketid;

                $scope.allCommand[commandIndex].checked=true;
                $scope.allCommand[commandIndex].checked_original=true;


                $scope.allCommand[commandIndex].hadStockFee=true;
                $scope.allCommand[commandIndex].celltype=obj.celltype;
                $scope.allCommand[commandIndex].cellid=obj.cellid;

                $scope.allCommand[commandIndex].taxrate=obj.taxrate;
                $scope.allCommand[commandIndex].commissionrate=obj.commissionrate;
                $scope.allCommand[commandIndex].min_commissionfee=obj.min_commissionfee;
                $scope.allCommand[commandIndex].max_commissionfee=obj.max_commissionfee;
                $scope.allCommand[commandIndex].transrate=obj.transrate;
                $scope.allCommand[commandIndex].min_transfee=obj.min_transfee;
                $scope.allCommand[commandIndex].max_transfee=obj.max_transfee;
                $scope.allCommand[commandIndex].handingrate=obj.handingrate;
                $scope.allCommand[commandIndex].sec_mgt_rate=obj.sec_mgt_rate;


                $scope.allCommand[commandIndex].hadStockFee_original=true;
                $scope.allCommand[commandIndex].celltype_original=obj.celltype;
                $scope.allCommand[commandIndex].cellid_original=obj.cellid;

                $scope.allCommand[commandIndex].taxrate_original=obj.taxrate;
                $scope.allCommand[commandIndex].commissionrate_original=obj.commissionrate;
                $scope.allCommand[commandIndex].min_commissionfee_original=obj.min_commissionfee;
                $scope.allCommand[commandIndex].max_commissionfee_original=obj.max_commissionfee;
                $scope.allCommand[commandIndex].transrate_original=obj.transrate;
                $scope.allCommand[commandIndex].min_transfee_original=obj.min_transfee;
                $scope.allCommand[commandIndex].max_transfee_original=obj.max_transfee;
                $scope.allCommand[commandIndex].handingrate_original=obj.handingrate;
                $scope.allCommand[commandIndex].sec_mgt_rate_original=obj.sec_mgt_rate;

            }
        });

    }

    $scope.getStockFeeRateTemplate=function () {
        var requestData = {body:{}};
        tradeAccountService.getStockFeeRateTemplate(requestData, function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取股票费率模板失败."+res.msret.msg);
                return;
            }
            $scope.allStockFeeRateTemplate=res.body;
            $scope.$apply();
        });
    }

    $scope.getAccountType = function () {
        $scope.accountTypeArray = [];
        var requestData = { body: {} };
        tradeAccountService.getAccountType(requestData, function (res) {
            if (res.msret.msgcode != '00') {
                cms.message.error("获取所有账户类型." + res.msret.msg);
                return;
            }
            $scope.accountTypeArray = res.body;
            console.log($scope.accountTypeArray);
            for (let i=0; i < $scope.accountTypeArray.length; i++) {
                $scope.accountTypeMap[$scope.accountTypeArray[i].dictid] = $scope.accountTypeArray[i].dictname;
            }
            $scope.$apply();
        });
    }

    $scope.getCommand=function () {
        var requestData = {body:{ }};
        tradeAccountService.getCommand(requestData, function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取所有指令失败.",res.msret.msg);
                return;
            }
            $scope.allCommand=res.body;
            $scope.allCommand.forEach(function(command) {
                command.marketid = parseInt(command.marketid);
            }) ;

        });
    }

    $scope.getTradeAccount=function(acid){
        var requestData = {body:{acid:acid}};
        tradeAccountService.getTradeAccount(requestData,function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("获取产品的交易账户失败."+res.msret.msg);
                return;
            }
            $scope.allTradeAccount=res.body;
            console.log("________________-");
            console.log($scope.allTradeAccount);
            $scope.allTradeAccount.forEach(function(tradeAccount) {
                tradeAccount.tracid=parseInt(tradeAccount.tracid);
                tradeAccount.marketid=parseInt(tradeAccount.marketid);
                tradeAccount.currencyid=parseInt(tradeAccount.currencyid);
                tradeAccount.chid=parseInt(tradeAccount.chid);
                tradeAccount.actype=$scope.currentAssetAccount.actype;
                tradeAccount.actypeStr=$scope.currentAssetAccount.actypeStr;

                switch (tradeAccount.hedgeflag) {
                    case "1":
                        tradeAccount.hedgeflagStr="投机";
                        break;
                    case "2":
                        tradeAccount.hedgeflagStr="套利";
                        break;
                    case "3":
                        tradeAccount.hedgeflagStr="套保";
                        break;
                    default:
                        tradeAccount.hedgeflagStr="--";
                }

                switch (tradeAccount.stat) {
                    case "0":
                        tradeAccount.stateStr="不可用";
                        break;
                    case "1":
                        tradeAccount.stateStr="可用";
                        break;
                    default:
                        tradeAccount.stateStr="不可用";
                }

                var marketIndex=cms.binarySearch($scope.allMarket,"marketid",tradeAccount.marketid);
                if (marketIndex != -1) {
                    tradeAccount.marketchname=$scope.allMarket[marketIndex].marketchname;
                }

                var currencyIndex=cms.binarySearch($scope.allCurrency,"currencyid",tradeAccount.currencyid);
                if (currencyIndex != -1) {
                    tradeAccount.curencychname=$scope.allCurrency[currencyIndex].curencychname;
                    tradeAccount.briefcode=$scope.allCurrency[currencyIndex].briefcode;
                }

                var channelIndex=cms.binarySearch($scope.ogsServices,"chid",tradeAccount.chid);
                if (channelIndex != -1) {
                    tradeAccount.chname=$scope.ogsServices[channelIndex].chname;
                }

            });


            $scope.$apply();
        });
    }


    $scope.getTsBroker=function(){
        var requestData = {body:{}};
        tradeAccountService.getTsBroker(requestData,function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("获取所有经纪商失败."+res.msret.msg);
                return;
            }
            $scope.brokers=res.body;
            $scope.$apply();

        });

    }


    $scope.getTradeAccountFutureFeeRate=function(acid){
        var requestData = {body:{acid:acid}};
        tradeAccountService.getTradeAccountFutureFeeRate(requestData,function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("获取交易账户的期货费率失败.",res.msret.msg);
                return;
            }
            if (res.body.length === 0) {
                cms.message.success("获取交易账户的期货费率成功,但数量为0.");
                return ;
            }

            for (var i = 0; i < res.body.length; i++) {
                var assetAccountIndex=cms.binarySearch($scope.allTradeAccount,"tracid",res.body[i].tracid);
                if (assetAccountIndex !== -1) {
                    $scope.allTradeAccount[assetAccountIndex].futuresFeeRates.push(res.body[i]);
                } else {
                    cms.message.error("期货费率未找到交易账户,请留意!");
                    // return ;
                }
            }
            $scope.$apply();
        });
    }

    $scope.getAllTradeAccountFutureFeeRate=function(tracid){
        $scope.allTradeAccountFutureFeeRate =[];

        var requestData = {body:{tracid:tracid}};
        tradeAccountService.getTradeAccountFutureFeeRate(requestData,function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("获取交易账户的期货费率失败."+res.msret.msg);
                return;
            }
            // if (res.body.length === 0) {
            //     cms.message.success("获取交易账户的期货费率成功,但数量为0.");
            //     return ;
            // }

            $scope.allTradeAccountFutureFeeRate = res.body;
            $scope.$apply();
        });
    }

    $scope.clickAssetAccount=function(assetAccount) {

        $scope.currentAssetAccount=assetAccount;

        $scope.getTradeAccount(assetAccount.acid);
    }

    $scope.clickTradeAccount=function(tradeAccount){

        $scope.editTradeMarket=false;

        var requestData = {body:{tracid:tradeAccount.tracid}};
        tradeAccountService.getTradeAccount(requestData,function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("获取产品的交易账户失败."+res.msret.msg);
                return;
            }
            if (res.body.length !== 1) {
                cms.message.success("获取交易账户的数量不为1");
                return ;
            }
            $scope.operateTradeAccount=res.body[0];
            // document.getElementById("tradeAccount_createtime_Input").value=$scope.operateTradeAccount.createtime;
            $scope.$apply();
        });

        var reqData = {body:{
            modules:[cms.c_moduleid_fs,cms.c_moduleid_ogs],
            acid: tradeAccount.acid
        }}
        mainService.getOpsService(reqData, function(res) {
            $scope.ogsServices = [];
            if(res.msret.msgcode != '00') {
                cms.message.error("获取通道信息失败."+res.msret.msg);
                return;
            }
            $scope.ogsServices=res.body;
            $scope.$apply();
        })

        $scope.getTradeAccountMarket(tradeAccount.tracid);

        $scope.dialogModalInfo.state="editTradeAccount";
        $scope.dialogModalInfo.path="../tradeAccountManage/tradeAccountDetail.html";
    }

    $scope.clickTradeAccountTr =function(tradeAccount) {

        $scope.currentTradeAccount=tradeAccount;
    }

    $scope.clickTradeAccountFutureFee=function(tradeAccount){

        $scope.operateTradeAccount=tradeAccount;
        $scope.getAllTradeAccountFutureFeeRate(tradeAccount.tracid);
        $scope.operateModelState="editTradeAccountFutureFee";
        $scope.operateModelPath="../tradeAccountManage/tradeAccountFutureFeeRate.html";
    }

    $scope.clickTradeAccountStockFee=function(tradeAccount){

        $scope.stockFeeRateInfo.currentMarketID="-1";

        $scope.operateTradeAccount=tradeAccount;

        $scope.stockFeeRateInfo.state="showFee";

        var requestData={body:{tracid: tradeAccount.tracid}};
        $scope.tradeAccountMarkets=[];
        tradeAccountService.getTradeAccountMarket(requestData,function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("获取交易账户的交易市场失败."+res.msret.msg);
                return;
            }
            $scope.tradeAccountMarkets=res.body;
            $scope.tradeAccountMarkets.forEach(function(market) {
                market.marketid = parseInt(market.marketid);
            }) ;

            var i = 0,j = 0;
            for (; i < $scope.allMarket.length; i++) {
                $scope.allMarket[i].checked=false;

                for (; j < $scope.tradeAccountMarkets.length; j++) {
                    if ($scope.allMarket[i].marketid == $scope.tradeAccountMarkets[j].marketid) {
                        $scope.allMarket[i].checked=true;
                        ++j;
                        break;
                    } else if ($scope.allMarket[i].marketid > $scope.tradeAccountMarkets[j].marketid) {
                        continue;
                    } else  {
                        break;
                    }

                }

            }

            //此处获取股票费率后需要刷新条件
            $scope.getTradeAccountStockFeeRate({celltype:6, cellid:tradeAccount.tracid });
            $scope.dialogModalInfo.path="../tradeAccountManage/tractStockFeeRate.html";
            $scope.dialogModalInfo.state="stockFeeRate";
            $scope.$apply();
        });


    }

    $scope.clickAddStockFeeRate=function() {
        $scope.stockFeeRateInfo.state="addFee";
        $scope.resetCommandAndStockFeeRate();
    }

    $scope.createTradeAccount=function(){
        $scope.operateTradeAccount={maid:$scope.currentAssetAccount.maid+"",  acid:$scope.currentAssetAccount.acid, acname:$scope.currentAssetAccount.acname,  stat:"1",hedgeflag: "1" };
        if ($scope.allMarket.length) {
            $scope.operateTradeAccount.marketid=$scope.allMarket[0].marketid+"";
        }
        if ($scope.allCurrency.length) {
            $scope.operateTradeAccount.currencyid=$scope.allCurrency[0].currencyid+"";
        }
        $scope.allMarket.forEach(function(obj){
            obj.checked=false;
        });
        var reqData = {body:{
            modules:[cms.c_moduleid_fs,cms.c_moduleid_ogs],
            acid: $scope.currentAssetAccount.acid
        }}
        mainService.getOpsService(reqData, function(res) {
            $scope.ogsServices = [];
            if(res.msret.msgcode != '00') {
                cms.message.error("获取通道信息失败."+res.msret.msg);
                return;
            }
            $scope.ogsServices=res.body;
            if ($scope.ogsServices.length > 0) {
                $scope.operateTradeAccount.chid = String($scope.ogsServices[0].serviceid);
            }
            $scope.dialogModalInfo.state="createTradeAccount";
            $scope.dialogModalInfo.path="../tradeAccountManage/tradeAccountDetail.html";
            $scope.$apply();
        })
    }

    $scope.getTradeAccountMarket = function(tracid) {
        var requestData={body:{tracid:tracid}};
        $scope.tradeAccountMarkets=[];
        tradeAccountService.getTradeAccountMarket(requestData,function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("获取交易账户的交易市场失败."+res.msret.msg);
                return;
            }
            $scope.tradeAccountMarkets=res.body;
            $scope.tradeAccountMarkets.forEach(function(market) {
                market.marketid = parseInt(market.marketid);
            }) ;

            var i = 0,j = 0;
            for (; i < $scope.allMarket.length; i++) {
                $scope.allMarket[i].checked=false;

                for (; j < $scope.tradeAccountMarkets.length; j++) {
                    if ($scope.allMarket[i].marketid == $scope.tradeAccountMarkets[j].marketid) {
                        $scope.allMarket[i].checked=true;
                        ++j;
                        break;
                    } else if ($scope.allMarket[i].marketid > $scope.tradeAccountMarkets[j].marketid) {
                        continue;
                    } else  {
                        break;
                    }

                }

            }
            $scope.$apply();
        });
    }

    $scope.cancelEditTradeMarket=function() {
        var i = 0,j = 0;
        for (; i < $scope.allMarket.length; i++) {
            $scope.allMarket[i].checked=false;

            for (; j < $scope.tradeAccountMarkets.length; j++) {
                if ($scope.allMarket[i].marketid == $scope.tradeAccountMarkets[j].marketid) {
                    $scope.allMarket[i].checked=true;
                    ++j;
                    break;
                } else if ($scope.allMarket[i].marketid > $scope.tradeAccountMarkets[j].marketid) {
                    continue;
                } else  {
                    break;
                }

            }

        }
        $scope.editTradeMarket=false;
    }

    $scope.addTradeAccount=function() {

        if(!$scope.checkTradeAccount($scope.operateTradeAccount)) {
            return;
        }

        var i = 0, marketList = [];
        for (; i < $scope.allMarket.length; i++) {
            if ($scope.allMarket[i].checked) {
                marketList.push($scope.allMarket[i].marketid);
            }
        }

        var requestData = {acid:$scope.operateTradeAccount.acid, marketid:$scope.operateTradeAccount.marketid,hedgeflag:$scope.operateTradeAccount.hedgeflag,
             trcode:$scope.operateTradeAccount.trcode, name:$scope.operateTradeAccount.tracname, currencyid:$scope.operateTradeAccount.currencyid,
            chid:$scope.operateTradeAccount.chid, stat:$scope.operateTradeAccount.stat, marketList:marketList.join(",") };   

        //当不是期货账户的时候,投机套保标志为0
        if ($scope.currentAssetAccount.actype != 3) {
            requestData.hedgeflag = 0;
        }

        tradeAccountService.createTradeAccountNew({ serviceid: $rootScope.serviceid["ccms-server"], body: requestData }, function (data) {
            if (data.error) {
                cms.message.error("创建交易账户失败." + data.error.msg);
                return;
            }
            cms.message.success("创建交易账户成功!");
            $scope.getTradeAccount($scope.currentAssetAccount.acid);
            $scope.hideTractModal();
            $scope.$apply();
        });
    }

    $scope.clickEditTradeMarket=function() {
        $scope.editTradeMarket=true;
    }

    $scope.editTradeAccount=function() {
        if(!$scope.checkTradeAccount($scope.operateTradeAccount)) {
            return;
        }

        var i = 0, j = 0, delMarket=[], addMarket=[];
        if ($scope.editTradeMarket) {
            for (; i < $scope.allMarket.length; i++) {
                if (j >= $scope.tradeAccountMarkets.length && $scope.allMarket[i].checked) {
                    addMarket.push({marketid:$scope.allMarket[i].marketid});
                    continue;
                }

                for (; j < $scope.tradeAccountMarkets.length; j++) {
                    if ($scope.allMarket[i].marketid == $scope.tradeAccountMarkets[j].marketid) {
                        if(!$scope.allMarket[i].checked){
                            delMarket.push({marketid:$scope.allMarket[i].marketid});
                        }

                        ++j;
                        break;
                    } else if ($scope.allMarket[i].marketid > $scope.tradeAccountMarkets[j].marketid) { //实际这种情况不存在
                        continue;
                    } else  {
                        if($scope.allMarket[i].checked){
                            addMarket.push({marketid:$scope.allMarket[i].marketid});
                        }

                        break;
                    }

                }
            }

            while (j < $scope.tradeAccountMarkets.length) {
                delMarket.push({marketid:$scope.tradeAccountMarkets[j].marketid});
                ++j;
            }
        }


        var requestData = {body:{tracid:$scope.operateTradeAccount.tracid, maid:$scope.operateTradeAccount.maid, acid:$scope.operateTradeAccount.acid,
            marketid:$scope.operateTradeAccount.marketid, hedgeflag:$scope.operateTradeAccount.hedgeflag, trcode:$scope.operateTradeAccount.trcode, tracname:$scope.operateTradeAccount.tracname, currencyid:$scope.operateTradeAccount.currencyid,
            chid:$scope.operateTradeAccount.chid, creator:$scope.operateTradeAccount.creator, stat:$scope.operateTradeAccount.stat, delMarket:delMarket, addMarket:addMarket}};
        tradeAccountService.editTradeAccount(requestData,function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("编辑交易账户失败!"+res.msret.msg);
                return;
            }
            cms.message.success("编辑交易账户成功!");
            $scope.getTradeAccount($scope.currentAssetAccount.acid);
            $scope.editTradeMarket=false;
            $scope.hideTractModal();
            $scope.$apply();
        });
    }

    $scope.clickMarketCheckBox=function(market){
        market.checked=!market.checked;
    }

    $scope.checkTradeAccount=function(tradeAccount){
        // if(!tradeAccount.tracid  ) {
        //     cms.message.error("交易账户编号必须为正整数");
        //     return false;
        // }
        if(!tradeAccount.maid ) {
            cms.message.error("资产管理人ID必须为正整数");
            return false;
        }
        if(!tradeAccount.acid ) {
            cms.message.error("资产帐户ID必须为正整数");
            return false;
        }
        if(!tradeAccount.marketid ) {
            cms.message.error("市场ID必须为正整数");
            return false;
        }
        if( $scope.currentAssetAccount.actype == 3 && !(tradeAccount.hedgeflag > 0)) {
            cms.message.error("对冲标志必须为正整数");
            return false;
        }
        if(!tradeAccount.trcode ) {
            cms.message.error("交易编码不能为空");
            return false;
        }
        if(!tradeAccount.tracname ) {
            cms.message.error("交易账户名称不能为空");
            return false;
        }
        if(!tradeAccount.currencyid ) {
            cms.message.error("币种必须为正整数");
            return false;
        }
        if(!tradeAccount.chid ) {
            cms.message.error("通道ID必须为正整数");
            return false;
        }
        return true;
    }

    $scope.createTaactFutureFeeRate=function(tradeAccount){
        tradeAccount=tradeAccount||{};
        $scope.operateTradeAccount=tradeAccount;
        $scope.operateTractFutureFeeRate={tracid:tradeAccount.tracid};
        $scope.operateModelState="createTradeAccountFutureFeeRate";
        $scope.operateModelPath="../tradeAccountManage/tradeAccountFutureFeeRate.html";
    }


    $scope.checkTradeAccountFutureFeeRate=function(tradeAccountFutureFeeRate){

        if(!tradeAccountFutureFeeRate.bid ) {
            cms.message.error("券商编号必须为正整数");
            return false;
        }
        if(!tradeAccountFutureFeeRate.tracid ) {
            cms.message.error("交易账户ID必须为正整数");
            return false;
        }
        if(!tradeAccountFutureFeeRate.ukcode ) {
            cms.message.error("ukcode必须为正整数");
            return false;
        }
        if(!tradeAccountFutureFeeRate.offset_flag ) {
            cms.message.error("开平方向不能为空");
            return false;
        }

        var fReg = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{1,3})?$/;   //验证（17，3）浮点数
        if(!fReg.test(tradeAccountFutureFeeRate.feerate_by_amt)) {
            cms.message.error("成交费率值不正确");
            return ;
        }

        if(!fReg.test(tradeAccountFutureFeeRate.feerate_by_qty)) {
            cms.message.error("每手费率值不正确");
            return false;
        }
        return true;
    }

    $scope.createTaactStockFeeRate=function(tradeAccount){
        tradeAccount=tradeAccount||{};
        $scope.operateTradeAccount=tradeAccount;

        $scope.operateModelState="createTradeAccountStockFeeRate";
        $scope.operateModelPath="../tradeAccountManage/tractStockFeeRate.html";
    }

    $scope.addTradeAccountStockFeeRate=function() {
        var i = 0, j = 0, delCommand=[], addCommand=[], editCommand=[];
        for (; i < $scope.allCommand.length; i++) {

            if (j >= $scope.allStockFeeRate.length && $scope.allCommand[i].checked) {
                if (!$scope.checkTradeAccountStockFeeRate($scope.allCommand[i],i)) { //校验数据正确性
                    return ;
                }
                if ($scope.allCommand[i].changed && $scope.allCommand[i].checked_original) {
                    editCommand.push({ cmdid:$scope.allCommand[i].cmdid,taxrate:$scope.allCommand[i].taxrate, commissionrate:$scope.allCommand[i].commissionrate, min_commissionfee:$scope.allCommand[i].min_commissionfee,
                        max_commissionfee:$scope.allCommand[i].max_commissionfee, transrate:$scope.allCommand[i].transrate, min_transfee:$scope.allCommand[i].min_transfee,
                        max_transfee:$scope.allCommand[i].max_transfee, handingrate:$scope.allCommand[i].handingrate, sec_mgt_rate:$scope.allCommand[i].sec_mgt_rate});
                } else {
                    addCommand.push({ cmdid:$scope.allCommand[i].cmdid,taxrate:$scope.allCommand[i].taxrate, commissionrate:$scope.allCommand[i].commissionrate, min_commissionfee:$scope.allCommand[i].min_commissionfee,
                        max_commissionfee:$scope.allCommand[i].max_commissionfee, transrate:$scope.allCommand[i].transrate, min_transfee:$scope.allCommand[i].min_transfee,
                        max_transfee:$scope.allCommand[i].max_transfee, handingrate:$scope.allCommand[i].handingrate, sec_mgt_rate:$scope.allCommand[i].sec_mgt_rate});
                }
                continue;
            }

            for (; j < $scope.allStockFeeRate.length; j++) {
                if ($scope.allCommand[i].cmdid == $scope.allStockFeeRate[j].cmdid) {
                    if ($scope.allCommand[i].checked) {
                        if($scope.allCommand[i].changed && $scope.allCommand[i].checked_original){

                            if (!$scope.checkTradeAccountStockFeeRate($scope.allCommand[i],i)) { //校验数据正确性
                                return ;
                            }

                            editCommand.push({ cmdid:$scope.allCommand[i].cmdid,taxrate:$scope.allCommand[i].taxrate, commissionrate:$scope.allCommand[i].commissionrate, min_commissionfee:$scope.allCommand[i].min_commissionfee,
                                max_commissionfee:$scope.allCommand[i].max_commissionfee, transrate:$scope.allCommand[i].transrate, min_transfee:$scope.allCommand[i].min_transfee,
                                max_transfee:$scope.allCommand[i].max_transfee, handingrate:$scope.allCommand[i].handingrate, sec_mgt_rate:$scope.allCommand[i].sec_mgt_rate});
                        }
                    } else {
                        delCommand.push({ cmdid:$scope.allCommand[i].cmdid});
                    }

                    ++j;
                    break;
                } else if ($scope.allCommand[i].cmdid > $scope.allStockFeeRate[j].cmdid) { //实际这种情况不存在
                    continue;
                } else  {
                    if($scope.allCommand[i].checked) {
                        if (!$scope.checkTradeAccountStockFeeRate($scope.allCommand[i],i)) { //校验数据正确性
                            return ;
                        }

                        addCommand.push({ cmdid:$scope.allCommand[i].cmdid,taxrate:$scope.allCommand[i].taxrate, commissionrate:$scope.allCommand[i].commissionrate, min_commissionfee:$scope.allCommand[i].min_commissionfee,
                            max_commissionfee:$scope.allCommand[i].max_commissionfee, transrate:$scope.allCommand[i].transrate, min_transfee:$scope.allCommand[i].min_transfee,
                            max_transfee:$scope.allCommand[i].max_transfee, handingrate:$scope.allCommand[i].handingrate, sec_mgt_rate:$scope.allCommand[i].sec_mgt_rate});
                    }
                    break;
                }

            }
        }

        while(j < $scope.allStockFeeRate.length ) {
			delCommand.push({ cmdid: $scope.allStockFeeRate[j].cmdid});
            ++j;
		}

        if (delCommand.length == 0 && addCommand.length  == 0 && editCommand.length  == 0) {
            cms.message.success("没有修改任何股票费率");
            $scope.stockFeeRateInfo.state="showFee";
            return;
        }

        var requestData = {body:{celltype:6, cellid:$scope.operateTradeAccount.tracid, delCommand:delCommand, addCommand:addCommand, editCommand:editCommand}};
        tradeAccountService.saveMultipleStockFeeRate(requestData,function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("设置交易账户的指令失败."+res.msret.msg);
                return;
            }
            $scope.stockFeeRateInfo.state="showFee";
            cms.message.success("设置交易账户的指令成功!");
            $scope.getTradeAccountStockFeeRate({celltype:6, cellid:$scope.operateTradeAccount.tracid });
            $scope.$apply();
        });
    }


    $scope.checkTradeAccountStockFeeRate=function(tradeAccountStockFeeRate,index){
        var fReg12_8 = /^(0|([1-9][0-9]{0,3}))(\.[0-9]{1,8})?$/;   //验证（12，8）浮点数
        var fReg17_2 = /^(0|([1-9][0-9]{0,14}))(\.[0-9]{1,2})?$/;   //验证（17，2）浮点数

        tradeAccountStockFeeRate.error=true;
        if(!fReg17_2.test(tradeAccountStockFeeRate.taxrate) ) {
            cms.message.error("印花税率不正确");
            return false;
        }
        if(!fReg17_2.test(tradeAccountStockFeeRate.commissionrate ) ) {
            cms.message.error("交易佣金费率不正确");
            return false;
        }
        if(!fReg17_2.test(tradeAccountStockFeeRate.min_commissionfee) ) {
            cms.message.error("最小交易佣金费不正确");
            return false;
        }

        if(!fReg17_2.test(tradeAccountStockFeeRate.max_commissionfee)) {
            cms.message.error("最大交易佣金不正确");
            return false;
        }

        if(!fReg17_2.test(tradeAccountStockFeeRate.transrate)) {
            cms.message.error("买过户费率不正确");
            return false;
        }

        if(!fReg17_2.test(tradeAccountStockFeeRate.min_transfee)) {
            cms.message.error("最小过户费不正确");
            return false;
        }

        if(!fReg17_2.test(tradeAccountStockFeeRate.max_transfee)) {
            cms.message.error("最大过户费不正确");
            return false;
        }

        if(!fReg17_2.test(tradeAccountStockFeeRate.handingrate)) {
            cms.message.error("经手费率值不正确");
            return false;
        }

        if(!fReg17_2.test(tradeAccountStockFeeRate.sec_mgt_rate)) {
            cms.message.error("证管费率不正确");
            return false;
        }
		tradeAccountStockFeeRate.error=false;
        return true;
    }

    $scope.confirmTaactDetail=function(){
        if ($scope.dialogModalInfo.state === 'createTradeAccount') {
            $scope.addTradeAccount();
        }else {
            $scope.editTradeAccount();
        }
    }

    $scope.showOrHideChildren=function(obj) {
        obj.showChildren=!obj.showChildren;
    }

    $scope.changeTracid=function(){
        var reg=/[1-9]\d{0,3}/;
        if (!reg.test($scope.operateTradeAccount.tracid)) {
            $scope.operateTradeAccount.tracid="";
            $scope.operateTradeAccount.real_tracid="";
        } else {
            $scope.operateTradeAccount.real_tracid=parseInt($scope.operateTradeAccount.acid)*10000 + parseInt($scope.operateTradeAccount.tracid);
        }
    }

    $scope.showTractModalLoadReady=function () {
        switch ($scope.dialogModalInfo.state) {
            case "createTradeAccount":
                mainService.showModal("tract_modal_back", "tractManage_detail_modal", "tractManage_detail_modal_title");
                break;
            case "editTradeAccount":
                mainService.showModal("tract_modal_back", "tractManage_detail_modal", "tractManage_detail_modal_title");
                break;
            case "delTradeAccount":
                mainService.showModal("tract_modal_back", "tractManage_del_modal", "tractManage_del_modal");
                break;
            case "stockFeeRate":
                mainService.showModal("tract_modal_back", "tractManage_stockFee_modal", "tractManage_stockFee_modal_title");
                break;
            case "futrueFeeRate":
                mainService.showModal("tract_modal_back", "tractManage_del_modal", "tractManage_del_modal");
                break;
            case "addStockFeeRate":
                mainService.showModal("tract_modal_back", "tractManage_add_modal", "tractManage_add_modal_title");
                break;
            case "editStockFeeRate":
                mainService.showModal("tract_modal_back", "tractManage_add_modal", "tractManage_add_modal_title");

                break;
            case "delStockFeeRate":

                break;
            case "setFuturesMargin":
                mainService.showModal("tract_modal_back","futures_margin_modal","futures_margin_modal_title");
                //设置文件选择响应
                document.getElementById("futures_margin_file").onchange = function() {
                    if(document.getElementById("futures_margin_file").value != "") {
						tradeAccountService.parseExcelFile(document.getElementById("futures_margin_file"),function(res) {
							if(res.result == true) {
								$scope.analyseFuturesMarginLoadData(res.data);
								$scope.$apply();
							}
							else {
								cms.message.error("解析文件失败."+res.reason);
								cms.log("解析文件失败.",res.reason);
							}
						})
					}
                }
                break;
            case "setFuturesOrder":
                mainService.showModal("tract_modal_back","futures_order_modal","futures_order_modal_title");
                //设置文件选择响应
                document.getElementById("futures_order_file").onchange = function() {
                    if(document.getElementById("futures_order_file").value != "") {
						tradeAccountService.parseExcelFile(document.getElementById("futures_order_file"),function(res) {
							if(res.result == true) {
								$scope.analyseFuturesOrderLoadData(res.data);
								$scope.$apply();
							}
							else {
								cms.message.error("解析文件失败."+res.reason);
								cms.log("解析文件失败.",res.reason);
							}
						})
					}
                }
                break;
            case "setFuturesFeerate":
                mainService.showModal("tract_modal_back","futures_feerate_modal","futures_feerate_modal_title");
                //设置文件选择响应
                document.getElementById("futures_feerate_file").onchange = function() {
                    if(document.getElementById("futures_feerate_file").value != "") {
						tradeAccountService.parseExcelFile(document.getElementById("futures_feerate_file"),function(res) {
							if(res.result == true) {
								$scope.analyseFuturesFeerateLoadData(res.data);
								$scope.$apply();
							}
							else {
								cms.message.error("解析文件失败."+res.reason);
								cms.log("解析文件失败.",res.reason);
							}
						})
					}
                }
                break;
            case "setFuturesDelayFeerate":
                mainService.showModal("tract_modal_back","futures_delay_modal","futures_delay_modal_title");
                //设置文件选择响应
                document.getElementById("futures_delay_file").onchange = function() {
                    if(document.getElementById("futures_delay_file").value != "") {
						tradeAccountService.parseExcelFile(document.getElementById("futures_delay_file"),function(res) {
							if(res.result == true) {
								$scope.analyseFuturesDelayLoadData(res.data);
								$scope.$apply();
							}
							else {
								cms.message.error("解析文件失败."+res.reason);
								cms.log("解析文件失败.",res.reason);
							}
						})
					}
                }
                break;
            default:

        }
    }

    $scope.hideTractModal=function() {
        mainService.hideModal("tract_modal_back");
        $scope.dialogModalInfo.state="";
        $scope.dialogModalInfo.path="";
    }

    $scope.changeFeeTemplate=function(command) {
        command.checked=true;
        command.changed=true;

        command.taxrate=command.template.taxrate;
        command.commissionrate=command.template.commissionrate;
        command.min_commissionfee=command.template.min_commissionfee;
        command.max_commissionfee=command.template.max_commissionfee;
        command.transrate=command.template.transrate;
        command.min_transfee=command.template.min_transfee;
        command.max_transfee=command.template.max_transfee;
        command.handingrate=command.template.handingrate;
        command.sec_mgt_rate=command.template.sec_mgt_rate;
    }

    $scope.resetStockFeeRateTemplate=function(template) {
        if($scope.allStockFeeRateTemplate.length) {
            template=$scope.allStockFeeRateTemplate[0];
        }
    }

    $scope.clickCheckBox=function(command) {
        command.checked=!command.checked;
    }

    $scope.cancelStockFee=function() {
        $scope.stockFeeRateInfo.state="showFee";

    }

    $scope.changeStockFeeRate=function(command) {
        command.checked=true;
        command.changed=true;
        command.template={};

    }

    $scope.refreshStockFee=function() {
        $scope.getTradeAccountStockFeeRate({celltype:6, cellid:$scope.operateTradeAccount.tracid });
    }

    $scope.clickEditStockFeeTable=function(index) {
        $scope.stockFeeRateInfo.editStockFeeIndex=index;
    }

    $scope.clickShowStockFeeTable=function(index) {
        $scope.stockFeeRateInfo.showStockFeeIndex=index;
    }

    // $scope.filterCommand=function(obj) {
    //     return obj.acttype == $scope.currentAssetAccount.actype ;
    // }

    $scope.filterTradeAccount=function(obj) {
        // return (obj.tracname.indexOf($scope.findStockCode) !== -1) || (!$scope.findStockCode  || obj.tracid == $scope.findStockCode);
        return !$scope.findStockCode  || (obj.tracname.indexOf($scope.findStockCode) !== -1) || (String(obj.tracid).indexOf($scope.findStockCode) !== -1) ;
    }

    $scope.focusMarketList=function() {
        $scope.operateTradeAccount.showMarketList=true;
    }

    $scope.blurMarketList=function() {
        $scope.operateTradeAccount.showMarketList=false;
    }

    //关闭期货相关弹框
    $scope.hideFuturesModal = function() {
        $scope.hideTractModal();
    }

    //设置保证金率
    $scope.setFuturesMargin = function(obj) {
		$scope.currentMargin.tracid = obj.tracid;
		$scope.currentMargin.loadFileAble = false;
        $scope.currentMargin.marginList = [];
		$scope.currentMargin.buy_index = -1;
		$scope.currentMargin.sell_index = -1;
		$scope.currentMargin.userClick = false;
		$scope.currentMargin.showtips = false;
		$scope.currentMargin.editMargin = {};
		$scope.getFuturesMargin();
        $scope.dialogModalInfo.state="setFuturesMargin";
        $scope.dialogModalInfo.path="../tradeAccountManage/futures-margin.html";
    }

    //获取期货保证金
	$scope.getFuturesMargin = function() {
		$scope.currentMargin.marginList.splice(0,$scope.currentMargin.marginList.length);
		var reqData = {body:{tracid:$scope.currentMargin.tracid}};
		tradeAccountService.getFuturesMargin(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.currentMargin.marginList = res.body;
				angular.forEach($scope.currentMargin.marginList,function(margin) {
					margin.buy_marginrate = parseFloat(margin.buy_marginrate);
					margin.sell_marginrate = parseFloat(margin.sell_marginrate);
				});
				$scope.$apply();
			}
			else {
				cms.message.error("获取期货保证金失败.");
				cms.log("获取期货保证金失败.",JSON.stringify(res.msret));
			}
		})
	}

	//导入保证金
	$scope.loadFuturesMarginSelectFile = function() {
		// document.getElementById("futures_margin_form").reset();
		// document.getElementById("futures_margin_file").click();
        tradeAccountService.importExcelFile(function(err,res) {
            if(err) return ;
            if(res.result == true) {
                $scope.analyseFuturesMarginLoadData(res.data);
                $scope.$apply();
            }
            else {
                cms.message.error(res.reason);
                cms.log("解析文件失败.",res.reason);
            }
        })
	}

	//解析导入的文件
	$scope.analyseFuturesMarginLoadData = function(data) {
		if(data.length < 2 ) {
			cms.message.error("选择的文件无数据，请重新选择.");
			return ;
		}
		var iReg = /^(0|([1-9][0-9]*))$/;
		var fReg = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{1,3})?$/;
		var array = [];
		for(var i = 1; i < data.length ; i ++) {
			if(data[i].length < 5) {
				cms.message.error("第"+(i+1)+"行存在空数据，请修改后重试.");
				return ;
			}
			var temp = {};
			if(!iReg.test(data[i][0])) {
				cms.message.error("第"+(i+1)+"行ukcode错误，请修改后重试.");
				return ;
			}
			temp.ukcode = data[i][0];
			temp.marketcode = data[i][1];
			temp.chname = data[i][2];
			if(!fReg.test(data[i][3])) {
				cms.message.error("第"+(i+1)+"行多头保证金率错误，请修改后重试.");
				return ;
			}
			temp.buy_marginrate = data[i][3];
			if(!fReg.test(data[i][4])) {
				cms.message.error("第"+(i+1)+"行空头保证金率错误，请修改后重试.");
				return ;
			}
			temp.sell_marginrate = data[i][4];
			temp.tracid = $scope.currentMargin.tracid;
			array.push(temp);
		}
		$scope.currentMargin.marginList.splice(0,$scope.currentMargin.marginList.length);
		angular.forEach(array,function(margin) {
			$scope.currentMargin.marginList.push(margin)
		})
		$scope.currentMargin.loadFileAble = true;
	}


	//编辑保证金取消编辑
	$scope.editFuturesMarginClickBody = function(e) {
		if($scope.currentMargin.userClick == true) {
			$scope.currentMargin.userClick = false;
			return ;
		}
		$scope.currentMargin.buy_index = -1;
		$scope.currentMargin.sell_index = -1;
		$scope.$apply();
		document.body.removeEventListener('click',$scope.editFuturesMarginClickBody,false);
		e.preventDefault();
	}

	//编辑保证金率
	$scope.editFuturesMargin = function(index,type) {
		if(type == 1) {
			$scope.currentMargin.buy_index = index;
			$scope.currentMargin.sell_index = -1;
			$scope.currentMargin.editMargin.tracid = $scope.currentMargin.marginList[index].tracid;
			$scope.currentMargin.editMargin.ukcode = $scope.currentMargin.marginList[index].ukcode;
			$scope.currentMargin.editMargin.buy_marginrate = $scope.currentMargin.marginList[index].buy_marginrate;
		}
		else {
			$scope.currentMargin.buy_index = -1;
			$scope.currentMargin.sell_index = index;
            $scope.currentMargin.editMargin.tracid = $scope.currentMargin.marginList[index].tracid;
			$scope.currentMargin.editMargin.ukcode = $scope.currentMargin.marginList[index].ukcode;
			$scope.currentMargin.editMargin.sell_marginrate = $scope.currentMargin.marginList[index].sell_marginrate;
		}
		$scope.currentMargin.userClick = true;
		document.body.addEventListener('click',$scope.editFuturesMarginClickBody,false);
	}

	//判断保证金率输入--检测Esc,回车
	$scope.futuresMarginEditKeyup = function(event,type) {
		var fReg = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{1,3})?$/;
		if(event.keyCode == 27) {
			$scope.currentMargin.buy_index = -1;
			$scope.currentMargin.sell_index = -1;
			document.body.addEventListener('click',$scope.editFuturesMarginClickBody,false);
		}
		if(event.keyCode == 13) {
			if(type == 1) {
				if(!fReg.test($scope.currentMargin.editMargin.buy_marginrate)){
					cms.message.error("请正确输入多头保证金率");
					return ;
				}
				else {
					if($scope.currentMargin.loadFileAble == true) {
						$scope.currentMargin.marginList[$scope.currentMargin.buy_index].buy_marginrate = $scope.currentMargin.editMargin.buy_marginrate;
						$scope.currentMargin.buy_index = -1;
						document.body.addEventListener('click',$scope.editFuturesMarginClickBody,false);
					}
					else {
						var reqData = {body:{
							tracid: $scope.currentMargin.editMargin.tracid,
							ukcode: $scope.currentMargin.editMargin.ukcode,
							buy_marginrate: $scope.currentMargin.editMargin.buy_marginrate
						}};
						tradeAccountService.updateFuturesMargin(reqData,function(res) {
							if(res.msret.msgcode == "00") {
								cms.message.success("修改成功.");
								$scope.currentMargin.marginList[$scope.currentMargin.buy_index].buy_marginrate = $scope.currentMargin.editMargin.buy_marginrate;
								$scope.currentMargin.buy_index = -1;
								document.body.addEventListener('click',$scope.editFuturesMarginClickBody,false);
								$scope.$apply();
							}
							else {
								cms.message.error("修改多头保证金失败."+res.msret.msg);
								cms.log("修改多头保证金失败.",JSON.stringify(res.msret));
							}
						})
					}
				}
			}
			else {
				if(!fReg.test($scope.currentMargin.editMargin.sell_marginrate)){
					cms.message.error("请正确输入空头保证金率");
					return ;
				}
				else {
					if($scope.currentMargin.loadFileAble == true) {
						$scope.currentMargin.marginList[$scope.currentMargin.sell_index].sell_marginrate = $scope.currentMargin.editMargin.sell_marginrate;
						$scope.currentMargin.sell_index = -1;
						document.body.addEventListener('click',$scope.editFuturesMarginClickBody,false);
					}
					else {
						var reqData = {body:{
							tracid: $scope.currentMargin.editMargin.tracid,
							ukcode: $scope.currentMargin.editMargin.ukcode,
							sell_marginrate: $scope.currentMargin.editMargin.sell_marginrate
						}};
						tradeAccountService.updateFuturesMargin(reqData,function(res) {
							if(res.msret.msgcode == "00") {
								cms.message.success("修改成功.");
								$scope.currentMargin.marginList[$scope.currentMargin.sell_index].sell_marginrate = $scope.currentMargin.editMargin.sell_marginrate;
								$scope.currentMargin.sell_index = -1;
								document.body.addEventListener('click',$scope.editFuturesMarginClickBody,false);
								$scope.$apply();
							}
							else {
								cms.message.error("修改多头保证金失败."+res.msret.msg);
								cms.log("修改多头保证金失败.",JSON.stringify(res.msret));
							}
						})
					}
				}
			}
		}
	}

	//编辑保证金获得输入
	$scope.futuresMarginEditInput = function(type) {
		var fReg = /^((0|([1-9][0-9]{0,13}))(\.[0-9]{0,17})?)?$/;
		if(type == 1) {
			if(!fReg.test($scope.currentMargin.editMargin.buy_marginrate)) {
				$scope.currentMargin.editMargin.buy_marginrate = "0";
			}
		}
		else {
			if(!fReg.test($scope.currentMargin.editMargin.sell_marginrate)) {
				$scope.currentMargin.editMargin.sell_marginrate = "0";
			}
		}
	}

	//确定导入
	$scope.futuresLoadMargin = function() {
		var reqData = {body:{}};
        reqData.body.tracid = $scope.currentMargin.tracid;
		reqData.body.data = [];
		angular.forEach($scope.currentMargin.marginList,function(margin) {
			var temp = {};
			temp.tracid = margin.tracid;
			temp.ukcode = margin.ukcode;
			temp.buy_marginrate = margin.buy_marginrate;
			temp.sell_marginrate = margin.sell_marginrate;
			reqData.body.data.push(temp);
		})
		tradeAccountService.loadFuturesMargin(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				cms.message.success("导入成功.",5);
				$scope.currentMargin.loadFileAble = false;
				$scope.getFuturesMargin();
			}
			else {
				cms.message.error("导入失败."+res.msret.msg);
				cms.log("导入失败.",JSON.stringify(res.msret));
			}
		})
	}

	//取消导入
	$scope.futuresLoadMarginCancel = function() {
		$scope.currentMargin.loadFileAble = false;
		$scope.getFuturesMargin();
	}

    //设置申报费
    $scope.setFuturesOrder = function(obj) {
		$scope.currentOrderFee.tracid = obj.tracid;
        $scope.currentOrderFee.loadFileAble = false;
		$scope.currentOrderFee.orderList = [];
		$scope.currentOrderFee.order_index = -1;
		$scope.currentOrderFee.userClick = false;
		$scope.currentOrderFee.showtips = false;
		$scope.currentOrderFee.editOrder = {};
		$scope.getFuturesOrder();
        $scope.dialogModalInfo.state="setFuturesOrder";
        $scope.dialogModalInfo.path="../tradeAccountManage/futures-order.html";
    }

    //获取申报费
	$scope.getFuturesOrder = function() {
		$scope.currentOrderFee.orderList.splice(0,$scope.currentOrderFee.orderList.length);
		var reqData = {body:{tracid:$scope.currentOrderFee.tracid}};
		tradeAccountService.getFuturesOrder(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.currentOrderFee.orderList = res.body;
				angular.forEach($scope.currentOrderFee.orderList,function(order) {
					order.orderfee = parseFloat(order.orderfee);
				});
				$scope.$apply();
			}
			else {
				cms.message.error("获取数据失败.");
				cms.log("获取数据失败.",JSON.stringify(res.msret));
			}
		})
	}

	//导入申报费
	$scope.loadFuturesOrderSelectFile = function() {
		// document.getElementById("futures_order_form").reset();
		// document.getElementById("futures_order_file").click();
        tradeAccountService.importExcelFile(function(err,res) {
            if(err) return ;
            if(res.result == true) {
                $scope.analyseFuturesOrderLoadData(res.data);
                $scope.$apply();
            }
            else {
                cms.message.error(res.reason);
                cms.log("解析文件失败.",res.reason);
            }
        })
	}

	//解析导入的文件
	$scope.analyseFuturesOrderLoadData = function(data) {
		if(data.length < 2 ) {
			cms.message.error("选择的文件无数据，请重新选择.");
			return ;
		}
		var iReg = /^(0|([1-9][0-9]*))$/;
		var fReg = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{1,3})?$/;
		var array = [];
		for(var i = 1; i < data.length ; i ++) {
			if(data[i].length < 4) {
				cms.message.error("第"+(i+1)+"行存在空数据，请修改后重试.");
				return ;
			}
			var temp = {};
			if(!iReg.test(data[i][0])) {
				cms.message.error("第"+(i+1)+"行合约ID错误，请修改后重试.");
				return ;
			}
			temp.contractid = data[i][0];
			temp.contractcode = data[i][1];
			temp.contractchname = data[i][2];
			if(!fReg.test(data[i][3])) {
				cms.message.error("第"+(i+1)+"行申报费错误，请修改后重试.");
				return ;
			}
			temp.orderfee = data[i][3];
			temp.tracid = $scope.currentOrderFee.tracid;
			array.push(temp);
		}
		$scope.currentOrderFee.orderList.splice(0,$scope.currentOrderFee.orderList.length);
		angular.forEach(array,function(order) {
			$scope.currentOrderFee.orderList.push(order)
		})
		$scope.currentOrderFee.loadFileAble = true;
	}


	//编辑申报费取消编辑
	$scope.editFuturesOrderClickBody = function(e) {
		if($scope.currentOrderFee.userClick == true) {
			$scope.currentOrderFee.userClick = false;
			return ;
		}
		$scope.currentOrderFee.order_index = -1;
		$scope.$apply();
		document.body.removeEventListener('click',$scope.editFuturesOrderClickBody,false);
		e.preventDefault();
	}

	//编辑申报费
	$scope.editFuturesOrder = function(index) {
		$scope.currentOrderFee.order_index = index;
		$scope.currentOrderFee.editOrder.tracid = $scope.currentOrderFee.orderList[index].tracid;
		$scope.currentOrderFee.editOrder.contractid = $scope.currentOrderFee.orderList[index].contractid;
		$scope.currentOrderFee.editOrder.orderfee = $scope.currentOrderFee.orderList[index].orderfee;
		$scope.currentOrderFee.userClick = true;
		document.body.addEventListener('click',$scope.editFuturesOrderClickBody,false);
	}

	//判断申报费输入--检测Esc,回车
	$scope.futuresOrderEditKeyup = function(event) {
		var fReg = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{1,3})?$/;
		if(event.keyCode == 27) {
			$scope.currentOrderFee.order_index = -1;
			document.body.addEventListener('click',$scope.editFuturesOrderClickBody,false);
		}
		if(event.keyCode == 13) {
			if(!fReg.test($scope.currentOrderFee.editOrder.orderfee)){
				cms.message.error("请正确输入申报费");
				return ;
			}
			else {
				if($scope.currentOrderFee.loadFileAble == true) {
					$scope.currentOrderFee.orderList[$scope.currentOrderFee.order_index].orderfee = $scope.currentOrderFee.editOrder.orderfee;
					$scope.currentOrderFee.order_index = -1;
					document.body.addEventListener('click',$scope.editFuturesOrderClickBody,false);
				}
				else {
					var reqData = {body:{
						tracid: $scope.currentOrderFee.editOrder.tracid,
						contractid: $scope.currentOrderFee.editOrder.contractid,
						orderfee: $scope.currentOrderFee.editOrder.orderfee
					}};
					tradeAccountService.updateFuturesOrder(reqData,function(res) {
						if(res.msret.msgcode == "00") {
							cms.message.success("修改成功.");
							$scope.currentOrderFee.orderList[$scope.currentOrderFee.order_index].orderfee = $scope.currentOrderFee.editOrder.orderfee;
							$scope.currentOrderFee.order_index = -1;
							document.body.addEventListener('click',$scope.editFuturesOrderClickBody,false);
							$scope.$apply();
						}
						else {
							cms.message.error("修改申报费失败."+res.msret.msg);
							cms.log("修改申报费失败.",JSON.stringify(res.msret));
						}
					})
				}
			}
		}
	}

	//编辑申报费获得输入
	$scope.futuresOrderEditInput = function() {
		var fReg = /^((0|([1-9][0-9]{0,13}))(\.[0-9]{0,17})?)?$/;
		if(!fReg.test($scope.currentOrderFee.editOrder.orderfee)) {
			$scope.currentOrderFee.editOrder.orderfee = "0";
		}
	}

	//确定导入
	$scope.futuresLoadOrder = function() {
		var reqData = {body:{}};
        reqData.body.tracid = $scope.currentOrderFee.tracid;
		reqData.body.data = [];
		angular.forEach($scope.currentOrderFee.orderList,function(order) {
			var temp = {};
			temp.tracid = order.tracid;
			temp.contractid = order.contractid;
			temp.orderfee = order.orderfee;
			reqData.body.data.push(temp);
		})
		tradeAccountService.loadFuturesOrder(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				cms.message.success("导入成功.",5);
				$scope.currentOrderFee.loadFileAble = false;
				$scope.getFuturesOrder();
			}
			else {
				cms.message.error("导入失败."+res.msret.msg);
				cms.log("导入失败.",JSON.stringify(res.msret));
			}
		})
	}

	//取消导入
	$scope.futuresLoadOrderCancel = function() {
		$scope.currentOrderFee.loadFileAble = false;
		$scope.getFuturesOrder();
	}

    //设置期货费率
    $scope.setFuturesFeerate = function(obj) {
        $scope.currentFuturesFeerate.celltype = 6;
		$scope.currentFuturesFeerate.cellid = obj.tracid;
        $scope.currentFuturesFeerate.loadFileAble = false;
		$scope.currentFuturesFeerate.feerateList = [];
		$scope.currentFuturesFeerate.amt_index = -1;
		$scope.currentFuturesFeerate.qty_index = -1;
		$scope.currentFuturesFeerate.userClick = false;
		$scope.currentFuturesFeerate.showtips = false;
		$scope.currentFuturesFeerate.editFeerate = {};
		$scope.getFuturesFeerate();
        $scope.dialogModalInfo.state="setFuturesFeerate";
        $scope.dialogModalInfo.path="../tradeAccountManage/futures-feerate.html";
    }

    //获取期货费率
	$scope.getFuturesFeerate = function() {
		$scope.currentFuturesFeerate.feerateList.splice(0,$scope.currentFuturesFeerate.feerateList.length);
		var reqData = {body:{celltype:$scope.currentFuturesFeerate.celltype,cellid:$scope.currentFuturesFeerate.cellid}};
		tradeAccountService.getFuturesFeerate(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.currentFuturesFeerate.feerateList = res.body;
				angular.forEach($scope.currentFuturesFeerate.feerateList,function(feerate) {
					feerate.feerate_by_amt = parseFloat(feerate.feerate_by_amt);
					feerate.feerate_by_qty = parseFloat(feerate.feerate_by_qty);
					if(feerate.offset_flag  == 1) {
						feerate.show_offset_flag = "开仓";
					}
					if(feerate.offset_flag  == 2) {
						feerate.show_offset_flag = "平仓";
					}
					if(feerate.offset_flag  == 3) {
						feerate.show_offset_flag = "平今";
					}
					if(feerate.offset_flag  == 4) {
						feerate.show_offset_flag = "平昨";
					}
				});
				$scope.$apply();
			}
			else {
				cms.message.error("获取数据失败.");
				cms.log("获取数据失败.",JSON.stringify(res.msret));
			}
		})
	}

	//导入期货费率
	$scope.loadFuturesFeerateSelectFile = function() {
		// document.getElementById("futures_feerate_form").reset();
		// document.getElementById("futures_feerate_file").click();
        tradeAccountService.importExcelFile(function(err,res) {
            if(err) return ;
            if(res.result == true) {
                $scope.analyseFuturesFeerateLoadData(res.data);
                $scope.$apply();
            }
            else {
                cms.message.error(res.reason);
                cms.log("解析文件失败.",res.reason);
            }
        })
	}

	//解析导入的文件
	$scope.analyseFuturesFeerateLoadData = function(data) {
		if(data.length < 2 ) {
			cms.message.error("选择的文件无数据，请重新选择.");
			return ;
		}
		var iReg = /^(0|([1-9][0-9]*))$/;
		var fReg = /^(0|([1-9][0-9]{0,8}))(\.[0-9]{1,8})?$/;
		var array = [];
		for(var i = 1; i < data.length ; i ++) {
			if(data[i].length < 6) {
				cms.message.error("第"+(i+1)+"行存在空数据，请修改后重试.");
				return ;
			}
			var temp = {};
			if(!iReg.test(data[i][0])) {
				cms.message.error("第"+(i+1)+"行合约ID错误，请修改后重试.");
				return ;
			}
			temp.contractid = data[i][0];
			temp.contractcode = data[i][1];
			temp.contractchname = data[i][2];
			temp.show_offset_flag = data[i][3];
			if(data[i][3] == "开仓") {
				temp.offset_flag = 1;
			}
			else if(data[i][3] == "平仓") {
				temp.offset_flag = 2;
			}
			else if(data[i][3] == "平昨") {
				temp.offset_flag = 3;
			}
			else if(data[i][3] == "平今") {
				temp.offset_flag = 4;
			}
			else {
				cms.message.error("第"+(i+1)+"行开平方向错误，请修改后重试.");
				return ;
			}
			if(!fReg.test(data[i][4])) {
				cms.message.error("第"+(i+1)+"行成交额费率错误，请修改后重试.");
				return ;
			}
			temp.feerate_by_amt = data[i][4];
			if(!fReg.test(data[i][5])) {
				cms.message.error("第"+(i+1)+"行每手费率值错误，请修改后重试.");
				return ;
			}
			temp.feerate_by_qty = data[i][5];
			temp.celltype = $scope.currentFuturesFeerate.celltype;
			temp.cellid = $scope.currentFuturesFeerate.cellid;
			array.push(temp);
		}
		$scope.currentFuturesFeerate.feerateList.splice(0,$scope.currentFuturesFeerate.feerateList.length);
		angular.forEach(array,function(feerate) {
			$scope.currentFuturesFeerate.feerateList.push(feerate)
		})
		$scope.currentFuturesFeerate.loadFileAble = true;
	}


	//编辑期货费率取消编辑
	$scope.editFuturesFeerateClickBody = function(e) {
		if($scope.currentFuturesFeerate.userClick == true) {
			$scope.currentFuturesFeerate.userClick = false;
			return ;
		}
		$scope.currentFuturesFeerate.amt_index = -1;
		$scope.currentFuturesFeerate.qty_index = -1;
		$scope.$apply();
		document.body.removeEventListener('click',$scope.editFuturesFeerateClickBody,false);
		e.preventDefault();
	}

	//编辑期货费率
	$scope.editFuturesFeerate = function(index,type) {
		if(type == 1) {
			$scope.currentFuturesFeerate.amt_index = index;
			$scope.currentFuturesFeerate.qty_index = -1;
			$scope.currentFuturesFeerate.editFeerate.celltype = $scope.currentFuturesFeerate.celltype;
			$scope.currentFuturesFeerate.editFeerate.cellid = $scope.currentFuturesFeerate.cellid;
			$scope.currentFuturesFeerate.editFeerate.contractid = $scope.currentFuturesFeerate.feerateList[index].contractid;
			$scope.currentFuturesFeerate.editFeerate.offset_flag = $scope.currentFuturesFeerate.feerateList[index].offset_flag;
			$scope.currentFuturesFeerate.editFeerate.feerate_by_amt = $scope.currentFuturesFeerate.feerateList[index].feerate_by_amt;
		}
		else {
			$scope.currentFuturesFeerate.amt_index = -1;
			$scope.currentFuturesFeerate.qty_index = index;
			$scope.currentFuturesFeerate.editFeerate.celltype = $scope.currentFuturesFeerate.celltype;
			$scope.currentFuturesFeerate.editFeerate.cellid = $scope.currentFuturesFeerate.cellid;
			$scope.currentFuturesFeerate.editFeerate.contractid = $scope.currentFuturesFeerate.feerateList[index].contractid;
			$scope.currentFuturesFeerate.editFeerate.offset_flag = $scope.currentFuturesFeerate.feerateList[index].offset_flag;
			$scope.currentFuturesFeerate.editFeerate.feerate_by_qty = $scope.currentFuturesFeerate.feerateList[index].feerate_by_qty;
		}
		$scope.currentFuturesFeerate.userClick = true;
		document.body.addEventListener('click',$scope.editFuturesFeerateClickBody,false);
	}

	//判断期货费率输入--检测Esc,回车
	$scope.futuresFeerateEditKeyup = function(event,type) {
		var fReg = /^(0|([1-9][0-9]{0,8}))(\.[0-9]{1,8})?$/;
		if(event.keyCode == 27) {
			$scope.currentFuturesFeerate.amt_index = -1;
			$scope.currentFuturesFeerate.qty_index = -1;
			document.body.addEventListener('click',$scope.editFuturesFeerateClickBody,false);
		}
		if(event.keyCode == 13) {
			if(type == 1) {
				if(!fReg.test($scope.currentFuturesFeerate.editFeerate.feerate_by_amt)){
					cms.message.error("请正确输入成交额费率");
					return ;
				}
				else {
					if($scope.currentFuturesFeerate.loadFileAble == true) {
						$scope.currentFuturesFeerate.feerateList[$scope.currentFuturesFeerate.amt_index].feerate_by_amt = $scope.currentFuturesFeerate.editFeerate.feerate_by_amt;
						$scope.currentFuturesFeerate.amt_index = -1;
						document.body.addEventListener('click',$scope.editFuturesFeerateClickBody,false);
					}
					else {
						var reqData = {body:{
							cellid: $scope.currentFuturesFeerate.editFeerate.cellid,
							celltype: $scope.currentFuturesFeerate.editFeerate.celltype,
							contractid: $scope.currentFuturesFeerate.editFeerate.contractid,
							offset_flag: $scope.currentFuturesFeerate.editFeerate.offset_flag,
							feerate_by_amt: $scope.currentFuturesFeerate.editFeerate.feerate_by_amt
						}};
						tradeAccountService.updateFuturesFeerate(reqData,function(res) {
							if(res.msret.msgcode == "00") {
								cms.message.success("修改成功.");
								$scope.currentFuturesFeerate.feerateList[$scope.currentFuturesFeerate.amt_index].feerate_by_amt = $scope.currentFuturesFeerate.editFeerate.feerate_by_amt;
								$scope.currentFuturesFeerate.amt_index = -1;
								document.body.addEventListener('click',$scope.editFuturesFeerateClickBody,false);
								$scope.$apply();
							}
							else {
								cms.message.error("修改成交额费率失败."+res.msret.msg);
								cms.log("修改成交额费率失败.",JSON.stringify(res.msret));
							}
						})
					}
				}
			}
			else {
				if(!fReg.test($scope.currentFuturesFeerate.editFeerate.feerate_by_qty)){
					cms.message.error("请正确输入每手费率值");
					return ;
				}
				else {
					if($scope.currentFuturesFeerate.loadFileAble == true) {
						$scope.currentFuturesFeerate.feerateList[$scope.currentFuturesFeerate.qty_index].feerate_by_qty = $scope.currentFuturesFeerate.editFeerate.feerate_by_qty;
						$scope.currentFuturesFeerate.qty_index = -1;
						document.body.addEventListener('click',$scope.editFuturesFeerateClickBody,false);
					}
					else {
						var reqData = {body:{
							cellid: $scope.currentFuturesFeerate.editFeerate.cellid,
							celltype: $scope.currentFuturesFeerate.editFeerate.celltype,
							contractid: $scope.currentFuturesFeerate.editFeerate.contractid,
							offset_flag: $scope.currentFuturesFeerate.editFeerate.offset_flag,
							feerate_by_qty: $scope.currentFuturesFeerate.editFeerate.feerate_by_qty
						}};
						tradeAccountService.updateFuturesFeerate(reqData,function(res) {
							if(res.msret.msgcode == "00") {
								cms.message.success("修改成功.");
								$scope.currentFuturesFeerate.feerateList[$scope.currentFuturesFeerate.qty_index].feerate_by_qty = $scope.currentFuturesFeerate.editFeerate.feerate_by_qty;
								$scope.currentFuturesFeerate.qty_index = -1;
								document.body.addEventListener('click',$scope.editFuturesFeerateClickBody,false);
								$scope.$apply();
							}
							else {
								cms.message.error("修改每手费率值."+res.msret.msg);
								cms.log("修改每手费率值.",JSON.stringify(res.msret));
							}
						})
					}
				}
			}
		}
	}

	//编辑期货费率获得输入
	$scope.futuresFeerateEditInput = function(type) {
		var fReg = /^((0|([1-9][0-9]{0,8}))(\.[0-9]{0,17})?)?$/;
		if(type == 1) {
			if(!fReg.test($scope.currentFuturesFeerate.editFeerate.feerate_by_amt)) {
				$scope.currentFuturesFeerate.editFeerate.feerate_by_amt = "0";
			}
		}
		else {
			if(!fReg.test($scope.currentFuturesFeerate.editFeerate.feerate_by_qty)) {
				$scope.currentFuturesFeerate.editFeerate.feerate_by_qty = "0";
			}
		}
	}

	//确定导入
	$scope.futuresLoadFeerate = function() {
		var reqData = {body:{}};
        reqData.body.celltype = $scope.currentFuturesFeerate.celltype;
		reqData.body.cellid = $scope.currentFuturesFeerate.cellid;
		reqData.body.data = [];
		angular.forEach($scope.currentFuturesFeerate.feerateList,function(feerate) {
			var temp = {};
			temp.cellid = feerate.cellid;
			temp.celltype = feerate.celltype;
			temp.contractid = feerate.contractid;
			temp.offset_flag = feerate.offset_flag;
			temp.feerate_by_amt = feerate.feerate_by_amt;
			temp.feerate_by_qty = feerate.feerate_by_qty;
			reqData.body.data.push(temp);
		})
		tradeAccountService.loadFuturesFeerate(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				cms.message.success("导入成功.",5);
				$scope.currentFuturesFeerate.loadFileAble = false;
				$scope.getFuturesFeerate();
			}
			else {
				cms.message.error("导入失败."+res.msret.msg);
				cms.log("导入失败.",JSON.stringify(res.msret));
			}
		})
	}

	//取消导入
	$scope.futuresLoadFeerateCancel = function() {
		$scope.currentFuturesFeerate.loadFileAble = false;
		$scope.getFuturesFeerate();
	}

    //设置递延费率
    $scope.setFuturesDelayFeerate = function(obj) {
		$scope.currentDelayFeerate.tracid = obj.tracid;
        $scope.currentDelayFeerate.currentDate = new Date();
        $scope.currentDelayFeerate.loadFileAble = false;
		$scope.currentDelayFeerate.delayList = [];
		$scope.currentDelayFeerate.fee_index = -1;
		$scope.currentDelayFeerate.dir_index = -1;
		$scope.currentDelayFeerate.userClick = false;
		$scope.currentDelayFeerate.showtips = false;
		$scope.currentDelayFeerate.editDelay = {};
		$scope.getFuturesDelay();
        $scope.dialogModalInfo.state="setFuturesDelayFeerate";
        $scope.dialogModalInfo.path="../tradeAccountManage/futures-delay.html";
    }

    //获取递延费率
	$scope.getFuturesDelay = function() {
		$scope.currentDelayFeerate.delayList.splice(0,$scope.currentDelayFeerate.delayList.length);
        var dateStr = $scope.currentDelayFeerate.currentDate.getFullYear() * 10000 + ($scope.currentDelayFeerate.currentDate.getMonth() + 1) * 100 + $scope.currentDelayFeerate.currentDate.getDate();
		var reqData = {body:{trday:dateStr,tracid:$scope.currentDelayFeerate.tracid}};
		tradeAccountService.getFuturesDelay(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.currentDelayFeerate.delayList = res.body;
				angular.forEach($scope.currentDelayFeerate.delayList,function(delay) {
					delay.delayfee_rate = parseFloat(delay.delayfee_rate);
				});
				$scope.$apply();
			}
			else {
				cms.message.error("获取数据失败.");
				cms.log("获取数据失败.",JSON.stringify(res.msret));
			}
		})
	}

	//导入递延费率
	$scope.loadFuturesDelaySelectFile = function() {
		// document.getElementById("futures_delay_form").reset();
		// document.getElementById("futures_delay_file").click();
        tradeAccountService.importExcelFile(function(err,res) {
            if(err) return ;
            if(res.result == true) {
                $scope.analyseFuturesDelayLoadData(res.data);
                $scope.$apply();
            }
            else {
                cms.message.error("解析文件失败."+res.reason);
                cms.log("解析文件失败.",res.reason);
            }
        })
	}

	//解析导入的文件
	$scope.analyseFuturesDelayLoadData = function(data) {
		if(data.length < 2 ) {
			cms.message.error("选择的文件无数据，请重新选择.");
			return ;
		}
		var iReg = /^(0|([1-9][0-9]*))$/;
		var fReg = /^(0|([1-9][0-9]{0,3}))(\.[0-9]{1,3})?$/;
		var array = [];
        var dateStr = $scope.currentDelayFeerate.currentDate.getFullYear() * 10000 + ($scope.currentDelayFeerate.currentDate.getMonth() + 1) * 100 + $scope.currentDelayFeerate.currentDate.getDate();
		for(var i = 1; i < data.length ; i ++) {
			if(data[i].length < 5) {
				cms.message.error("第"+(i+1)+"行存在空数据，请修改后重试.");
				return ;
			}
			var temp = {};
			if(!iReg.test(data[i][0])) {
				cms.message.error("第"+(i+1)+"行合约ID错误，请修改后重试.");
				return ;
			}
			temp.contractid = data[i][0];
			temp.contractcode = data[i][1];
			temp.contractchname = data[i][2];
			if(!fReg.test(data[i][3])) {
				cms.message.error("第"+(i+1)+"行递延费率错误，请修改后重试.");
				return ;
			}
			temp.delayfee_rate = data[i][3];
			if(data[i][4] == "多付空") {
				temp.direction = "1";
			}
			else if(data[i][4] == "空付多") {
				temp.direction = "2";
			}
			else {
				cms.message.error("第"+(i+1)+"行仓位方向错误，请修改后重试.");
				return ;
			}
            temp.trday = dateStr;
			temp.tracid = $scope.currentDelayFeerate.tracid;
			array.push(temp);
		}
		$scope.currentDelayFeerate.delayList.splice(0,$scope.currentDelayFeerate.delayList.length);
		angular.forEach(array,function(delay) {
			$scope.currentDelayFeerate.delayList.push(delay)
		})
		$scope.currentDelayFeerate.loadFileAble = true;
	}

    //编辑递延费率取消编辑
	$scope.editFuturesDelayClickBody = function(e) {
		if($scope.currentDelayFeerate.userClick == true) {
			$scope.currentDelayFeerate.userClick = false;
			return ;
		}
		$scope.currentDelayFeerate.fee_index = -1;
		$scope.currentDelayFeerate.dir_index = -1;
		$scope.$apply();
		document.body.removeEventListener('click',$scope.editFuturesDelayClickBody,false);
		e.preventDefault();
	}

    //编辑递延费率
	$scope.editFuturesDelay = function(index,type) {
        $scope.currentDelayFeerate.editDelay.trday = $scope.currentDelayFeerate.delayList[index].trday;
        $scope.currentDelayFeerate.editDelay.tracid = $scope.currentDelayFeerate.delayList[index].tracid;
        $scope.currentDelayFeerate.editDelay.contractid = $scope.currentDelayFeerate.delayList[index].contractid;
		if(type == 1) {
			$scope.currentDelayFeerate.fee_index = index;
			$scope.currentDelayFeerate.dir_index = -1;
			$scope.currentDelayFeerate.editDelay.delayfee_rate = $scope.currentDelayFeerate.delayList[index].delayfee_rate;
		}
		else {
			$scope.currentDelayFeerate.fee_index = -1;
			$scope.currentDelayFeerate.dir_index = index;
            $scope.currentDelayFeerate.editDelay.direction = $scope.currentDelayFeerate.delayList[index].direction;
		}
		$scope.currentDelayFeerate.userClick = true;
		document.body.addEventListener('click',$scope.editFuturesDelayClickBody,false);
	}

    //阻止事件冒泡
    $scope.futuresStopEvent = function(event) {
        event.stopPropagation();
    }

    //判断递延费率输入--检测Esc,回车
	$scope.futuresDelayEditKeyup = function(event) {
		var fReg = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{1,3})?$/;
		if(event.keyCode == 27) {
			$scope.currentDelayFeerate.fee_index = index;
			document.body.addEventListener('click',$scope.editFuturesDelayClickBody,false);
		}
		if(event.keyCode == 13) {
			if(!fReg.test($scope.currentDelayFeerate.editDelay.delayfee_rate)){
				cms.message.error("请正确输入申报费");
				return ;
			}
			else {
				if($scope.currentDelayFeerate.loadFileAble == true) {
					$scope.currentDelayFeerate.delayList[$scope.currentDelayFeerate.fee_index].delayfee_rate = $scope.currentDelayFeerate.editDelay.delayfee_rate;
					$scope.currentDelayFeerate.fee_index = -1;
					document.body.addEventListener('click',$scope.editFuturesDelayClickBody,false);
				}
				else {
                    var reqData = {body:{
                        trday: $scope.currentDelayFeerate.editDelay.trday,
						tracid: $scope.currentDelayFeerate.editDelay.tracid,
						contractid: $scope.currentDelayFeerate.editDelay.contractid,
						delayfee_rate: $scope.currentDelayFeerate.editDelay.delayfee_rate
					}};
					tradeAccountService.updateFuturesDelay(reqData,function(res) {
						if(res.msret.msgcode == "00") {
							cms.message.success("修改成功.");
							$scope.currentDelayFeerate.delayList[$scope.currentDelayFeerate.fee_index].delayfee_rate = $scope.currentDelayFeerate.editDelay.delayfee_rate;
							$scope.currentDelayFeerate.fee_index = -1;
							document.body.addEventListener('click',$scope.editFuturesDelayClickBody,false);
							$scope.$apply();
						}
						else {
							cms.message.error("修改递延费率失败."+res.msret.msg);
							cms.log("修改递延费率失败.",JSON.stringify(res.msret));
						}
					})
				}
			}
		}
	}

	//编辑申报费获得输入
	$scope.futuresOrderEditInput = function() {
		var fReg = /^((0|([1-9][0-9]{0,13}))(\.[0-9]{0,17})?)?$/;
		if(!fReg.test($scope.currentDelayFeerate.editDelay.delayfee_rate)) {
			$scope.currentDelayFeerate.editDelay.delayfee_rate = "0";
		}
	}

    //改变仓位方向
    $scope.futuresDelayChange = function() {
        if($scope.currentDelayFeerate.loadFileAble == true) {
            $scope.currentDelayFeerate.delayList[$scope.currentDelayFeerate.dir_index].direction = $scope.currentDelayFeerate.editDelay.direction;
            $scope.currentDelayFeerate.dir_index = -1;
            document.body.addEventListener('click',$scope.editFuturesDelayClickBody,false);
        }
        else {
            var reqData = {body:{
                trday: $scope.currentDelayFeerate.editDelay.trday,
                tracid: $scope.currentDelayFeerate.editDelay.tracid,
                contractid: $scope.currentDelayFeerate.editDelay.contractid,
                direction: $scope.currentDelayFeerate.editDelay.direction
            }};
            tradeAccountService.updateFuturesDelay(reqData,function(res) {
                if(res.msret.msgcode == "00") {
                    cms.message.success("修改成功.");
                    $scope.currentDelayFeerate.delayList[$scope.currentDelayFeerate.dir_index].direction = $scope.currentDelayFeerate.editDelay.direction;
                    $scope.currentDelayFeerate.dir_index = -1;
                    document.body.addEventListener('click',$scope.editFuturesDelayClickBody,false);
                    $scope.$apply();
                }
                else {
                    cms.message.error("修改递延费率失败."+res.msret.msg);
                    cms.log("修改递延费率失败.",JSON.stringify(res.msret));
                }
            })
        }
    }

    //确定导入
	$scope.futuresLoadDelay = function() {
		var reqData = {body:{}};
        reqData.body.tracid = $scope.currentDelayFeerate.tracid;
        reqData.body.trday = $scope.currentDelayFeerate.currentDate.getFullYear() * 10000 + ($scope.currentDelayFeerate.currentDate.getMonth() + 1) * 100 + $scope.currentDelayFeerate.currentDate.getDate();
		reqData.body.data = [];
		angular.forEach($scope.currentDelayFeerate.delayList,function(delay) {
			var temp = {};
            temp.trday = delay.trday;
			temp.tracid = delay.tracid;
			temp.contractid = delay.contractid;
			temp.delayfee_rate = delay.delayfee_rate;
			temp.direction = delay.direction;
			reqData.body.data.push(temp);
		})
		tradeAccountService.loadFuturesDelay(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				cms.message.success("导入成功.",5);
				$scope.currentDelayFeerate.loadFileAble = false;
				$scope.getFuturesDelay();
			}
			else {
				cms.message.error("导入失败."+res.msret.msg);
				cms.log("导入失败.",JSON.stringify(res.msret));
			}
		})
	}

	//取消导入
	$scope.futuresLoadDelayCancel = function() {
		$scope.currentDelayFeerate.loadFileAble = false;
		$scope.getFuturesDelay();
	}

});
