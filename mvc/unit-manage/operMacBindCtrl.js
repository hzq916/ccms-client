angular.module('cmsController').controller('operMacBindCtrl',function($scope,$timeout,$rootScope,mainService,operMacBindService) {

	$scope.modalInfo = {};

	$scope.operMacBind_maidList=[];//资产管理人信息列表
	$scope.operMacBind_DataList=[];//操作员MAC绑定信息列表

	$scope.curClickedIndex=-1;
	$scope.curClickedItem = null;

	$scope.freezeMacBindInfo = {};   //当前禁用或启用的操作员MAC绑定信息
	$scope.addMacBindInfo = {};      //当前要新增的操作员MAC绑定信息
	$scope.changeMacBindInfo = {};   //修改当前操作员MAC绑定信息
	$scope.beforeChangeMacBindInfo = {};  //修改当前操作员MAC绑定信息之前的原始mac信息
	$scope.deleteMacBindInfo = {};   //删除当前操作员绑定

	$scope.showImportTips = false;

	$scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;

	$scope.operMacBindInit = function() {
		$scope.curClickedIndex=-1;

		$scope.searchContent = "";
		$scope.modalInfo.state = 0;                      //默认值，无定义
		$scope.modalInfo.stateEnum = {};
		$scope.modalInfo.path = "";
		$scope.modalInfo.stateEnum.addOperMacBind = 1;           //新建操作员MAC绑定
		$scope.modalInfo.stateEnum.freezeOperMacBind = 2;	      //禁用或启用
		$scope.modalInfo.stateEnum.changeOperMacBind = 3;         //修改操作员MAC绑定
		$scope.modalInfo.stateEnum.deleteOperMacBind = 4;         //删除操作员MAC绑定

		$scope.curClickedItem = null;

		$scope.getTamgrDataInfo();
	}

	//页面加载完毕
	$scope.$watch('$viewContentLoaded', function(){

		if(document.getElementById("operMacBind_import_open_file")) {
			document.getElementById("operMacBind_import_open_file").onchange = function() {
				var path = document.getElementById("operMacBind_import_open_file").value;
				var list = path.split(".");
				var fileType = list[list.length - 1].toUpperCase();
				if(fileType == "XLS" || fileType == "XLSX" || fileType == "CSV") {
					operMacBindService.parseExcelFile(document.getElementById("operMacBind_import_open_file"),function(res) {
						if(res.result == true) {
							if($scope.importDataCheck(res.data)){
								var importData=[];
								for(var i=1;i<res.data.length;i++){

									var dataCell=res.data[i];

									//去掉空行
									if(res.data[i].length==0) continue;

									importData.push(dataCell)

								}
								$scope.operMacBindImport(importData);
							}
						}
						else {
							cms.log(res.reason);
							cms.message.error("解析文件失败，请检查后重试.");
						}
					})
				}
				else {
					cms.message.error("当前仅支持.xls/.xlsx/.csv格式的文件");
				}
			}
		}

	});
	//页面关闭
	$scope.$on("$destroy", function() {

	});

	//表格行点击
	$scope.itemClicked = function(index) {
		if($scope.curClickedItem != null) {
			$scope.curClickedItem.active=false;
        	$scope.curClickedItem.edit_oid_flag=false;
			$scope.curClickedItem.edit_mac_flag=false;
			$scope.curClickedItem.edit_cellid_flag=false;
		}
		$scope.curClickedIndex=index;
	}

	//点击表头
	$scope.clickTableHeader = function(keyName,isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse,isNumber);
	}

	//打开弹框
	$scope.operMacBindShowModal = function(state) {
		$scope.modalInfo.state = state;
		switch (state) {
			case $scope.modalInfo.stateEnum.addOperMacBind:
				$scope.modalInfo.path = "../unit-manage/operMacBind_Add.html";
				break;
			case $scope.modalInfo.stateEnum.freezeOperMacBind:
				$scope.modalInfo.path = "../unit-manage/operMacBind_Freeze.html";
				break;
			case $scope.modalInfo.stateEnum.changeOperMacBind:
				$scope.modalInfo.path = "../unit-manage/operMacBind_change.html";
				break;
			case $scope.modalInfo.stateEnum.deleteOperMacBind:
				$scope.modalInfo.path = "../unit-manage/operMacBind_delete.html";
				break;
			default:
				break;
		}
	}

	//弹框加载完成
	$scope.operMacBindLoadModalReady = function() {
		switch ($scope.modalInfo.state) {
			case $scope.modalInfo.stateEnum.addOperMacBind:
				mainService.showModal("operMacBind_modal_back","operMacBind_Add_modal","operMacBind_Add_modal_title");
				break;
			case $scope.modalInfo.stateEnum.freezeOperMacBind:
				mainService.showModal("operMacBind_modal_back","operMacBind_freeze_modal","operMacBind_freeze_modal_title");
				break;
			case $scope.modalInfo.stateEnum.changeOperMacBind:
				mainService.showModal("operMacBind_modal_back","operMacBind_change_modal","operMacBind_change_modal_title");
				break;
			case $scope.modalInfo.stateEnum.deleteOperMacBind:
				mainService.showModal("operMacBind_modal_back","operMacBind_delete_modal","operMacBind_delete_modal_title");
				break;
			default:
				break;
		}
	}

	//关闭新建操作员MAC绑定对话框
	$scope.operMacBindAdd_HideModal = function() {
		mainService.hideModal("operMacBind_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}

	//关闭禁用或启用操作员MAC绑定信息对话框
	$scope.operMacBindFreeze_HideModal = function() {
		mainService.hideModal("operMacBind_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}

	//关闭修改操作员MAC信息弹窗
    $scope.operMacBindChange_HideModal = function() {
		mainService.hideModal("operMacBind_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}


	//关闭删除操作员MAC信息弹窗
    $scope.operMacBindDelete_HideModal = function() {
		mainService.hideModal("operMacBind_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}

	$scope.refreshOperMacBindDataTable = function() {

		$scope.filterContent="";
		$scope.curClickedIndex = -1;
		$scope.curClickedItem = null;
		$scope.getOperMacBindDataInfo($scope.selectedTamgr.maid);
	}

	//新建操作员
	$scope.showOperMacBind_AddDlg = function() {

		$scope.addMacBindInfo={};
		$scope.addMacBindInfo.add_maid=$scope.selectedTamgr.maid;
		$scope.addMacBindInfo.add_maidDisplayName=$scope.selectedTamgr.maname+"("+$scope.selectedTamgr.maid+")";
		$scope.addMacBindInfo.add_oid="";
		$scope.addMacBindInfo.add_mac="";
		$scope.addMacBindInfo.add_cellid="*";
		$scope.addMacBindInfo.add_ip="";

		$scope.operMacBindShowModal($scope.modalInfo.stateEnum.addOperMacBind);
	}

	//修改操作员终端绑定信息
    $scope.showOperMacBind_ChangeDlg = function(cell) {
		$scope.changeMacBindInfo={};
		$scope.beforeChangeMacBindInfo = {};
		$scope.changeMacBindInfo.add_maid=$scope.selectedTamgr.maid;
		$scope.changeMacBindInfo.add_maidDisplayName=$scope.selectedTamgr.maname+"("+$scope.selectedTamgr.maid+")";
		$scope.changeMacBindInfo.add_oid=cell.oid;
		$scope.changeMacBindInfo.add_mac=cell.mac;
		$scope.changeMacBindInfo.add_cellid=cell.cellid;
		$scope.changeMacBindInfo.add_ip=cell.ip; // 这里需要传递ip地址数据
		// 保存一份修改钱的原始数据
		$scope.beforeChangeMacBindInfo.add_maid=$scope.selectedTamgr.maid;
		$scope.beforeChangeMacBindInfo.add_maidDisplayName=$scope.selectedTamgr.maname+"("+$scope.selectedTamgr.maid+")";
		$scope.beforeChangeMacBindInfo.add_oid=cell.oid;
		$scope.beforeChangeMacBindInfo.add_mac=cell.mac;
		$scope.beforeChangeMacBindInfo.add_cellid=cell.cellid;
		$scope.beforeChangeMacBindInfo.add_ip=cell.ip;
		
		$scope.operMacBindShowModal($scope.modalInfo.stateEnum.changeOperMacBind);
	}

	//删除操作员终端绑定信息
	$scope.showOperMacBind_DeleteDlg = function(cell) {
		$scope.deleteMacBindInfo={};
		$scope.deleteMacBindInfo.deleteInfoOid = cell.oid;
		$scope.deleteMacBindInfo.deleteInfoIP = cell.ip;
		$scope.deleteMacBindInfo.deleteInfoMac = cell.mac;
		$scope.deleteMacBindInfo.deleteInfoMaid = $scope.selectedTamgr.maid;
		
		$scope.operMacBindShowModal($scope.modalInfo.stateEnum.deleteOperMacBind);
	}



	$scope.operMacShowTips = function(state) {
		$scope.showImportTips = state;
	}

	//显示禁用/启用操作员MAC绑定确认界面
	$scope.showOperMacBind_FreezeDlg = function(dataCell) {
		cms.deepCopy(dataCell,$scope.freezeMacBindInfo);//拷贝对象值到$scope.freezeMacBindInfo
		$scope.freezeMacBindInfo.dlgTitle = dataCell.stat == '1' ? "禁用操作员MAC绑定" : "启用操作员MAC绑定";
		$scope.freezeMacBindInfo.tips = dataCell.stat == '1' ? "你确定要禁用编号为"+dataCell.oid+"操作员MAC绑定信息吗?" : "你确定要启用编号为"+dataCell.oid+"操作员MAC绑定信息吗？";

		$scope.operMacBindShowModal($scope.modalInfo.stateEnum.freezeOperMacBind);
	}


	//显示修改操作员信息界面
	$scope.showAltOperInfoDlg = function(index) {
		var dataCell = $scope.operMacBind_DataList[index];
		cms.deepCopy(dataCell,$scope.altOperInfo);//拷贝对象值到$scope.altOperInfo
		$scope.altOperInfo.maidDisplayName=$scope.altOperInfo.maname+"("+$scope.altOperInfo.maid+")"

		$scope.operMacBindShowModal($scope.modalInfo.stateEnum.altOper);
	}

	//获取资产管理人信息
	$scope.getTamgrDataInfo = function() {

		var requestData={body:{}};
		operMacBindService.getTamgrData(requestData,function(retData) {
			if(retData.msret.msgcode=='00'){

				var tmpData=retData.body;

				var maidList=[]
				for(var i=0;i<tmpData.length;i++){

					var dataCell ={};
					dataCell=tmpData[i];
					dataCell.displayName=dataCell.maname+"("+dataCell.maid+")"
					maidList.push(dataCell);
				}
				$scope.operMacBind_maidList=maidList;
				$scope.$apply();

				if($scope.operMacBind_maidList.length>0){
					$scope.selectedTamgr=$scope.operMacBind_maidList[0];//初始化maid组合选择框值(选择第一个)

					//获取第一个资产管理人下的操作员MAC绑定信息
					$scope.getOperMacBindDataInfo($scope.operMacBind_maidList[0].maid);
				}
			}
			else{
				//console.log("获取资产管理人数据出错",retData.msret.msgcode,retData.msret.msg);//提示信息
				cms.message.error("获取资产管理人数据出错."+retData.msret.msg);
			}
		})
	}

	//获取操作员信息
	$scope.getOperMacBindDataInfo = function(maid) {

		var requestData={body:{"maid":maid}};

		operMacBindService.getOperMacBindData(requestData,function(retData) {

			if(retData.msret.msgcode=='00'){
				var tmpData=retData.body;

				if(tmpData.length<=0){
					cms.message.error("查询没有符合条件的数据.");
				}

				var operMacBindList=[]
				for(var i=0;i<tmpData.length;i++){
					var dataCell ={};
					dataCell=tmpData[i];
					if(!tmpData[i].oname){
						dataCell.oname='-';
					}
					dataCell.idx=i+1;

					dataCell.active=false;
					dataCell.edit_oid_flag=false;
					dataCell.edit_mac_flag=false;
					dataCell.edit_cellid_flag=false;
					dataCell.mac_edit_value = dataCell.mac;
					dataCell.oid_edit_value = dataCell.oid;
					dataCell.cellid_edit_value = dataCell.cellid;
					dataCell.ip_edit_value = dataCell.ip;

					dataCell.show=true;//默认此行数据显示
					operMacBindList.push(dataCell);
				}
				$scope.operMacBind_DataList=operMacBindList;
				$scope.$apply();
			}
			else{
				$scope.operMacBind_DataList.splice(0,$scope.operMacBind_DataList.length);
				$scope.$apply();
				cms.message.error("获取操作员MAC绑定数据出错."+retData.msret.msg);
			}
		})
	}

	//资产管理人选择发生变化时,加载当前选择的资产管理人下的操作员信息
	$scope.operMacBind_tamgrChanged = function(){

		$scope.getOperMacBindDataInfo($scope.selectedTamgr.maid);
	}

	//发送冻结操作员MAC绑定信息指令
	$scope.operMacBindFreezeConfirm = function(){
		var cur_stat=$scope.freezeMacBindInfo.stat==1?'0':'1';
		var requestData={body:{"oid":$scope.freezeMacBindInfo.oid,"mac":$scope.freezeMacBindInfo.mac,"org_mac":$scope.freezeMacBindInfo.mac,
	                          "org_oid":$scope.freezeMacBindInfo.oid,"cellid":$scope.freezeMacBindInfo.cellid,"stat":cur_stat}};

		operMacBindService.freezeOperMacBind(requestData,function(retData) {

			if(retData.msret.msgcode=='00'){
				cms.message.success("操作成功.");

				$scope.operMacBindAdd_HideModal();//关闭对话框
				$scope.refreshOperMacBindDataTable();
			}
			else{
				cms.message.error("操作出错."+retData.msret.msg);
			}
		})
	}

	//发送修改操作员MAC绑定信息指令
	$scope.operMacBindAltConfirm = function(dataCell,property){

		var tmpItemData = {};
		cms.deepCopy(dataCell,tmpItemData);
		var requestData={};
		if(property =='oid'){
			if(tmpItemData.oid_edit_value.length < 5 || tmpItemData.oid_edit_value.substring(0,tmpItemData.oid_edit_value.length - 4) != $scope.selectedTamgr.maid) {
				cms.message.error("操作员必须属于当前资产管理人.")
				return;
			}
			requestData={body:{"oid":tmpItemData.oid_edit_value,"mac":tmpItemData.mac,"org_mac":tmpItemData.mac,
	                          "org_oid":tmpItemData.oid,"cellid":tmpItemData.cellid,"stat":tmpItemData.stat}};
		}else if(property =='mac'){
			if(!cms.checkMacValid(tmpItemData.mac_edit_value)) {
				cms.message.error("mac地址有误.")
				return;
			}
			requestData={body:{"oid":tmpItemData.oid,"mac":tmpItemData.mac_edit_value,"org_mac":tmpItemData.mac,
	                          "org_oid":tmpItemData.oid,"cellid":tmpItemData.cellid,"stat":tmpItemData.stat}};
		}else if(property =='cellid'){
			requestData={body:{"oid":tmpItemData.oid,"mac":tmpItemData.mac,"org_mac":tmpItemData.mac,
	                          "org_oid":tmpItemData.oid,"cellid":tmpItemData.cellid_edit_value,"stat":tmpItemData.stat}};
		}else{
			return;
		}
		operMacBindService.altOperMacBind(requestData,function(retData) {

			if(retData.msret.msgcode=='00'){
				cms.message.success("操作成功.");
			}
			else{
				cms.message.error("操作出错."+retData.msret.msg);
			}

			$scope.refreshOperMacBindDataTable();
		})
	}

	//添加操作员确认
	$scope.operMacBindAddConfirm = function() {

		if ($scope.addMacBindInfo.add_oid==""){
			cms.message.error("操作员不可以为空.");
			return;
		}

		if($scope.addMacBindInfo.add_mac=="" && $scope.addMacBindInfo.add_ip==""){
			cms.message.error("MAC地址和IP地址不可以同时为空.");
			return;
		}

		if( $scope.addMacBindInfo.add_mac!="" && !cms.checkMacValid($scope.addMacBindInfo.add_mac)){
			cms.message.error("MAC地址有误,请检查后再试.");
			return;
		}

		if ($scope.addMacBindInfo.add_ip != "" && !cms.checkIpValid($scope.addMacBindInfo.add_ip)) {
			cms.message.error("IP地址有误,请检查后再试.");
			return;
		}

		var single_add_flag='1';//单个手动添加
		var data_list=[];

		var tmp_oid=parseInt($scope.addMacBindInfo.add_maid)*10000+parseInt($scope.addMacBindInfo.add_oid);//581001
		var dataCell={"oid":tmp_oid,"mac":$scope.addMacBindInfo.add_mac,"cellid":$scope.addMacBindInfo.add_cellid, "ip": $scope.addMacBindInfo.add_ip};
		data_list.push(dataCell);

		var requestData={body:{"single_add":single_add_flag,"data_list":data_list, maid: $scope.addMacBindInfo.add_maid}};
		operMacBindService.AddNewOperMacBind(requestData,function(retData) {

			// console.log("AddNewOperMacBind>>>>>>>>>>>>",JSON.stringify(retData));
			if(retData.msret.msgcode=='00'){

				//console.log("新增操作员成功");//提示信息
				cms.message.success("新增操作员MAC终端绑定信息成功.");

				$scope.operMacBindAdd_HideModal();//关闭对话框
				$scope.refreshOperMacBindDataTable();//刷新界面
			}
			else{
				//console.log("新增操作员失败",retData.msret.msgcode,retData.msret.msg);//提示信息
				cms.message.error("新增操作员MAC终端绑定信息失败."+retData.msret.msg);
			}
		})
	}

	//导入操作员MAC绑定信息
	$scope.operMacBindImport = function(data) {
		var single_add_flag='0';//单个手动添加
		var data_list=[];

		for(var i=0;i<data.length;i++){
			var cellData={};
			cellData.oid=data[i][0];
			cellData.mac=data[i][1] ? data[i][1] : "";
			cellData.ip=data[i][2] ? data[i][2]: "";
			cellData.cellid = "*";

			data_list.push(cellData);
		}

		var requestData={body:{"single_add":single_add_flag,"data_list":data_list, "maid": $scope.selectedTamgr.maid}};
		operMacBindService.AddNewOperMacBind(requestData,function(retData) {

			console.log(requestData);

			console.log("AddNewOperMacBind>>>>>>>>>>>>",JSON.stringify(retData));
			if(retData.msret.msgcode=='00'){

				//console.log("新增操作员成功");//提示信息
				cms.message.success("导入操作员MAC终端绑定信息成功.");

				$scope.operMacBindAdd_HideModal();//关闭对话框
				$scope.refreshOperMacBindDataTable();//刷新界面
			}
			else{
				//console.log("新增操作员失败",retData.msret.msgcode,retData.msret.msg);//提示信息
				cms.message.error("导入操作员MAC终端绑定信息失败."+retData.msret.msg);
			}
		})
	}

	//过滤显示操作员信息表
	$scope.operMacBindFilter = function() {

		angular.forEach($scope.operMacBind_DataList,function(cellObj) {
			if(cellObj.oid.toString().match($scope.filterContent) || cellObj.oname.toString().match($scope.filterContent)){
				cellObj.show=true;
			}
			else{
				cellObj.show=false;
			}
		});
	}

	//点击导入
	$scope.importOperMacBindDataClick = function() {
		// document.getElementById("operMacBind_import_open_file_form").reset();
		// document.getElementById("operMacBind_import_open_file").click();
		operMacBindService.importExcelFile(function(err,res) {
			if(err) return ;
			if(res.result == true) {
				if($scope.importDataCheck(res.data)){
					var importData=[];
					for(var i=1;i<res.data.length;i++){

						var dataCell=res.data[i];

						//去掉空行
						if(res.data[i].length==0) continue;

						importData.push(dataCell)

					}
					$scope.operMacBindImport(importData);
				}
			}
			else {
				cms.log(res.reason);
				cms.message.error("解析文件失败，请检查后重试.");
			}
		})
	}

	//检查导入数据的正确性
	$scope.importDataCheck = function(data){

		if(data.length <= 1) {
			cms.message.error("选择的文件无数据，请确认后重试.")
			return false;
		}
		else {

			//第一行为表头，从第2行读起
			for(var i = 1; i < data.length; i ++) {
				if(data[i].length==0){
					continue;//空行跳过
				}

				if(!data[i][0] || (!data[i][1] && !data[i][2])){
					cms.message.error("导入表格数据中，第"+i+"行有数据为空的项,请检查后再试.");
					return false;
				}
				if(data[i][1] && !cms.checkMacValid(data[i][1])){
					cms.message.error("导入表格数据中，第"+i+"行有MAC地址有误,请检查后再试.");
					return false;
				}
				if (data[i][2] && !cms.checkIpValid(data[i][2])){
					cms.message.error("导入表格数据中,第"+i+"行有IP地址有误,请检查后再试.");
					return false;
				}

				if(parseInt(data[i][0]/10000) != parseInt($scope.selectedTamgr.maid)){
					cms.message.error("导入表格数据中，第"+i+"行，导入的操作员ID与当前选择的资产管理人不一致,请检查后再试.");
					return false;
				}
			}
		}

		return true;
	}

	//导出操作员MAC终端绑定信息表数据
	$scope.exportOperMacBindDataClick = function(){

		if($scope.operMacBind_DataList.length<=0){
			cms.message.error("表中没有可导出的数据");
			return;
		}

		var exportData = {};
		var headers = ["操作员编号","MAC地址","IP地址"];
		exportData.headers = headers;
		exportData.fileType = "xlsx";
		exportData.fileName = "资产管理人"+$scope.selectedTamgr.displayName+"-操作员终端绑定信息导出";
		exportData.data = [];

		angular.forEach($scope.operMacBind_DataList,function(dataCell) {
			var tempCell = [];
			tempCell.push(dataCell.oid);
			tempCell.push(dataCell.mac);
			tempCell.push(dataCell.ip);

			exportData.data.push(tempCell);
		})

		operMacBindService.exportDataToExcelFile(exportData,function(err,res) {
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


	//点击表格中可编辑oid单元格
	$scope.clickOidItem=function (dataCell,index,clickEvent) {
		if($rootScope.menuRight.indexOf(2001006004) == -1) {
			clickEvent.stopPropagation();
			return ;
		}
		cms.addClassToTableHead(clickEvent,'common_activeTH');
		clickEvent.stopPropagation();

		if($scope.curClickedItem != null) {
			$scope.curClickedItem.active=false;
        	$scope.curClickedItem.edit_oid_flag=false;
			$scope.curClickedItem.edit_mac_flag=false;
			$scope.curClickedItem.edit_cellid_flag=false;
		}

		$scope.curClickedIndex=index;

		//设置新选中可编辑单元格的状态
        dataCell.active=true;
        dataCell.edit_oid_flag=true;
		dataCell.edit_mac_flag=false;
		dataCell.edit_cellid_flag=false;

		$scope.curClickedItem = dataCell;
	}

	//点击表格中可编辑mac单元格
	$scope.clickMacItem=function (dataCell,index,clickEvent) {
		if($rootScope.menuRight.indexOf(2001006004) == -1) {
			clickEvent.stopPropagation();
			return ;
		}
		cms.addClassToTableHead(clickEvent,'common_activeTH');
		clickEvent.stopPropagation();

		if($scope.curClickedItem != null) {
			$scope.curClickedItem.active=false;
        	$scope.curClickedItem.edit_oid_flag=false;
			$scope.curClickedItem.edit_mac_flag=false;
			$scope.curClickedItem.edit_cellid_flag=false;
		}
		$scope.curClickedIndex=index;

		//设置新选中可编辑单元格的状态
        dataCell.active=true;
        dataCell.edit_oid_flag=false;
		dataCell.edit_mac_flag=true;
		dataCell.edit_cellid_flag=false;

		$scope.curClickedItem = dataCell;
	}

	//点击表格中可编辑cellid单元格
	$scope.clickCellidItem=function (dataCell,index,clickEvent) {
		cms.addClassToTableHead(clickEvent,'common_activeTH');
		clickEvent.stopPropagation();

		if($scope.curClickedItem != null) {
			$scope.curClickedItem.active=false;
			$scope.curClickedItem.edit_oid_flag=false;
			$scope.curClickedItem.edit_mac_flag=false;
			$scope.curClickedItem.edit_cellid_flag=false;
		}
		$scope.curClickedIndex=index;

		//设置新选中可编辑单元格的状态
        dataCell.active=true;
        dataCell.edit_oid_flag=false;
		dataCell.edit_mac_flag=false;
		dataCell.edit_cellid_flag=true;

		$scope.curClickedItem = dataCell;
	}

	//取消表格编辑
	$scope.cancelEdit=function (dataCell, property) {
		dataCell[property+"_edit_value"] = dataCell[property];
		dataCell.active = false;
        dataCell.edit_oid_flag=false;
		dataCell.edit_mac_flag=false;
		dataCell.edit_cellid_flag=false;
	}

	//输入框中按键监听
	$scope.inputPress=function (keyevent,dataCell,property) {

        // if (keyevent.keyCode === 13) { //回车,提交修改
        //     $scope.modifyItemValue(dataCell, property);
        // } else if (keyevent.keyCode === 27) {  //escape,取消编辑
        //     $scope.cancelEdit(dataCell, property);
        // }
	}

	//提交修改
	$scope.modifyItemValue=function(dataCell, property ) {
		if(dataCell[property+"_edit_value"]==""){
			cms.message.error("修改的值不能为空");
			//$scope.cancelEdit(index, property);
            return ;
		}

        if (dataCell[property] == dataCell[property+"_edit_value"]) {
			$scope.cancelEdit(dataCell, property);
            return ;//值没有改变,先恢复到非编辑状态再返回
        }

        $scope.operMacBindAltConfirm(dataCell,property);
	}
	
	// 提交终端MAC信息修改
	$scope.subscribOperMacBind = function() {
		console.log('提交修改的请求');
		if ($scope.changeMacBindInfo.add_oid=="") {
			cms.message.error("操作员编号不能为空.");
			return;
		}

		if( $scope.changeMacBindInfo.add_mac=="" && $scope.changeMacBindInfo.add_ip==""){
			cms.message.error("MAC地址和IP不能同时为空.");
			return;
		}

		if($scope.changeMacBindInfo.add_mac !="" && !cms.checkMacValid($scope.changeMacBindInfo.add_mac)){
			cms.message.error("MAC地址有误,请检查后再试.");
			return;
		}
		if ($scope.changeMacBindInfo.add_ip != "" && !cms.checkIpValid($scope.changeMacBindInfo.add_ip)) {
			cms.message.error("IP地址有误,请检查再试.");
			return;
		}
		var single_add_flag='1';//单个手动添加

		var requestData={
			body:{
			"single_add":single_add_flag,
			"oid":$scope.changeMacBindInfo.add_oid,
			"mac":$scope.changeMacBindInfo.add_mac,
			"cellid":$scope.changeMacBindInfo.add_cellid, 
			"ip": $scope.changeMacBindInfo.add_ip,
			"org_ip": $scope.beforeChangeMacBindInfo.add_ip,
			"org_mac": $scope.beforeChangeMacBindInfo.add_mac,
			"org_oid": $scope.beforeChangeMacBindInfo.add_oid,
			"maid": $scope.beforeChangeMacBindInfo.add_maid
		}};
		operMacBindService.altOperMacBind(requestData,function(retData) {

			// console.log("altOperMacBind>>>>>>>>>>>>",JSON.stringify(retData));
			if(retData.msret.msgcode=='00'){

				cms.message.success("修改操作员终端绑定信息成功.");

				$scope.operMacBindChange_HideModal();//关闭对话框
				$scope.refreshOperMacBindDataTable();//刷新界面
			}
			else{
				cms.message.error("修改操作员终端绑定信息失败."+retData.msret.msg);
			}
		})
		
	}

	//确认删除MAC绑定
	$scope.confirmDelete = function() {
		console.log('确认删除配置');

		var requestData={
			body:{
			"oid":$scope.deleteMacBindInfo.deleteInfoOid,
			"mac":$scope.deleteMacBindInfo.deleteInfoMac,
			"ip": $scope.deleteMacBindInfo.deleteInfoIP,
			"maid": $scope.deleteMacBindInfo.deleteInfoMaid
		}};
		operMacBindService.DeleteOperMacBind(requestData,function(retData) {

			// console.log("DeleteOperMacBind>>>>>>>>>>>>",JSON.stringify(retData));
			if(retData.msret.msgcode=='00'){

				cms.message.success("删除操作员MAC终端绑定信息成功.");

				$scope.operMacBindDelete_HideModal();//关闭对话框
				$scope.refreshOperMacBindDataTable();//刷新界面
			}
			else{
				cms.message.error("删除操作员MAC终端绑定信息失败."+retData.msret.msg);
			}
		})
	}

});
