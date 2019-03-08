angular.module('cmsController').controller('calendarCtrl',function($scope,mainService,calendarService) {
	$scope.loadCalendarList = [];
	$scope.calendarList = [];
	$scope.loadAble = false;
	$scope.currentCalendar = {};
	$scope.modalInfo = {};
	$scope.currentYear = "";
	$scope.currentTrday = "";
	$scope.yearList = [];
	$scope.currentPage = 1;
	$scope.showPage = 1;
	$scope.totalPage = 1;
	$scope.pageCount = 30;
	$scope.modalInfo = {};
	$scope.currentMarket = {};
	$scope.marketList = [];

	$scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;

	$scope.currentCalendarEdit = null;

	$scope.calendarInit = function() {
		$scope.loadAble = false;
		var date = new Date();
		$scope.currentTrday = String(date.getFullYear()*10000 + (date.getMonth() +1)*100 + date.getDate())
		$scope.currentYear = String(date.getFullYear());
		$scope.yearList.push({year:String(date.getFullYear() - 1)});
		$scope.yearList.push({year:String(date.getFullYear())});
		$scope.yearList.push({year:String(date.getFullYear() + 1)});
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
		$scope.modalInfo.stateEnum = {};
		$scope.modalInfo.stateEnum.edit = 1;
		$scope.modalInfo.stateEnum.selectMarket = 2;
		calendarService.getMarket({body:{}},function(res) {
			if(res.msret.msgcode == "00") {
				$scope.marketList = res.body;
				if(res.body.length > 0) {
					$scope.currentMarket = res.body[0];
				}
				$scope.$apply();
			}
			else {
				cms.message.error("获取市场失败.");
				cms.log("获取失败失败.",res.msret.msgcode,res.msret.msg);
			}
		})
	}

	//点击表头
	$scope.clickTableHeader = function(keyName,isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse,isNumber);
	}

	//点击查询
	$scope.calendarGetData = function() {
		$scope.calendarGetPageData($scope.currentYear,1,$scope.pageCount,$scope.currentMarket.marketid);
	}

	//获取分页数据
	$scope.calendarGetPageData = function(year,page,pageCount,marketid) {
		var reqData = {body:{
			year:year,
			page:page,
			pageCount:pageCount
		}};
		if(typeof marketid != "undefined" && marketid != "") {
			reqData.body.marketid = marketid;
		}
		calendarService.getCalendar(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.calendarList = res.body.data;
				angular.forEach($scope.calendarList,function(calendar) {
					switch (calendar.dayofweek) {
						case 0:
							calendar.showDayofweek = "日";
							break;
						case 1:
							calendar.showDayofweek = "一";
							break;
						case 2:
							calendar.showDayofweek = "二";
							break;
						case 3:
							calendar.showDayofweek = "三";
							break;
						case 4:
							calendar.showDayofweek = "四";
							break;
						case 5:
							calendar.showDayofweek = "五";
							break;
						case 6:
							calendar.showDayofweek = "六";
							break;
						case "0":
							calendar.showDayofweek = "日";
							break;
						case "1":
							calendar.showDayofweek = "一";
							break;
						case "2":
							calendar.showDayofweek = "二";
							break;
						case "3":
							calendar.showDayofweek = "三";
							break;
						case "4":
							calendar.showDayofweek = "四";
							break;
						case "5":
							calendar.showDayofweek = "五";
							break;
						case "6":
							calendar.showDayofweek = "六";
							break;
						default:
							break;
					}
				})
				$scope.currentPage = res.body.page;
				$scope.showPage = res.body.page;
				$scope.totalPage = Math.ceil(res.body.totalCount / pageCount);
				$scope.totalPage = $scope.totalPage == 0 ? 1 : $scope.totalPage;
				$scope.$apply();
			}
			else {
				$scope.calendarList.splice(0,$scope.calendarList.length);
				$scope.$apply();
				cms.message.error("查询日历失败.");
				cms.log("查询日历失败.",res.msret.msgcode,res.msret.msg);
			}
		})
	}

	//跳转到首页
	$scope.calendarLoopFirst = function() {
		if($scope.showPage == 1) {
			return ;
		}
		else {
			if($scope.loadAble == true) {
				$scope.calendarGetPageLocalData(1);
				return ;
			}
			else {
				$scope.calendarGetPageData($scope.currentYear,1,$scope.pageCount,$scope.currentMarket.marketid);
			}
		}
	}

	//上一页
	$scope.calendarLoopPre = function() {
		if($scope.showPage == 1) {
			return ;
		}
		else {
			if($scope.loadAble == true) {
				$scope.calendarGetPageLocalData($scope.showPage - 1);
				return ;
			}
			$scope.calendarGetPageData($scope.currentYear,$scope.showPage - 1,$scope.pageCount,$scope.currentMarket.marketid);
		}
	}

	//跳转到指定页
	$scope.calendarLoopPointPage = function(e) {
		if(e.keyCode == 13) {
			if($scope.currentPage == $scope.showPage ) {
				return ;
			}
			else {
				if($scope.loadAble == true) {
					$scope.calendarGetPageLocalData($scope.showPage);
					return ;
				}
				$scope.calendarGetPageData($scope.currentYear,$scope.currentPage,$scope.pageCount,$scope.currentMarket.marketid);
			}
		}
	}

	//下一页
	$scope.calendarLoopNext = function() {
		if($scope.showPage == $scope.totalPage) {
			return ;
		}
		else {
			if($scope.loadAble == true) {
				$scope.calendarGetPageLocalData($scope.showPage + 1);
				return ;
			}
			$scope.calendarGetPageData($scope.currentYear,$scope.showPage + 1,$scope.pageCount,$scope.currentMarket.marketid);
		}
	}

	//跳转到尾页
	$scope.calendarLoopLast = function() {
		if($scope.showPage == $scope.totalPage) {
			return ;
		}
		else {
			if($scope.loadAble == true) {
				$scope.calendarGetPageLocalData($scope.totalPage);
				return ;
			}
			$scope.calendarGetPageData($scope.currentYear,$scope.totalPage,$scope.pageCount,$scope.currentMarket.marketid);
		}
	}


	//显示弹框
	$scope.calendarShowModal = function(state) {
		$scope.modalInfo.state = state;
		switch (state) {
			case $scope.modalInfo.stateEnum.edit:
				$scope.modalInfo.path = "../system-manage/calendar-edit.html";
				break;
			default:
				break;
		}
	}

	//弹框加载完成
	$scope.calendarModalLoadReady = function() {
		switch ($scope.modalInfo.state) {
			case $scope.modalInfo.stateEnum.edit:
				mainService.showModal("calendar_modal_back","calendar_modal","calendar_modal_title");
				break;
			default:

		}
	}

	//关闭弹框
	$scope.calendarHideModal = function() {
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
		mainService.hideModal("calendar_modal_back");
	}

	//修改交易日历
	$scope.calendarEditData = function(calendar) {
		$scope.currentCalendar.trday = calendar.trday;
		$scope.currentCalendar.marketid = calendar.marketid;
		$scope.currentCalendar.marketchname = calendar.marketchname;
		$scope.currentCalendar.showDayofweek = calendar.showDayofweek;
		$scope.currentCalendar.weekno = calendar.weekno;
		$scope.currentCalendar.holiday = calendar.holiday;
		$scope.currentCalendar.comm = calendar.comm;
		$scope.currentCalendarEdit = calendar;
		$scope.calendarShowModal($scope.modalInfo.stateEnum.edit);
	}

	//保存修改
	$scope.calendarEditDataSure = function() {
		if($scope.loadAble == true) {
			$scope.currentCalendarEdit.holiday = $scope.currentCalendar.holiday;
			$scope.currentCalendarEdit.comm = $scope.currentCalendar.comm;
			$scope.calendarHideModal();
		}
		else {
			var reqData = {body:{
				trday:$scope.currentCalendar.trday,
				holiday:$scope.currentCalendar.holiday,
				comm:$scope.currentCalendar.comm,
				marketid:$scope.currentCalendar.marketid
			}};
			calendarService.updateCalendar(reqData,function(res) {
				if(res.msret.msgcode == "00") {
					cms.message.success('操作成功.',5);
					$scope.calendarHideModal();
					$scope.calendarGetPageData($scope.currentYear,$scope.showPage,$scope.pageCount,$scope.currentMarket.marketid);
				}
				else {
					cms.message.error("修改日历失败.");
					cms.log("修改日历失败.",res.msret.msgcode,res.msret.msg);
				}
			})
		}
	}

	//生成交易日历
	$scope.calendarMakeCalendar = function(type) {
		var startDate = "";
		var endDate = "";
		var date = new Date();
		var year = date.getFullYear();
		if(type == 0) {
			startDate = year + '-' + date.getMonth() + "-" + date.getDate();
			endDate = year + "-11-31";
		}
		else {
			startDate = (year + 1) + "-0-1";
			endDate = (year + 1) + "-11-31";
		}
		$scope.loadCalendarList.splice(0,$scope.loadCalendarList.length);
		$scope.calendarList.splice(0,$scope.calendarList.length);
		calendarService.makeCalendar(startDate,endDate,function(res) {
			$scope.loadCalendarList = res.body;
			angular.forEach($scope.loadCalendarList,function(calendar) {
				calendar.marketid = $scope.currentMarket.marketid;
				calendar.marketchname = $scope.currentMarket.marketchname;
			})
			$scope.totalPage = Math.ceil(res.body.length / $scope.pageCount);
			$scope.totalPage = $scope.totalPage == 0 ? 1 : $scope.totalPage;
			$scope.loadAble = true;
			$scope.calendarGetPageLocalData(1);
		});
	}

	//取交易日历页数
	$scope.calendarGetPageLocalData = function(page) {
		$scope.currentPage = page;
		$scope.showPage = page;
		$scope.calendarList.splice(0,$scope.calendarList.length);
		$scope.calendarList = $scope.loadCalendarList.slice((page - 1 ) * $scope.pageCount,page * $scope.pageCount);
	}

	//保存交易日历
	$scope.calendarMakeCalendarSure = function() {
		var reqData = {body:{}};
		reqData.body.startTrday = $scope.loadCalendarList[0].trday;
		reqData.body.endTrday = $scope.loadCalendarList[$scope.loadCalendarList.length - 1].trday;
		reqData.body.marketid =  $scope.loadCalendarList[0].marketid;
		reqData.body.data = [];
		angular.forEach($scope.loadCalendarList,function(calendar) {
			var temp = {};
			temp.trday = calendar.trday;
			temp.holiday = calendar.holiday;
			temp.weekno = calendar.weekno;
			temp.dayofweek = calendar.dayofweek;
			temp.comm = calendar.comm;
			temp.marketid = calendar.marketid;
			reqData.body.data.push(temp);
		})
		calendarService.loadCalendarToDb(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				cms.message.success("操作成功.",5);
				$scope.loadCalendarList.splice(0,$scope.loadCalendarList.length);
				$scope.calendarList.splice(0,$scope.calendarList.length);
				$scope.loadAble = false;
				$scope.currentPage = 1;
				$scope.showPage = 1;
				$scope.totalPage = 1;
				$scope.calendarGetPageData($scope.currentYear,1,$scope.pageCount,$scope.currentMarket.marketid);
			}
			else {
				cms.message.error("保存数据库失败.");
				cms.log("保存数据库失败.",res.msret.msgcode,res.msret.msg);
			}
		})
	}

	//取消保存
	$scope.calendarMakeCalendarCancel = function() {
		$scope.loadCalendarList.splice(0,$scope.loadCalendarList.length);
		$scope.loadAble = false;
		$scope.currentPage = 1;
		$scope.showPage = 1;
		$scope.totalPage = 1;
		$scope.calendarGetPageData($scope.currentYear,1,$scope.pageCount,$scope.currentMarket.marketid);
	}

})
