angular.module('cmsController').controller('xrxdManageCtrl',function($scope,$timeout,mainService,xrxdManageService) {

	$scope.modalInfo = {};
	$scope.xrxdManage_yearList=[];//年份选择列表
	$scope.xrxdManage_xrxdList=[];//除权除息信息列表
	$scope.xrxd_baseVol_selList=[10]

	$scope.curClickedIndex=-1;

	$scope.xrxdInfo = {};  //当前添加或修改XrXd的信息

	$scope.selType = 1;//默认选中"未过期查询"

	$scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;

	//点击表头
	$scope.clickTableHeader = function(keyName,isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse,isNumber);
	}

	$scope.xrxdManageInit = function() {
		$scope.curClickedIndex=-1;

		$scope.searchContent = "";
		$scope.modalInfo.state = 0;                      //默认值，无定义
		$scope.modalInfo.stateEnum = {};
		$scope.modalInfo.path = "";
		$scope.modalInfo.stateEnum.addXrxd = 1;		      //添加除权除息
		$scope.modalInfo.stateEnum.altXrxd = 2;		      //修改除权除息
		$scope.modalInfo.stateEnum.delXrxd = 3;		      //删除除权除息

		var curYear = (new Date()).getFullYear();//获取当前年份
		var preYear = curYear-1;//上一年份

		$scope.xrxdManage_yearList.push(curYear.toString());
		$scope.xrxdManage_yearList.push(preYear.toString());
		$scope.xrxdManage_yearList.push(preYear.toString()+'-'+curYear.toString());

		$scope.selectedYear=$scope.xrxdManage_yearList[0];//初始化year组合选择框值(选择第一个)
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

	//点击查询类型单选按钮 type: 1-未过期查询 0-历史查询
	$scope.xrxdRadioBtnClick = function(type) {
		switch (type) {
			case 0:
				if($scope.selType == 0) {
					return ;
				}
				$scope.selType = 0;
				break;
			case 1:
				if($scope.selType == 1) {
					return ;
				}
				$scope.selType = 1;
				break;
			default:
				break;
		}
	}

	//打开弹框
	$scope.xrxdManageShowModal = function(state) {
		$scope.modalInfo.state = state;
		switch (state) {
			case $scope.modalInfo.stateEnum.addXrxd:
			case $scope.modalInfo.stateEnum.altXrxd:
				$scope.modalInfo.path = "../system-manage/xrxdManage_Add.html";
				break;
			case $scope.modalInfo.stateEnum.delXrxd:
				$scope.modalInfo.path = "../system-manage/xrxdManage_Del.html";
				break;
			default:
				break;
		}
	}

	//弹框加载完成
	$scope.xrxdManageLoadModalReady = function() {
		switch ($scope.modalInfo.state) {
			case $scope.modalInfo.stateEnum.addXrxd:
			case $scope.modalInfo.stateEnum.altXrxd:
				mainService.showModal("xrxdManage_modal_back","xrxdManage_Add_modal","xrxdManage_Add_modal_title");
				break;
			case $scope.modalInfo.stateEnum.delXrxd:
				mainService.showModal("xrxdManage_modal_back","xrxdManage_Del_modal","xrxdManage_Del_modal_title");
				break;
			default:
				break;
		}
	}

	//显示新建xrxd界面
	$scope.showAddXrxdDlg = function() {

		$scope.xrxdInfo = {}; //对像置空
		$scope.xrxdInfo.base_vol=$scope.xrxd_baseVol_selList[0];
		$scope.xrxdInfo.date=new Date();
		$scope.xrxdInfo.dlg_title="新增分红方案";
		$scope.xrxdInfo.operateType='add';

		$scope.xrxdManageShowModal($scope.modalInfo.stateEnum.addXrxd);
	}

	//显示修改xrxd界面
	$scope.showAltXrxdDlg = function(cellData) {

		$scope.xrxdInfo=cms.deepCopy(cellData);

		if($scope.xrxdInfo.if_his==1){
			return;//历史数据不能修改和删除
		}

		$scope.xrxdInfo.base_vol=$scope.xrxd_baseVol_selList[0];
		$scope.xrxdInfo.dlg_title="修改分红方案";
		$scope.xrxdInfo.operateType='alt';

		$scope.xrxdInfo.record_day_old=cellData.record_day;
		//将20170808格式转换成2017/08/08格式
		var dateStr=($scope.xrxdInfo.record_day.toString()).substr(0,4)+"/"+($scope.xrxdInfo.record_day.toString()).substr(4,2)+"/"+($scope.xrxdInfo.record_day.toString()).substr(6,2);

		//转换为日期格式
		$scope.xrxdInfo.date = new Date(dateStr);

		$scope.xrxdManageShowModal($scope.modalInfo.stateEnum.altXrxd);
	}

	//显示删除xrxd界面
	$scope.showDelXrxdDlg = function(cellData) {

		$scope.xrxdInfo=cms.deepCopy(cellData);

		if($scope.xrxdInfo.if_his==1){
			return;//历史数据不能修改和删除
		}
		$scope.xrxdInfo.operateType='del';

		$scope.xrxdManageShowModal($scope.modalInfo.stateEnum.delXrxd);
	}

	//关闭新增/修改/删除xrxd信息对话框
	$scope.xrxdManage_HideModal = function() {
		mainService.hideModal("xrxdManage_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}

	$scope.refreshXrxdDataTable = function() {

		$scope.filterContent="";
		$scope.getXrxdDataInfo();
	}


	//获取操作员信息
	$scope.getXrxdDataInfo = function() {

		var if_his = $scope.selType==0?'1':'0';

		var curYear = (new Date()).getFullYear();//获取当前年份
		var preYear = curYear-1;//上一年份

		//year_flag:当if_his为1时，year_flag必须传入(0-查当前年份，1-查去年数据，2-查今年和去年的数据)
		var year_flag= $scope.selectedYear==curYear ?'0':($scope.selectedYear==preYear ?'1':'2');

		var requestData={body:{"if_his":if_his,"year_flag":year_flag}};

		xrxdManageService.getXrxdData(requestData,function(retData) {

			if(retData.msret.msgcode=='00'){
				var tmpData=retData.body;

				var xrxdDataList=[]
				for(var i=0;i<tmpData.length;i++){
					var dataCell ={};
					dataCell=tmpData[i];
					dataCell.idx=i+1;
					dataCell.show=true;//默认此行数据显示
					xrxdDataList.push(dataCell);
				}
				$scope.xrxdManage_xrxdList=xrxdDataList;
				$scope.$apply();
			}
			else{
				$scope.xrxdManage_xrxdList.splice(0,$scope.xrxdManage_xrxdList.length);
				$scope.$apply();
				//console.log("获取除权除息数据出错",retData.msret.msgcode,retData.msret.msg);//提示信息
				cms.message.error("获取除权除息数据出错."+retData.msret.msg);
			}
		})
	}

	//年份选择发生变化时,加载当前选择年份的除权除息数据
	$scope.xrxdManage_yearChanged = function(){
		$scope.getXrxdDataInfo();
	}

	//操作确认
	$scope.xrxdManageOperatorConfirm = function(operateType){

		if(operateType=='add'){
			$scope.xrxdManageAddConfirm();
		}
		else if(operateType=='alt'){
			$scope.xrxdManageAltConfirm();
		}
	}

	//添加XrXd确认
	$scope.xrxdManageAddConfirm = function() {
		if($scope.xrxdInfo.marketcode=="" || $scope.xrxdInfo.base_vol=="" || $scope.xrxdInfo.xr_vol=="" || $scope.xrxdInfo.xd_amt==""){
			cms.message.error("所有选项不能为空.");
			return;
		}

		var add_date = cms.formatDate_ex($scope.xrxdInfo.date);
		var requestData={body:{"record_day":add_date,"marketcode":$scope.xrxdInfo.marketcode,"base_vol":$scope.xrxdInfo.base_vol,
		                       "xr_vol":$scope.xrxdInfo.xr_vol, "xd_amt":$scope.xrxdInfo.xd_amt}};
		xrxdManageService.AddNewXrxd(requestData,function(retData) {
			if(retData.msret.msgcode=='00'){

				//console.log("创建除权除息数据成功");//提示信息
				cms.message.success("创建除权除息数据成功.");

				$scope.xrxdManage_HideModal();//关闭对话框
				$scope.refreshXrxdDataTable();//刷新界面
			}
			else{
				//console.log("创建除权除息数据失败",retData.msret.msgcode,retData.msret.msg);//提示信息
				cms.message.error("创建除权除息数据失败."+retData.msret.msg);
			}
		})
	}

	//创建xrxd数据信息确认
	$scope.xrxdManageAltConfirm = function() {

		if($scope.xrxdInfo.base_vol=="" || $scope.xrxdInfo.xr_vol=="" || $scope.xrxdInfo.xd_amt==""){

			console.log("xrxdManageAltConfirm>>>>>>",JSON.stringify($scope.xrxdInfo));//提示信息
			cms.message.error("所有选项不能为空.");
			return;
		}

		var add_date = cms.formatDate_ex($scope.xrxdInfo.date);
		var requestData={body:{"record_day":add_date,"ukcode":$scope.xrxdInfo.ukcode,"base_vol":$scope.xrxdInfo.base_vol,
		                       "xr_vol":$scope.xrxdInfo.xr_vol, "xd_amt":$scope.xrxdInfo.xd_amt,"record_day_old":$scope.xrxdInfo.record_day_old}};

		console.log("xrxdManageAltConfirm>>>>>>>>>>>>requestData:",JSON.stringify(requestData))
		xrxdManageService.updateXrxdInfo(requestData,function(retData) {
			console.log("updateXrxdInfo>>>>>>>>>>>>",JSON.stringify(retData));
			if(retData.msret.msgcode=='00'){

				cms.message.success("修改除权除息数据成功.");

				$scope.xrxdManage_HideModal();//关闭对话框
				$scope.refreshXrxdDataTable();//刷新界面
			}
			else{
				cms.message.error("修改除权除息数据失败."+retData.msret.msg);
			}
		})
	}

	//删除xrxd数据信息确认
	$scope.xrxdManageDelConfirm = function() {
		var requestData={body:{"record_day":$scope.xrxdInfo.record_day,"ukcode":$scope.xrxdInfo.ukcode}};

		console.log("xrxdManageDelConfirm>>>>>>>>>>>>requestData:",JSON.stringify(requestData))
		xrxdManageService.delXrxdInfo(requestData,function(retData) {
			console.log("delXrxdInfo>>>>>>>>>>>>",JSON.stringify(retData));
			if(retData.msret.msgcode=='00'){

				cms.message.success("删除分红方案数据成功.");

				$scope.xrxdManage_HideModal();//关闭对话框
				$scope.refreshXrxdDataTable();//刷新界面
			}
			else{
				cms.message.error("删除分红方案数据失败."+retData.msret.msg);
			}
		})
	}

	//根据市场代码查询对应的证券名称,现在只针对股票查询
    $scope.selSecuritiesName = function(marketcode){
			if(marketcode.length>=5 && marketcode.length<=6){

				var requestData={body:{"marketcode":marketcode,"majortype":'1'}};
				xrxdManageService.SelUkeyInfo(requestData,function(retData) {

				console.log("SelUkeyInfo>>>>>>>>>>>>",JSON.stringify(retData));
				if(retData.msret.msgcode=='00'){
					var tmpData=retData.body;
					if(tmpData.length>0){
						$scope.xrxdInfo.chabbr = typeof(tmpData[0].chabbr)==undefined?'':tmpData[0].chabbr;
					}
					else{
						$scope.xrxdInfo.chabbr="";
					}
				}
				else{
					$scope.xrxdInfo.chabbr="";
				}
				$scope.$apply();
			})
		}
		else{
			$scope.xrxdInfo.chabbr="";
		}
	}

	//过滤显示除权除息信息表
	$scope.xrxdManageFilter = function() {

		angular.forEach($scope.xrxdManage_xrxdList,function(cellObj) {
			if(cellObj.marketcode.toString().match($scope.filterContent)
				|| cellObj.chabbr.toString().match($scope.filterContent)
				|| cellObj.record_day.toString().match($scope.filterContent)){
				cellObj.show=true;
			}
			else{
				cellObj.show=false;
			}
		});
	}
});
