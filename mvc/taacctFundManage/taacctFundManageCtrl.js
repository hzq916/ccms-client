angular.module('cmsController').controller('taacctFundManageCtrl',
function($scope,mainService,accountManageService,taacctFundManageService) {
    $scope.taacctFundModalInfo={path:"", state:""};
    // $scope.currentAssetAccount=cms.deepCopy(accountManageService.currentAssetAccount,{}) ;

    $scope.operateTaacctFund={};
    $scope.allTaacctFund=[];

    // $scope.allCurrency=$scope.$parent.$parent.allCurrency;
    $scope.allCurrency=cms.deepCopy($scope.$parent.$parent.allCurrency,[]);
    $scope.allAssetAccount=[];
    $scope.currentAssetAccount={};

    for (var i = 0; i < accountManageService.allAssetAccount.length; i++) {
        if (accountManageService.allAssetAccount[i].caid != -1) {
            var temp=cms.deepCopy(accountManageService.allAssetAccount[i],{});
            $scope.allAssetAccount.push( temp );
            if (accountManageService.currentAssetAccount.acid == temp.acid) {
                $scope.currentAssetAccount=temp;
            }
        }
    }

    $scope.currentAssetAccount.totalamt=0;
    $scope.currentAssetAccount.curencychname="";
    $scope.currentAssetAccount.briefcode="";

    //页面加载完毕
    $scope.$watch('$viewContentLoaded', function(){
        $scope.getTaacctFund();
        $scope.getProductInfo();
        var currencyIndex=cms.binarySearch($scope.allCurrency,"currencyid",$scope.currentAssetAccount.currencyid);
        if (currencyIndex !== -1) {
            $scope.currentAssetAccount.curencychname=$scope.allCurrency[currencyIndex].curencychname;
            $scope.currentAssetAccount.briefcode=$scope.allCurrency[currencyIndex].briefcode;
        }
    });

    $scope.getProductInfo = function() {
        $scope.currentAssetAccount.prenetvalue = 0;
        $scope.currentAssetAccount.totalint = 0;
        $scope.currentAssetAccount.totalshare = 0;
        var reqData = {body:{caid: $scope.currentAssetAccount.caid}};
        taacctFundManageService.getProduct(reqData,function(res) {
            if(res.msret.msgcode == "00") {
                if (res.body.length > 0) {
                    $scope.currentAssetAccount.prenetvalue = res.body[0].prenetvalue;
                    $scope.currentAssetAccount.totalint = res.body[0].totalint;
                    $scope.currentAssetAccount.totalshare = res.body[0].totalshare;
                    $scope.$apply();
                }
            }
        })
    }

    $scope.enterCreateTaacctFund=function(){
        $scope.operateTaacctFund={acid:$scope.currentAssetAccount.acid};
        $scope.operateTaacctFund.totalamt = "";
        $scope.operateTaacctFund.changeShare = false;
        $scope.operateTaacctFund.current_totalshare = Number($scope.currentAssetAccount.totalshare).toFixed(0);
        if ($scope.allCurrency.length) {
            $scope.operateTaacctFund.currencyid = String($scope.allCurrency[0].currencyid);
        }

        $scope.taacctFundModalInfo.state="createTaacctFund";
        $scope.taacctFundModalInfo.path="../taacctFundManage/taacctFundAdd.html";

    }

    $scope.refreshShare = function(type) {
		if ($scope.operateTaacctFund.changeShare == false) {
			$scope.operateTaacctFund.current_totalshare = Number($scope.currentAssetAccount.totalshare).toFixed(0);
		}
		else {
			if (type == 1) {
				$scope.operateTaacctFund.current_totalshare = Number($scope.currentAssetAccount.prenetvalue) == 0 ? 0 : Number((Number($scope.currentAssetAccount.totalint) + Number($scope.operateTaacctFund.totalamt) ) / Number($scope.currentAssetAccount.prenetvalue) ).toFixed(0);
			}
			else {
				if ($scope.operateTaacctFund.option == 1) {
					$scope.operateTaacctFund.current_totalshare = Number($scope.currentAssetAccount.prenetvalue) == 0 ? 0 : Number((Number($scope.currentAssetAccount.totalint) + Number($scope.operateTaacctFund.changeamt) ) / Number($scope.currentAssetAccount.prenetvalue) ).toFixed(0);
				}
				else if ($scope.operateTaacctFund.option == 2) {
					$scope.operateTaacctFund.current_totalshare = Number($scope.currentAssetAccount.prenetvalue) == 0 ? 0 : Number((Number($scope.currentAssetAccount.totalint) - Number($scope.operateTaacctFund.changeamt) ) / Number($scope.currentAssetAccount.prenetvalue) ).toFixed(0);
				}
				else {
					$scope.operateTaacctFund.current_totalshare = Number($scope.currentAssetAccount.prenetvalue) == 0 ? 0 : Number((Number($scope.currentAssetAccount.totalint) + Number($scope.operateTaacctFund.result) - Number($scope.operateTaacctFund.totalamt) ) / Number($scope.currentAssetAccount.prenetvalue) ).toFixed(0);
				}
			}
		}
	}

    $scope.enterTransferTaacctFund=function(taacctFund,in_state){
        $scope.operateTaacctFund={};
        cms.deepCopy(taacctFund,$scope.operateTaacctFund);
        $scope.operateTaacctFund.in_state = in_state;
        $scope.operateTaacctFund.changeShare = false;
        if ($scope.allAssetAccount.length) {
            // $scope.operateTaacctFund.out_acid= in_state ? $scope.allAssetAccount[0].acid : $scope.operateTaacctFund.acid;
            // $scope.operateTaacctFund.in_acid= in_state ? $scope.operateTaacctFund.acid : $scope.allAssetAccount[0].acid;

            if (in_state) {
                $scope.operateTaacctFund.outAssetAccount=$scope.allAssetAccount[0];
                $scope.operateTaacctFund.out_currencyid=String($scope.operateTaacctFund.outAssetAccount.currencyid);

                $scope.operateTaacctFund.inAssetAccount=$scope.currentAssetAccount;
                $scope.operateTaacctFund.in_currencyid=String(taacctFund.currencyid);
            } else {
                $scope.operateTaacctFund.outAssetAccount=$scope.currentAssetAccount;
                $scope.operateTaacctFund.out_currencyid=String(taacctFund.currencyid);

                $scope.operateTaacctFund.inAssetAccount=$scope.allAssetAccount[0];
                $scope.operateTaacctFund.in_currencyid=String($scope.operateTaacctFund.inAssetAccount.currencyid);
            }
        }

        $scope.operateTaacctFund.changeRate=1.000;


        $scope.unitlistTatrdFundChangeInfo('in_acid');
        $scope.unitlistTatrdFundChangeInfo('out_currencyid');

        $scope.taacctFundModalInfo.state="transferTaacctFund";
        $scope.taacctFundModalInfo.path="../taacctFundManage/taacctFundTransfer.html";

    }

    $scope.getTaacctFund=function(){
        $scope.allTaacctFund=[];
        $scope.currentAssetAccount.totalamt=0;

        var requestData = {body:{acid:$scope.currentAssetAccount.acid}};
        accountManageService.getTaacctFund(requestData,function(res){
            if(res.msret.msgcode != '00' ) {
                cms.message.error("获取资产账户的资金失败."+res.msret.msg);
                return;
            }
            $scope.allTaacctFund=res.body;
            $scope.allTaacctFund.forEach(function(obj){
                obj.totalamt=parseFloat(obj.totalamt);
                obj.validamt=parseFloat(obj.validamt);
                if (isNaN(obj.totalamt)) {
                    obj.totalamt=0;
                }

                if (isNaN(obj.validamt)) {
                    obj.validamt=0;
                }
                $scope.currentAssetAccount.totalamt += obj.totalamt;
                $scope.currentAssetAccount.validamt += obj.validamt;

            });


            $scope.$apply();
        });
    }

    $scope.createTaacctFund=function() {
        if (isNaN(parseFloat($scope.operateTaacctFund.totalamt)) ||
             $scope.operateTaacctFund.totalamt < 0) {
            cms.message.error("金额不正确,请重新输入");
            return;
        }
        var requestData={body:{ caid:$scope.currentAssetAccount.caid, acid:$scope.operateTaacctFund.acid, currencyid:$scope.operateTaacctFund.currencyid, totalamt: $scope.operateTaacctFund.totalamt }};
        requestData.body.changeShare = $scope.operateTaacctFund.changeShare ? 1 : 0;
        accountManageService.createTaacctFund(requestData,function(res){
            if(res.msret.msgcode != '00' ) {
                cms.message.error("设置资金账户失败."+res.msret.msg);
                return;
            }
            $scope.$emit("changeTaacctFund","changeTaacctFund");
            $scope.getTaacctFund();
            $scope.getProductInfo();
            $scope.hideTaacctFundModal();
        });
    }



    $scope.transferTaacctFund=function() {

        if ($scope.operateTaacctFund.outAssetAccount.acid == $scope.operateTaacctFund.inAssetAccount.acid &&
            $scope.operateTaacctFund.out_currencyid ==  $scope.operateTaacctFund.in_currencyid) {
                cms.message.error("不能在同一资金账户的同一币种中划转资金!");
                return;
        }
        if ( isNaN(parseFloat($scope.operateTaacctFund.changeAmt)) ||
            $scope.operateTaacctFund.changeAmt<=0 ||
            parseFloat($scope.operateTaacctFund.changeAmt) > parseFloat($scope.operateTaacctFund.out_totalamt)  ) {
            cms.message.error("转入资金错误!");
            return;
        }

        var requestData={body:{ out_caid: $scope.operateTaacctFund.outAssetAccount.caid, in_caid: $scope.operateTaacctFund.inAssetAccount.caid,
            out_acid:$scope.operateTaacctFund.outAssetAccount.acid, out_currencyid:$scope.operateTaacctFund.out_currencyid,
            in_acid: $scope.operateTaacctFund.inAssetAccount.acid, in_currencyid: $scope.operateTaacctFund.in_currencyid,
            changeAmt: $scope.operateTaacctFund.changeAmt, changeRate: $scope.operateTaacctFund.changeRate }};
        requestData.body.changeShare = $scope.operateTaacctFund.changeShare ? 1 : 0;

        accountManageService.transferTaacctFund(requestData,function(res){
            if(res.msret.msgcode != '00' ) {
                cms.message.error("设置资金账户失败."+res.msret.msg);
                return;
            }
            $scope.$emit("changeTaacctFund","changeTaacctFund");
            $scope.getTaacctFund();
            $scope.getProductInfo();
            $scope.hideTaacctFundModal();
        });
    }


    $scope.enterChangeTaacctFund=function(taacctFund){
        $scope.operateTaacctFund={};
        cms.deepCopy(taacctFund,$scope.operateTaacctFund);
        $scope.operateTaacctFund.result=$scope.operateTaacctFund.totalamt;
        $scope.operateTaacctFund.option="1";
        $scope.operateTaacctFund.changeamt=0;

        $scope.operateTaacctFund.changeShare = false;
        $scope.operateTaacctFund.current_totalshare = Number($scope.currentAssetAccount.totalshare).toFixed(0);

        $scope.taacctFundModalInfo.state="setTaacctFundAmt";
        $scope.taacctFundModalInfo.path="../taacctFundManage/taacctFundSetAmt.html";

    }

    $scope.editTaacctFund=function() {
        if (isNaN(parseFloat($scope.operateTaacctFund.totalamt))) {
            $scope.operateTaacctFund.totalamt=0;
        } else {
            $scope.operateTaacctFund.totalamt=parseFloat($scope.operateTaacctFund.totalamt);
        }

        if (isNaN(parseFloat($scope.operateTaacctFund.result)) || $scope.operateTaacctFund.result < 0) {
            cms.message.error("调整后的资金余额必须为大于等于0!");
            return;
        }
        $scope.operateTaacctFund.result=parseFloat($scope.operateTaacctFund.result);

        if($scope.operateTaacctFund.option != 3 && (isNaN(parseFloat($scope.operateTaacctFund.changeamt)) ||
            parseFloat($scope.operateTaacctFund.changeamt) <=0) ) {
            cms.message.error("调整资金必须是正数!");
            return;
        }

        var out_fund=0,in_fund=0;

        if($scope.operateTaacctFund.option == 1) {
            in_fund=$scope.operateTaacctFund.changeamt;
        } else if ($scope.operateTaacctFund.option == 2) {
            out_fund=$scope.operateTaacctFund.changeamt;
        }else {
            if ( $scope.operateTaacctFund.totalamt > $scope.operateTaacctFund.result) {
                out_fund=$scope.operateTaacctFund.totalamt - $scope.operateTaacctFund.result;
            } else {
                in_fund=$scope.operateTaacctFund.result-$scope.operateTaacctFund.totalamt ;
            }
        }

        var requestData={body:{caid:$scope.currentAssetAccount.caid, acid:$scope.operateTaacctFund.acid, currencyid:$scope.operateTaacctFund.currencyid, out_fund:out_fund ,in_fund:in_fund,option: $scope.operateTaacctFund.option}};
        requestData.body.changeShare = $scope.operateTaacctFund.changeShare ? 1 : 0;

        accountManageService.editTaacctFund(requestData,function(res){
            if(res.msret.msgcode != '00' ) {
                cms.message.error("设置资金账户失败."+res.msret.msg);
                return;
            }
            $scope.$emit("changeTaacctFund","changeTaacctFund");
            $scope.getTaacctFund();
            $scope.getProductInfo();
            $scope.hideTaacctFundModal();
        });
    }

    $scope.showTaacctFundModalLoadReady=function(){

        switch ($scope.taacctFundModalInfo.state) {
            case "createTaacctFund":
                mainService.showModal("taacct_fund_modal_back_lv2","taacct_fund_add_modal","taacct_fund_add_modal_title");

                break;
            case "setTaacctFundAmt":

                mainService.showModal("taacct_fund_modal_back_lv2","taacct_fund_edit_modal","taacct_fund_edit_modal_title");

                break;
            case "transferTaacctFund":
                mainService.showModal("taacct_fund_modal_back_lv2","taacct_fund_transfer_modal","taacct_fund_transfer_modal_title");

                break;

            default:
                break;
        }
    }

    $scope.hideTaacctFundModal=function(){
        mainService.hideModal("taacct_fund_modal_back_lv2");
        $scope.taacctFundModalInfo.state="";
        $scope.taacctFundModalInfo.path="";
    }

    //输入操作的值
	$scope.unitlistTatrdFundEditChangeInput = function() {
		var fReg = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{0,3})?$/;
		if(!fReg.test($scope.operateTaacctFund.changeamt)) {
			$scope.operateTaacctFund.changeamt = "";
			$scope.operateTaacctFund.result = $scope.operateTaacctFund.totalamt;
			return ;
		}
		if($scope.operateTaacctFund.option == "1") {
			$scope.operateTaacctFund.result = Number($scope.operateTaacctFund.totalamt) + Number($scope.operateTaacctFund.changeamt);
		}
		else {
			if(Number($scope.operateTaacctFund.totalamt) < Number($scope.operateTaacctFund.changeamt)) {
				$scope.operateTaacctFund.changeamt = $scope.operateTaacctFund.totalamt;
			}
			$scope.operateTaacctFund.result = Number($scope.operateTaacctFund.totalamt) - Number($scope.operateTaacctFund.changeamt);
		}
		$scope.operateTaacctFund.result = Number($scope.operateTaacctFund.result).toFixed(3);
        $scope.refreshShare(2);
	}

    //选择调整操作
    $scope.unitlistTatrdFundEditOptionChange = function() {
        $scope.operateTaacctFund.changeamt = "0.000";
        $scope.operateTaacctFund.result = $scope.operateTaacctFund.totalamt;
        $scope.refreshShare(2);
    }

    //直接调整
    $scope.unitlistTatrdFundEditResult = function() {
        var fReg = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{0,3})?$/;
        if(!fReg.test($scope.operateTaacctFund.result)) {
            $scope.operateTaacctFund.result = "";
            return ;
        }
        var list = $scope.operateTaacctFund.result.split('.');
        if(list.length == 2 && list[1].length >= 3) {
            $scope.operateTaacctFund.result = list[0] + '.' + list[1].substring(0,3);
        }
        $scope.refreshShare(2);
    }

    //账户或者币种改变
    $scope.unitlistTatrdFundChangeInfo = function(type) {

        var reqData = {body: {}};
        if(type == "in_acid" || type == "in_currencyid") {
            reqData.body.acid = $scope.operateTaacctFund.inAssetAccount.acid;
            reqData.body.currencyid = $scope.operateTaacctFund.in_currencyid;
        }
        else {
            reqData.body.acid = $scope.operateTaacctFund.outAssetAccount.acid;
            reqData.body.currencyid = $scope.operateTaacctFund.out_currencyid;
        }
        accountManageService.getTaacctFund(reqData,function(res) {
            if(res.msret.msgcode == "00") {
                var amt = "0.000";
                var date = new Date();
                var trday = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
                if(res.body.length > 0) {
                    amt = res.body[0].totalamt;
                    trday = res.body[0].trday;
                }
                if(type == "in_acid") {
                    $scope.operateTaacctFund.in_totalamt = amt;
                    $scope.operateTaacctFund.in_trday = String(trday);
                    var changeAmt=parseInt($scope.operateTaacctFund.changeAmt);
                    changeAmt=isNaN(changeAmt)? 0:changeAmt;
                    $scope.operateTaacctFund.result = parseInt($scope.operateTaacctFund.in_totalamt)+changeAmt;
                }
                else if(type == "out_acid") {
                    $scope.operateTaacctFund.out_totalamt = amt;
                    $scope.operateTaacctFund.out_trday = String(trday);
                }
                else if(type == "in_currencyid") {
                    $scope.operateTaacctFund.in_totalamt = amt;
                    $scope.operateTaacctFund.in_trday = String(trday);
                    var changeAmt=parseInt($scope.operateTaacctFund.changeAmt);
                    changeAmt=isNaN(changeAmt)? 0:changeAmt;
                    $scope.operateTaacctFund.result =parseInt($scope.operateTaacctFund.in_totalamt) + changeAmt  ;
                    //获取汇率
                }
                else {
                    $scope.operateTaacctFund.out_totalamt = amt;
                    $scope.operateTaacctFund.out_trday = String(trday);
                    //获取汇率
                }
                $scope.$apply();
            }
            else {
                cms.message.error("获取资金余额失败");
            }
        })
    }

    //修改转入资金
    $scope.unitlistTatrdFundChangeAmt = function() {
        var fReg = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{0,3})?$/;
        if(!fReg.test($scope.operateTaacctFund.changeAmt)) {
            $scope.operateTaacctFund.changeAmt = "";
            $scope.operateTaacctFund.result = $scope.operateTaacctFund.in_totalamt;
            return ;
        }
        if(Number($scope.operateTaacctFund.changeAmt) > Number($scope.operateTaacctFund.out_totalamt)) {
            $scope.operateTaacctFund.changeAmt = $scope.operateTaacctFund.out_totalamt;
        }
        $scope.operateTaacctFund.result = Number(Number($scope.operateTaacctFund.in_totalamt) + $scope.operateTaacctFund.changeRate * $scope.operateTaacctFund.changeAmt).toFixed(3);
    }

});
