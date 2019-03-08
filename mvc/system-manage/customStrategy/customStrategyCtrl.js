angular.module('cmsController').controller('customStrategyCtrl',
function($scope,customStrategyService,mainService) {

    $scope.currentTrIndex=-1;
    $scope.currentAuthTrIndex=-1;
    $scope.selectedVersionMD5={};

    $scope.allCustomStrategyData = [];

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
        combinationCaName: "请选择产品"
    };

    $scope.modalStrategy = {
        trid:"0000",
        combinationTrName: "请选择组合"
    };

    $scope.modalInfo={path:"", state:""};
    $scope.searchFeild="";

    $scope.keyName = "";
	$scope.reverse = false;
    $scope.sortFunction = null;
    

    $scope.searchKeyWorlds = ""; //搜索框关键字
    $scope.selectedProductAll =[]; //外边的产品
    $scope.selectedSttrategyAll = []; //外边的组合
    $scope.selectedProduct = "0000"; //外边下拉产品
    $scope.selectedSttrategy = "0000"; //外边下拉组合

    $scope.allcustomStrategyPage = 1; //总页数
    $scope.currentcustomStrategyPagePage = 1; //当前页
    $scope.pagesize = 20;


    $scope.addModalAllProduct = []; //新增弹框中的产品
    $scope.addModalAllStrategy = []; //新增弹框中的组合

    $scope.changeModalAllProduct = []; //修改弹框中的产品
    $scope.changeModalAllStrategy = []; //修改弹框中的组合


    $scope.oldStgName = ""; //原始的策略名称
    $scope.oldType = ""; //原始类型
    $scope.oldOid = ""; //原始oid









    //页面加载完毕
    $scope.$watch('$viewContentLoaded', function(){
        $scope.getSelectProduct();
        $scope.getSelectStrategy();
        $scope.getCustomStrategy();
    });

    //点击表头
	$scope.clickTableHeader = function(keyName,isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse,isNumber);
    }

    $scope.changOutSideProduct = function(){
        $scope.getSelectStrategy();
        // $scope.getCustomStrategy();
    }

    $scope.changOutSideStrategy=function(){
        $scope.getCustomStrategy();
    }

    $scope.searchCustomStrategy = function(){
        $scope.getCustomStrategy();
    }
    

    //获取外边的产品下拉列表
    $scope.getSelectProduct = function() {
        var requestData={body:{}};
        customStrategyService.getSelectProduct(requestData,function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取产品失败."+res.msret.msg);
                return;
            }
            $scope.selectedProductAll = res.body;
            angular.forEach($scope.selectedProductAll,function(item) {
                item.combinationCaName = item.caname+"("+item.caid+")";
            })
            $scope.selectedProductAll.unshift($scope.modalProduct);
            $scope.selectedProduct = "0000";
            console.log($scope.selectedProductAll);
            $scope.$apply();
            $scope.getCustomStrategy();
        });
    };
    //获取外边组合的下拉列表
    $scope.getSelectStrategy = function() {
        if ($scope.selectedProduct != "0000") {
            var requestData = {body:{caid: $scope.selectedProduct}};
        } else {
            var requestData = {body:{}};
        }
        customStrategyService.getSelectStrategy(requestData,function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取产品失败."+res.msret.msg);
                return;
            }
            $scope.selectedSttrategyAll = res.body;
            angular.forEach($scope.selectedSttrategyAll,function(item) {
                item.combinationTrName = item.trname+"("+item.trid+")";
            })
            if ($scope.selectedProduct != "0000") {
                console.log("产品不为000");
                $scope.selectedSttrategy = $scope.selectedSttrategyAll[0]["trid"];
                console.log($scope.selectedSttrategy);
            } else {
                $scope.selectedSttrategyAll.unshift($scope.modalStrategy);
                $scope.selectedSttrategy = "0000";
            }
            console.log($scope.selectedSttrategyAll);
            $scope.$apply();
            $scope.getCustomStrategy();
        });
    }
    //获取自定义策略
    $scope.getCustomStrategy=function() {
        var requestData={body:{pageSize:$scope.pagesize,pageNum: $scope.currentcustomStrategyPagePage}};
        console.log("____________________");
        console.log($scope.selectedProduct);
        console.log($scope.selectedSttrategy);
        if ($scope.selectedProduct != "0000") {
            //表示查询所有
            requestData.body.caid = $scope.selectedProduct;
            console.log("选中了产品");
        }
        if ($scope.selectedSttrategy != "0000") {
            console.log("选中了组合");
            requestData.body.trid = $scope.selectedSttrategy;
        }
        if ($scope.searchKeyWorlds != "") {
            requestData.body.searchInfo = $scope.searchKeyWorlds;
        } 
       
        customStrategyService.getCustomStrategy(requestData,function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取自定义策略失败."+res.msret.msg);
                return;
            }

            console.log(res.body);
            $scope.allCustomStrategyData = res.body.data;
            $scope.allcustomStrategyPage = Math.ceil(parseInt(res.body.totalCount)/parseInt($scope.pagesize)); //总条数
            console.log($scope.allcustomStrategyPage);
           for(var i = 0; i<$scope.allCustomStrategyData.length; i++) {
            if ($scope.allCustomStrategyData[i]["stgtype"] === "1") {
                //1代表仿真 0代表实盘 2代表回测
                $scope.allCustomStrategyData[i]["stgtype"] = "仿真";
            } else if ($scope.allCustomStrategyData[i]["stgtype"] === "0") {
                $scope.allCustomStrategyData[i]["stgtype"] = "实盘";
            } else {
                $scope.allCustomStrategyData[i]["stgtype"] = "回测";
            }
           }
            $scope.$apply();
        });
    }

    //新增自定义策略
    $scope.clickAddCustomStrategy=function() {
        $scope.addCustomStrategy={
            "type":"0",
            "name":"",
            "mark":"",
            "operatorId":"",
            "product":"",
            "strategy":""
        };
        console.log("创建自定义策略");
        $scope.getAddModalProductData();
        $scope.modalInfo.state = "addCustomStrategy";
        $scope.modalInfo.path = "../system-manage/customStrategy/addCustomStrategy.html";
    }

    //类型改变
    $scope.addModalStgTypeChange=function(){
        $scope.getAddModalProductData();
    }

    //监听产品变化
    $scope.addModalProductChange=function(){
        $scope.getAddModalStrategyData();
    }

    //获取新增弹框中的产品
    $scope.getAddModalProductData=function(){
        if ($scope.addCustomStrategy.type === "0") {
            var requestData={body:{captype: 1}};
        } else {
            var requestData={body:{captype: 0}};
        }
        customStrategyService.getSelectProduct(requestData,function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取产品失败."+res.msret.msg);
                return;
            }
            $scope.addModalAllProduct = res.body;
            if ($scope.addModalAllProduct.length>0){
                $scope.addCustomStrategy.product = $scope.addModalAllProduct[0]["caid"];
            }
            console.log($scope.addModalAllProduct);
            $scope.$apply();
            $scope.getAddModalStrategyData();
        });
    }

    //获取新增弹框中的组合
    $scope.getAddModalStrategyData=function(){
        if($scope.addCustomStrategy.product){
            var requestData = {body:{caid:$scope.addCustomStrategy.product}};
        } else {
            var requestData = {body:{}};
        }
        customStrategyService.getSelectStrategy(requestData,function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取产品失败."+res.msret.msg);
                return;
            }
            $scope.addModalAllStrategy=res.body;
            if ($scope.addModalAllStrategy.length>0){
                $scope.addCustomStrategy.strategy = $scope.addModalAllStrategy[0]["trid"];
            }
            $scope.$apply();
        });
    }

    //确定新增自定义策略
    $scope.confirmAddCustomStrategy = function(){
        console.log("确定新增自定义策略");
        if ($scope.addCustomStrategy.type === ""){
            cms.message.error("策略类型不可以为空，请完善数据.");
            return;
        } else if ( $scope.addCustomStrategy.name === ""){
            cms.message.error("策略名称不可以为空，请完善数据.");
            return;
        } else if ($scope.addCustomStrategy.mark === "") {
            cms.message.error("路由标识不可以为空，请完善数据.");
            return;
        } else if ($scope.addCustomStrategy.operatorId === ""){
            cms.message.error("操作员ID不可以为空，请完善数据.");
            return;
        } else if ($scope.addCustomStrategy.product=== ""){
            cms.message.error("产品不可以为空，请完善数据.");
            return;
        } else if ($scope.addCustomStrategy.strategy=== "") {
            cms.message.error("组合不可以为空，请完善数据.");
            return;
        } else {
            //
        }
        var requestData = {body:{
            oid: $scope.addCustomStrategy.operatorId,
            stname: $scope.addCustomStrategy.name,
            stgtype: $scope.addCustomStrategy.type,
            trid: $scope.addCustomStrategy.strategy,
            caid: $scope.addCustomStrategy.product,
            route: $scope.addCustomStrategy.mark
        }};
        customStrategyService.createCustomStrategy(requestData,function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("添加自定义策略失败."+res.msret.msg);
                return;
            }
            cms.message.success("添加自定义策略成功.");
            $scope.$apply();
            $scope.getCustomStrategy();
            $scope.hidecustomStrategyModal();
        });
    };

     //修改自定义策略
     $scope.clickchangeCustomStrategy=function(tempData) {
         console.log("++++++++++++++++++++++++");
         console.log(tempData);
         console.log("--------------------------");
        $scope.changeCustomStrategy={
            "type":tempData.stgtype,
            "name":tempData.stgname,
            "mark":tempData.route,
            "operatorId":tempData.traderid,
            "product":tempData.caid,
            "strategy":tempData.trid,
            "ssid":tempData.ssid,
            "stgid":tempData.stgid
        };
        if (tempData.stgtype==="实盘"){
            $scope.changeCustomStrategy.type = "0"
        } else if (tempData.stgtype==="仿真") {
            $scope.changeCustomStrategy.type = "1"
        } else {
            $scope.changeCustomStrategy.type = "2"
        }
        $scope.oldStgName = tempData.stgname; //保留下原始名称
        $scope.oldType = $scope.changeCustomStrategy.type; //保留原始类型
        $scope.oldOid = $scope.changeCustomStrategy.operatorId; //保留原始的操作员id
        $scope.getChangeModalProductData(1);
        $scope.getChangeModalStrategyData();
        console.log($scope.changeCustomStrategy);
        $scope.modalInfo.state = "changeCustomStrategy";
        $scope.modalInfo.path = "../system-manage/customStrategy/changeCustomStrategy.html";
    }

        //类型改变
        $scope.changeModalStgTypeChange=function(){
            $scope.getChangeModalProductData(2);
        }
    
        //监听产品变化
        $scope.changeModalProductChange=function(){
            $scope.getChangeModalStrategyData();
        }
    
        //获取修改弹框中的产品
        $scope.getChangeModalProductData=function(id){
            if ($scope.changeCustomStrategy.type === "0") {
                var requestData={body:{captype: 1}};
            } else {
                var requestData={body:{captype: 0}};
            }

            
            customStrategyService.getSelectProduct(requestData,function(res) {
                if(res.msret.msgcode != '00') {
                    cms.message.error("获取产品失败."+res.msret.msg);
                    return;
                }
                $scope.changeModalAllProduct = res.body;
                if (id === 2 && $scope.changeModalAllProduct.length>0){
                    $scope.changeCustomStrategy.product = $scope.changeModalAllProduct[0]["caid"];
                }
                console.log($scope.changeModalAllProduct);
                $scope.$apply();
                $scope.getChangeModalStrategyData();
            });
        }
    
        //获取修改弹框中的组合
        $scope.getChangeModalStrategyData=function(){
            if($scope.changeCustomStrategy.product){
                var requestData = {body:{caid:$scope.changeCustomStrategy.product}};
            } else {
                var requestData = {body:{}};
            }
            customStrategyService.getSelectStrategy(requestData,function(res) {
                if(res.msret.msgcode != '00') {
                    cms.message.error("获取产品失败."+res.msret.msg);
                    return;
                }
                $scope.changeModalAllStrategy=res.body;
                console.log($scope.changeModalAllStrategy);
                if ($scope.changeModalAllStrategy.length>0){
                    $scope.changeCustomStrategy.strategy = $scope.changeModalAllStrategy[0]["trid"];
                }
                $scope.$apply();
            });
        }
    //确定修改自定义策略
    $scope.confirmChangeCustomStrategy = function(){
        console.log("确定修改自定义策略");
        if ($scope.changeCustomStrategy.type === ""){
            cms.message.error("策略类型不可以为空，请完善数据.");
            return;
        } else if ( $scope.changeCustomStrategy.name === ""){
            cms.message.error("策略名称不可以为空，请完善数据.");
            return;
        } else if ($scope.changeCustomStrategy.mark === "") {
            cms.message.error("路由标识不可以为空，请完善数据.");
            return;
        } else if ($scope.changeCustomStrategy.operatorId === ""){
            cms.message.error("操作员ID不可以为空，请完善数据.");
            return;
        } else if ($scope.changeCustomStrategy.product=== ""){
            cms.message.error("产品不可以为空，请完善数据.");
            return;
        } else if ($scope.changeCustomStrategy.strategy=== "") {
            cms.message.error("组合不可以为空，请完善数据.");
            return;
        } else {
            //
        }
        var requestData = {body:{
            oid: $scope.changeCustomStrategy.operatorId,
            stgname: $scope.changeCustomStrategy.name,
            stgtype: $scope.changeCustomStrategy.type,
            trid: $scope.changeCustomStrategy.strategy,
            caid: $scope.changeCustomStrategy.product,
            route: $scope.changeCustomStrategy.mark,
            ssid: $scope.changeCustomStrategy.ssid,
            stgid:$scope.changeCustomStrategy.stgid,
            old_stgname:$scope.oldStgName,
            old_oid:$scope.oldOid,
            old_stgtype:$scope.oldType
        }};
        customStrategyService.editCustomStrategy(requestData,function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("修改自定义策略失败."+res.msret.msg);
                return;
            }
            cms.message.success("修改自定义策略成功.");
            $scope.$apply();
            $scope.getCustomStrategy();
            $scope.hidecustomStrategyModal();
        });
    };

     //修改启动脚本
     $scope.clickchangeScript=function(tempData) {
         console.log(tempData);
         var requestData = {body:{
             ssid:tempData["ssid"],
             type:0
         }}
         $scope.changeScriptData = {
             ssid:tempData["ssid"],
             type:0
        };
        customStrategyService.getCustomScript(requestData,function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取开启脚本失败."+res.msret.msg);
                return;
            }
            if(res.body){
                $scope.changeScriptArr = res.body;
            }else {
                $scope.changeScriptArr = {"path":"",
                "script_name":"",
                "script_param":"",
                "ssid":"",
                "type":""
            }
            }
            
            cms.message.success("获取开启脚本成功.");
            console.log("获取启动脚本");
            console.log(res);
            if ($scope.changeScriptArr) {
                $scope.changeScriptData.path = $scope.changeScriptArr["path"];
                $scope.changeScriptData.name = $scope.changeScriptArr["script_name"];
                $scope.changeScriptData.params = $scope.changeScriptArr["script_param"];
            }
            $scope.$apply();
        });
        $scope.modalInfo.state = "changeScript";
        $scope.modalInfo.path = "../system-manage/customStrategy/changeScript.html";
    }

    //确定修改启动脚本
    $scope.confirmChangeScript = function(){
        console.log("确定修改启动脚本");
        console.log($scope.changeScriptData);
        if($scope.changeScriptData.path === "") {
            cms.message.error("启动脚本路径不可以为空.");
            return;
        }
         if ($scope.changeScriptData.name === ""){
            cms.message.error("启动脚本名称不可以为空.");
            return;
        } 
        var requestData ={body:{
            ssid:$scope.changeScriptData["ssid"],
            path:$scope.changeScriptData.path,
            script_name:$scope.changeScriptData.name,
            script_param:$scope.changeScriptData.params,
            type: 0
        }}
        customStrategyService.altCustomScript(requestData,function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("修改开启脚本失败."+res.msret.msg);
                return;
            }
            cms.message.success("修改开启脚本成功.");
            $scope.$apply();
            $scope.getCustomStrategy();
            $scope.hidecustomStrategyModal();
        });
    }

     //修改关闭脚本
     $scope.clickstopScript=function(tempData) {
        console.log(tempData);
        var requestData = {body:{
            ssid:tempData["ssid"],
            type:1
        }}
        $scope.stopScriptData = {
            ssid:tempData["ssid"],
            type:tempData["stgtype"]
       };
       customStrategyService.getCustomScript(requestData,function(res) {
           if(res.msret.msgcode != '00') {
               cms.message.error("获取关闭脚本失败."+res.msret.msg);
               return;
           }
           if(res.body){
            $scope.stopScriptArr = res.body;
            }else {
                $scope.stopScriptArr = {"path":"",
                "script_name":"",
                "script_param":"",
                "ssid":"",
                "type":""
            }
            }
           cms.message.success("获取关闭脚本成功.");
           console.log("获取关闭脚本");
           console.log(res);
           if ($scope.stopScriptArr) {
               $scope.stopScriptData.path = $scope.stopScriptArr["path"];
               $scope.stopScriptData.name = $scope.stopScriptArr["script_name"];
               $scope.stopScriptData.params = $scope.stopScriptArr["script_param"];
           }
           $scope.$apply();
       });
        $scope.modalInfo.state = "stopScript";
        $scope.modalInfo.path = "../system-manage/customStrategy/stopScript.html";
    }

    //确定编辑关闭脚本
    $scope.confirmStopScript = function(){
        console.log("确定编辑关闭脚本");
        console.log($scope.stopScriptData);
        if($scope.stopScriptData.path === "") {
            cms.message.error("关闭脚本路径不可以为空.");
            return;
        } else if ($scope.stopScriptData.name === ""){
            cms.message.error("关闭脚本名称不可以为空.");
            return;
        } else {
            //
        }
        var requestData ={body:{
            ssid:$scope.stopScriptData["ssid"],
            path:$scope.stopScriptData.path,
            script_name:$scope.stopScriptData.name,
            script_param:$scope.stopScriptData.params,
            type:1
        }}
        customStrategyService.altCustomScript(requestData,function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("修改关闭脚本失败."+res.msret.msg);
                return;
            }
            cms.message.success("修改关闭脚本成功.");
            $scope.$apply();
            $scope.getCustomStrategy();
            $scope.hidecustomStrategyModal();
        });
    }

    //隐藏弹框
    $scope.hidecustomStrategyModal=function() {
        $scope.modalInfo={path:"", state:""};
        mainService.hideModal("customStrategy_modal_back");
    }

    	//导出自定义策略数据
	$scope.exportCustomStrategyData = function(){

		if($scope.allCustomStrategyData.length<=0){
			cms.message.error("表中没有可导出的数据");
			return;
		}
		var exportData = {};
		var headers = ["策略服务ID","策略ID","策略名称","路由标识","操作员ID","策略类型","产品","组合ID","组合名称"];
		exportData.headers = headers;
		exportData.fileType = "xlsx";
		exportData.fileName = "自定义策略列表";
		exportData.data = [];

		angular.forEach($scope.allCustomStrategyData,function(dataCell) {
			var tempCell = [];
			tempCell.push(dataCell.ssid);
				tempCell.push(dataCell.stgid);
				tempCell.push(dataCell.stgname);
				tempCell.push(dataCell.route);
				tempCell.push(dataCell.traderid);
				tempCell.push(dataCell.stgtype);
				tempCell.push(dataCell.caname);
                tempCell.push(dataCell.trid);
                tempCell.push(dataCell.trname);

				exportData.data.push(tempCell);
		})

		customStrategyService.exportDataToExcelFile(exportData,function(err,res) {
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



    $scope.getCustomStrategyData = function(page) {
        console.log(page);
        var requestData={body:{pageSize:$scope.pagesize,pageNum: page}};
        console.log("____________________");
        console.log($scope.selectedProduct);
        console.log($scope.selectedSttrategy);
        if ($scope.selectedProduct != "0000") {
            //表示查询所有
            requestData.body.caid = $scope.selectedProduct;
            console.log("选中了产品");
        }
        if ($scope.selectedSttrategy != "0000") {
            console.log("选中了组合");
            requestData.body.trid = $scope.selectedSttrategy;
        }
        if ($scope.searchKeyWorlds != "") {
            requestData.body.searchInfo = $scope.searchKeyWorlds;
        } 
       
        customStrategyService.getCustomStrategy(requestData,function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取自定义策略失败."+res.msret.msg);
                return;
            }

            console.log(res.body);
            $scope.allCustomStrategyData = res.body.data;
            $scope.allcustomStrategyPage = Math.ceil(parseInt(res.body.totalCount)/parseInt($scope.pagesize)); //总条数
            console.log($scope.allcustomStrategyPage);
           for(var i = 0; i<$scope.allCustomStrategyData.length; i++) {
            if ($scope.allCustomStrategyData[i]["stgtype"] === "1") {
                //1代表仿真 0代表实盘 2代表回测
                $scope.allCustomStrategyData[i]["stgtype"] = "仿真";
            } else if ($scope.allCustomStrategyData[i]["stgtype"] === "0") {
                $scope.allCustomStrategyData[i]["stgtype"] = "实盘";
            } else {
                $scope.allCustomStrategyData[i]["stgtype"] = "回测";
            }
           }
            $scope.$apply();
        });
    }


    $scope.customStrategyLoadModalReady=function() {
        if ($scope.modalInfo.state === "addCustomStrategy") {
            console.log("显示新增自定义策略");
            mainService.showModal("customStrategy_modal_back","addCustomStrategy_modal_back_add_modal","addCustomStrategy_modal_back_add_modal_title");
        } else if ($scope.modalInfo.state === "changeCustomStrategy") {
            mainService.showModal("customStrategy_modal_back","changeCustomStrategy_add_modal","changeCustomStrategy_add_modal_title");
        } else if ($scope.modalInfo.state === "changeScript") {
            mainService.showModal("customStrategy_modal_back","changeScript_del_modal","changeScript_del_modal_title");
        } else if ($scope.modalInfo.state === "stopScript") {
            mainService.showModal("customStrategy_modal_back","stopScript_auth_modal","stopScript_auth_modal_title");
        }
    }


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
