angular.module('cmsController').controller('brokerManageCtrl',function($scope,$timeout,mainService,brokerManageService) {

	$scope.modalInfo = {};
	$scope.brokerDataList=[];//经纪商信息列表

	$scope.curClickedIndex = -1;

	$scope.addBrokerInfo = {};   //当前要添加的经纪商信息
	$scope.delBrokerInfo = {};   //当前要删除的经纪商信息
	$scope.altBrokerInfo = {};  //当前修改的经纪商的信息

	$scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;


	$scope.brokerManageInit = function() {
		$scope.searchContent = "";
		$scope.modalInfo.state = 0;                      //默认值，无定义
		$scope.modalInfo.stateEnum = {};
		$scope.modalInfo.path = "";
		$scope.modalInfo.stateEnum.addBroker = 1;           //新建经纪商
		$scope.modalInfo.stateEnum.altBroker = 2;		    //修改
		$scope.modalInfo.stateEnum.delBroker = 3;	        //删除

		$scope.getBrokerDataInfo();
	}

	//页面加载完毕
	$scope.$watch('$viewContentLoaded', function(){

	});
	//页面关闭
	$scope.$on("$destroy", function() {

	});

	//表格行点击
	$scope.itemClicked = function(index) {
		$scope.curClickedIndex = index;
	}
	//点击表头
	$scope.clickTableHeader = function(keyName,isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse,isNumber);
	}

	//打开弹框
	$scope.brokerManageShowModal = function(state) {
		$scope.modalInfo.state = state;
		switch (state) {
			case $scope.modalInfo.stateEnum.addBroker:
				$scope.modalInfo.path = "../system-manage/brokerManage_Add.html";
				break;
			case $scope.modalInfo.stateEnum.altBroker:
				$scope.modalInfo.path = "../system-manage/brokerManage_Alt.html";

				break;
			case $scope.modalInfo.stateEnum.delBroker:
				$scope.modalInfo.path = "../system-manage/brokerManage_Del.html";
				break;
			default:
				break;
		}
	}

	//弹框加载完成
	$scope.brokerManageLoadModalReady = function() {
		switch ($scope.modalInfo.state) {
			case $scope.modalInfo.stateEnum.addBroker:
				mainService.showModal("brokerManage_modal_back","brokerManage_Add_modal","brokerManage_Add_modal_title");
				break;
			case $scope.modalInfo.stateEnum.altBroker:
				document.getElementById("edit_clear_begintime").value=$scope.altBrokerInfo.clear_begintime;
				document.getElementById("edit_clear_endtime").value=$scope.altBrokerInfo.clear_endtime;
				mainService.showModal("brokerManage_modal_back","brokerManage_Alt_modal","brokerManage_Alt_modal_title");
				break;
			case $scope.modalInfo.stateEnum.delBroker:
				mainService.showModal("brokerManage_modal_back","brokerManage_Del_modal","brokerManage_Del_modal_title");
				break;
			default:
				break;
		}
	}

	//关闭新建经纪商信息对话框
	$scope.brokerManageAdd_HideModal = function() {
		mainService.hideModal("brokerManage_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}

	//关闭删除经纪商信息对话框
	$scope.brokerManageDel_HideModal = function() {
		mainService.hideModal("brokerManage_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}

	//关闭修改经纪商信息对话框
	$scope.brokerManageAlt_HideModal = function() {
		mainService.hideModal("brokerManage_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}

	//刷新界面
	$scope.refreshBrokerDataTable = function() {

		$scope.filterContent="";
		$scope.getBrokerDataInfo();
	}

	//显示添加经纪商界面
	$scope.showAddBrokerDlg = function() {

		$scope.addBrokerInfo.add_bid="";
		$scope.addBrokerInfo.add_bname="";
		$scope.addBrokerInfo.add_blname="";
		$scope.addBrokerInfo.add_clear_begintime=new Date("1970-01-01T07:30:00.000Z");
		$scope.addBrokerInfo.add_clear_endtime=new Date("1970-01-01T00:00:00.000Z");

		$scope.brokerManageShowModal($scope.modalInfo.stateEnum.addBroker);
	}

	//显示删除经纪商确认界面
	$scope.showDelBrokerDlg = function(dataCell) {

		cms.deepCopy(dataCell,$scope.delBrokerInfo);//拷贝对象值到$scope.delBrokerInfo
		$scope.delBrokerInfo.modalTitle = "删除经纪商";
		$scope.delBrokerInfo.tips ="你确定要删除编号为"+dataCell.bid+"的经纪商吗?" ;

		$scope.brokerManageShowModal($scope.modalInfo.stateEnum.delBroker);
	}

	//显示修改经纪商信息界面
	$scope.showAltBrokerDlg = function(dataCell) {
		cms.deepCopy(dataCell,$scope.altBrokerInfo);//拷贝对象值到$scope.altBrokerInfo
		$scope.brokerManageShowModal($scope.modalInfo.stateEnum.altBroker);
	}

	//获取经纪商信息
	$scope.getBrokerDataInfo = function() {

		var requestData={body:{}};

		brokerManageService.getBrokerData(requestData,function(retData) {
			if(retData.msret.msgcode=='00'){
				var tmpData=retData.body;

				var tmpDataList=[]
				for(var i=0;i<tmpData.length;i++){
					var dataCell ={};
					dataCell=tmpData[i];
					dataCell.idx=i+1;
					dataCell.show=true;//默认此行数据显示

					tmpDataList.push(dataCell);
				}
				$scope.brokerDataList=tmpDataList;
				$scope.$apply();
			}
			else{
				$scope.brokerDataList.splice(0,$scope.brokerDataList.length);
				$scope.$apply();
				//console.log("getBrokerData>>>>>>",retData.msret.msgcode,retData.msret.msg);//提示信息
				cms.message.error("获取经纪商数据出错."+retData.msret.msg);
			}
		})
	}

	//删除经纪商确认
	$scope.brokerDelConfirm = function(){
		var requestData={body:{"bid":$scope.delBrokerInfo.bid}};
		console.log("brokerDelConfirm>>>>>>>>>>>>requestData:",JSON.stringify(requestData));

		brokerManageService.delBrokerData(requestData,function(retData) {
			console.log("delBrokerData>>>>>>>>>>>>",JSON.stringify(retData));

			if(retData.msret.msgcode=='00'){
				cms.message.success("删除经纪商成功.");

				$scope.brokerManageAdd_HideModal();//关闭对话框
				$scope.refreshBrokerDataTable();
			}
			else{
				cms.message.error("删除经纪商出错."+retData.msret.msg);
			}
		})
	}

	//添加经纪商确认
	$scope.brokerAddConfirm = function() {

		//console.log("brokerAddConfirm>>>>>>>>>>>>>>>",$scope.add_bid,$scope.add_bname,$scope.add_blname);
		if($scope.addBrokerInfo.add_bid=="" || $scope.addBrokerInfo.add_bname==""){

			//console.log("brokerAddConfirm>>>>>>必填选项不能为空.....");//提示信息
			cms.message.error("必填选项不能为空.");
			return;
		}

		var clear_begintime=cms.formatTime($scope.addBrokerInfo.add_clear_begintime);
		var clear_endtime=cms.formatTime($scope.addBrokerInfo.add_clear_endtime);

		var timeReg=/^((2[0-3])|([0-1]\d)|\d)((:([0-5]\d)){2})$/;
		if (!timeReg.test(clear_begintime) || !timeReg.test(clear_endtime)) {
			cms.message.error("交易时间不正确.");
			return;
		}
		var requestData={body:{"bid":$scope.addBrokerInfo.add_bid,"bname":$scope.addBrokerInfo.add_bname,"blname":$scope.addBrokerInfo.add_blname,
			clear_begintime:clear_begintime, clear_endtime:clear_endtime}};
		brokerManageService.AddNewBroker(requestData,function(retData) {

			console.log("AddNewBroker>>>>>>>>>>>>",JSON.stringify(retData));
			if(retData.msret.msgcode=='00'){

				cms.message.success("添加经纪商成功.");
				$scope.$emit("changedBrokers","changedBrokers");
				$scope.brokerManageAdd_HideModal();//关闭对话框
				$scope.refreshBrokerDataTable();//刷新界面
			}
			else{
				//console.log("brokerAddConfirm>>>>>>>>>>>>",retData.msret.msgcode,retData.msret.msg);//提示信息
				cms.message.error("添加经纪商失败."+retData.msret.msg);
			}
		})
	}

	//修改经纪商信息确认
	$scope.brokerAltConfirm = function() {
		if($scope.altBrokerInfo.bid=="" || $scope.altBrokerInfo.bname=="" ){

			//console.log("brokerAltConfirm>>>>>>必填选项不能为空.....");//提示信息
			cms.message.error("必填选项不能为空.");
			return;
		}

		var clear_begintime=document.getElementById("edit_clear_begintime").value;
		var clear_endtime=document.getElementById("edit_clear_endtime").value;


		var timeReg=/^((2[0-3])|([0-1]\d)|\d)((:([0-5]\d)|(0\d)|\d){2})$/;
		if (!timeReg.test(clear_begintime) || !timeReg.test(clear_endtime)) {
			cms.message.error("交易时间不正确.");
			return;
		}

		var requestData={body:{"bid":$scope.altBrokerInfo.bid,"bname":$scope.altBrokerInfo.bname, "blname":$scope.altBrokerInfo.blname,
			clear_begintime:clear_begintime, clear_endtime:clear_endtime}};
		brokerManageService.updateBrokerInfo(requestData,function(retData) {

			console.log("updateBrokerInfo>>>>>>>>>>>>",JSON.stringify(retData));
			if(retData.msret.msgcode=='00'){

				//console.log("修改经纪商信息成功");//提示信息
				cms.message.success("修改经纪商信息成功.");

				$scope.brokerManageAlt_HideModal();//关闭对话框
				$scope.refreshBrokerDataTable();//刷新界面
			}
			else{
				//console.log("修改经纪商信息失败",retData.msret.msgcode,retData.msret.msg);//提示信息
				cms.message.error("修改经纪商信息失败."+retData.msret.msg);
			}
		})
	}
});
