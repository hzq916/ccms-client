angular.module('cmsController').controller('md5ManageCtrl',
function($scope,md5ManageService,mainService) {

    $scope.currentTrIndex=-1;
    $scope.currentAuthTrIndex=-1;

    $scope.allVersionMd5=[];
    $scope.allUnverifiedMD5=[];

    $scope.selectedVersionMD5={};

    $scope.operateMD5={};
    $scope.modalInfo={path:"", state:""};
    $scope.searchFeild="";

    $scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;

    //页面加载完毕
    $scope.$watch('$viewContentLoaded', function(){
        $scope.getVersionMD5();
    });

    //点击表头
	$scope.clickTableHeader = function(keyName,isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse,isNumber);
	}

    $scope.getVersionMD5=function() {
        var requestData={body:{}};
        md5ManageService.getVersionMD5(requestData,function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取已授权的MD5值失败."+res.msret.msg);
                return;
            }

            $scope.allVersionMd5=res.body;

            $scope.currentTrIndex=-1;
            // cms.message.success("获取已授权的MD5值成功");
            $scope.$apply();
        });
    }

    $scope.getUnverifiedMD5=function(){
        var requestData={body:{}};
        md5ManageService.getUnverifiedMD5(requestData,function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取未授权的MD5值失败."+res.msret.msg);
                return;
            }
            $scope.allUnverifiedMD5=res.body;
            $scope.currentAuthTrIndex=-1;

            // cms.message.success("获取未授权的MD5值成功");
            $scope.$apply();
        });
    }

    $scope.addMD5=function(md5Obj ) {
        if(!$scope.checkMD5DataValid(md5Obj)) {
            return;
        }

        var requestData={body:{appname:md5Obj.appname, version:md5Obj.version, md5:md5Obj.md5}};
        md5ManageService.addVersionMD5(requestData, function(res ) {
            if(res.msret.msgcode != '00') {
                cms.message.error("增加MD5失败."+res.msret.msg);
                return;
            }
            $scope.getVersionMD5();
            $scope.hideMD5Modal();
            cms.message.success("增加MD5成功");
            $scope.$apply();
        });
    }

    $scope.editMD5=function(md5Obj ) {
        if(!$scope.checkMD5DataValid(md5Obj)) {
            return;
        }

        var requestData={body:{appname:md5Obj.appname, version:md5Obj.version, md5:md5Obj.md5}};
        md5ManageService.editMD5(requestData, function(res ) {
            if(res.msret.msgcode != '00') {
                cms.message.error("编辑MD5失败."+res.msret.msg);
                return;
            }
            $scope.hideMD5Modal();
            $scope.getVersionMD5();
            cms.message.success("编辑MD5成功");
            $scope.$apply();
        });
    }

    $scope.delMD5=function(md5Obj ) {
        var requestData={body:{
            appname:$scope.operateMD5.appname,
            version:$scope.operateMD5.version,
            md5:$scope.operateMD5.md5
        }};
        md5ManageService.delMD5(requestData, function(res ) {
            if(res.msret.msgcode != '00') {
                cms.message.error("删除MD5失败."+res.msret.msg);
                return;
            }
            $scope.hideMD5Modal();
            $scope.getVersionMD5();
            cms.message.success("删除MD5成功");
            $scope.$apply();
        });
    }


    $scope.authorizeMD5=function(md5Obj ) {
        var requestData={body:md5Obj};
        md5ManageService.authorizeMD5(requestData, function(res ) {
            if(res.msret.msgcode != '00') {
                cms.message.error("授权MD5失败."+res.msret.msg);
                return;
            }

            $scope.getVersionMD5();
            cms.message.success("授权MD5成功");
            $scope.$apply();
        });
    }

    $scope.checkMD5DataValid=function (md5Obj) {
        if (!md5Obj.appname) {
            cms.message.error("模块名称不能为空");
            return false;
        }

        if (!md5Obj.version) {
            cms.message.error("版本号不能为空");
            return false;
        }

        if (!md5Obj.md5) {
            cms.message.error("md5不能为空");
            return false;
        }

        return true;
    }

    $scope.clickTr=function(versionMD5) {
        versionMD5.selected=true;
        $scope.selectedVersionMD5.selected=false;
        $scope.selectedVersionMD5=versionMD5;
    }

    $scope.clickAuthTr=function(index) {
        $scope.currentAuthTrIndex=index;
    }

    $scope.resetMD5 =function( ) {
        $scope.searchFeild="";
        $scope.getVersionMD5();
    }

    $scope.clickAddMD5=function() {
        $scope.operateMD5={};
        $scope.modalInfo.state = "addMD5";
        $scope.modalInfo.path = "../system-manage/md5Manage/md5DetailDialog.html";
    }

    $scope.clickEditMD5=function(md5Obj) {
        $scope.operateMD5=cms.deepCopy(md5Obj,{});

        $scope.modalInfo.state = "editMD5";
        $scope.modalInfo.path = "../system-manage/md5Manage/md5DetailDialog.html";

    }

    $scope.clickDelMD5=function(md5Obj) {
        $scope.operateMD5=md5Obj;
        $scope.modalInfo.state = "delMD5";
        $scope.modalInfo.path = "../system-manage/md5Manage/delMD5Dialog.html";
    }

    $scope.clickAuthMD5=function() {
        $scope.modalInfo.state = "authMD5";
        $scope.modalInfo.path = "../system-manage/md5Manage/md5ManageAuthorize.html";
    }

    $scope.hideMD5Modal=function() {
        $scope.modalInfo={path:"", state:""};
        mainService.hideModal("md5Manage_modal_back");
    }

    $scope.md5ManageLoadModalReady=function() {
        if ($scope.modalInfo.state === "addMD5") {
            mainService.showModal("md5Manage_modal_back","md5Manage_add_modal","md5Manage_add_modal_title");
        } else if ($scope.modalInfo.state === "editMD5") {
            mainService.showModal("md5Manage_modal_back","md5Manage_add_modal","md5Manage_add_modal_title");
        } else if ($scope.modalInfo.state === "delMD5") {
            mainService.showModal("md5Manage_modal_back","md5Manage_del_modal","md5Manage_del_modal_title");
        } else if ($scope.modalInfo.state === "authMD5") {
            mainService.showModal("md5Manage_modal_back","md5Manage_auth_modal","md5Manage_auth_modal_title");
            $scope.getUnverifiedMD5();
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
