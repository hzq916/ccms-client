
angular.module('cmsController').controller('permissionManageCtrl',
function($scope,$rootScope,permissionManageService,mainService) {
    $scope.allAssetManager=[];

    $scope.currentRoleIndex=-1;
    $scope.currentRightIndex=-1;
    $scope.allRight=[];
    $scope.allRightChecked = false;
    var rightTree=[];
    $scope.rightClick = false;

    $scope.allRole=[];
    var roleTree=[];

    $scope.modalInfo={path:"", state:""};
    $scope.currentRole={};
    $scope.operateRole={};

    $scope.hadRight=[];

    $scope.changeRoleRight=false;

    $scope.$on("changedManager_broadcast", function(event, message) {
        $scope.refresh();
	});

    //页面加载完毕
    $scope.$watch('$viewContentLoaded', function(){
        $scope.getAllRoles();
        $scope.getAllRights();
        $scope.getAllTaMgr();

    });

    $scope.clickRoleTr=function(role,index) {
        $scope.currentRoleIndex=index;
        $scope.currentRole=role;
        if (!role.isTitle) {
            // $scope.getRoleRight(role.maid, role.roleid);
            $scope.getRoleRights(role.roleid);
            $scope.rightClick = true;
            $scope.allRightChecked = false;
        }
    }

    // $scope.getAllRole=function() {
    //     $scope.allRole=[];
    //     roleTree=[];

    //     var requestData = {body:{}};
    //     permissionManageService.getAllRole(requestData,function(res) {
    //         if(res.msret.msgcode != '00') {
    //             cms.message.error("获取所有角色失败."+res.msret.msg);
    //             return;
    //         }
    //         console.log(res);
    //         $scope.allRole=res.body;

    //         //生成角色树结构
    //         var parent;
    //         for (var i = 0; i < $scope.allRole.length; i++) {
    //             $scope.allRole[i].show=true;
    //             if( i==0 || $scope.allRole[i].maid != $scope.allRole[i-1].maid) {
    //                 parent={maid: $scope.allRole[i].maid, maname:$scope.allRole[i].maname, children:[], show:true, showChildren:true, isTitle:true};
    //                 roleTree.push(parent);
    //                 parent.children.push($scope.allRole[i]);
    //                 $scope.allRole[i].parent=parent;
    //             } else {
    //                 parent.children.push($scope.allRole[i]);
    //                 $scope.allRole[i].parent=parent;
    //             }
    //         }


    //         //生成角色数组
    //         $scope.allRole=[];
    //         for (var i = 0; i < roleTree.length; i++) {
    //             $scope.allRole.push(roleTree[i]);
    //             if (roleTree[i].children.length) {
    //                 for (var j = 0; j < roleTree[i].children.length; j++) {
    //                     $scope.allRole.push(roleTree[i].children[j]);
    //                 }
    //             }
    //         }
    //         $scope.$apply();
    //     });
    // }

    $scope.getAllRoles = function () {
        $scope.allRole=[];
        roleTree=[];
        
        permissionManageService.getAllRoles({ serviceid: $rootScope.serviceid["ccms-server"], body: {} }, function (data) {
            console.log(data);
            if (data.error) {
                cms.message.error(data.error.msg);
                return;
            }

            if (data.res.length > 0) {
                data.res.sort($scope.compare("maid"));
                $scope.allRole=data.res;
                //生成角色树结构
                var parent;
                for (var i = 0; i < $scope.allRole.length; i++) {
                    $scope.allRole[i].show=true;
                    if( i==0 || $scope.allRole[i].maid != $scope.allRole[i-1].maid) {
                        parent={maid: $scope.allRole[i].maid, maname:$scope.allRole[i].maname, children:[], show:true, showChildren:true, isTitle:true};
                        roleTree.push(parent);
                        parent.children.push($scope.allRole[i]);
                        $scope.allRole[i].parent=parent;
                    } else {
                        parent.children.push($scope.allRole[i]);
                        $scope.allRole[i].parent=parent;
                    }
                }

                //生成角色数组
                $scope.allRole=[];
                for (var i = 0; i < roleTree.length; i++) {
                    $scope.allRole.push(roleTree[i]);
                    if (roleTree[i].children.length) {
                        for (var j = 0; j < roleTree[i].children.length; j++) {
                            $scope.allRole.push(roleTree[i].children[j]);
                        }
                    }
                }
                $scope.$apply();
            } else {
                cms.message.error("查询成功，但没有数据");
            }
        });
    }

    $scope.getAllTaMgr=function() {
        var requestData = {body:{}};
        permissionManageService.getAllTaMgr(requestData,function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("获取所有资产管理人失败."+res.msret.msg);
                return;
            }
            $scope.allAssetManager=res.body;

            $scope.$apply();

        });
    }

    $scope.clickFold=function(role) {
        role.showChildren=!role.showChildren;
        (function setShow(obj,show) {
            if (show) {
                for (var i = 0; obj.children && i < obj.children.length; i++) {
                    obj.children[i].show=obj.showChildren;
                    if(obj.children[i].showChildren){ // 只有之前是显示的才需要继续遍历
                        setShow(obj.children[i],show);
                    }
                }
            } else {
                for (var i = 0; obj.children && i < obj.children.length; i++) {
                    obj.children[i].show=show;
                    if (obj.children[i].showChildren) { // 只有之前是显示的才需要继续遍历
                        setShow(obj.children[i],show);
                    }
                }
            }

        }(role,role.showChildren));
    }

    // $scope.getAllRight=function() {
    //     var requestData = {body:{}};
    //     permissionManageService.getAllRight(requestData,function(res) {
    //         if(res.msret.msgcode != '00') {
    //             cms.message.error("获取所有权限列表失败."+res.msret.msg);
    //             return;
    //         }
    //         console.log(res);
    //         var allRights=res.body;
    //         $scope.allRight=res.body;
    //         rightTree=[];

    //         //生成权限树
    //         for (var i = 0; i < allRights.length; i++) {
    //             if(allRights[i].rightcode.split(":").length < 3){
    //                 allRights[i].showChildren=false;
    //                 allRights[i].show=true;
    //             } else {
    //                 allRights[i].showChildren=true;
    //                 allRights[i].show=false;
    //             }

    //             allRights[i].children=[];
    //             switch (allRights[i].min_rightlv) {
    //                 case "90":
    //                     allRights[i].min_rightStr="全局管理员";
    //                     break;
    //                 case "70":
    //                     allRights[i].min_rightStr="资产管理人";
    //                     break;
    //                 case "50":
    //                     allRights[i].min_rightStr="产品";
    //                     break;
    //                 case "10":
    //                     allRights[i].min_rightStr="组合策略";
    //                     break;
    //                 default:
    //             }

    //             var propertyArr = allRights[i].rightcode.split(":");
    //             allRights[i].tier=propertyArr.length-1;
    //             console.log("arr",rightTree,null,allRights[i], propertyArr);
    //             addProperty(rightTree,null,allRights[i], propertyArr, 0  );
    //         }
    //         console.log(allRights,rightTree,$scope.allRight);
    //         $scope.$apply();
    //     });
    // }

    $scope.getAllRights = function () {
        permissionManageService.getAllRights({ serviceid: $rootScope.serviceid["ccms-server"], body: {rootid: 2, depth: 5} }, function (data) {
            if (data.error) {
                cms.message.error(data.error.msg);
                return;
            }

            if (data.res.length > 0) {
                data.res.sort($scope.compare("menupos"));
                console.log(data);
                var allRights=data.res;
                $scope.allRight=data.res;
                rightTree=[];

                //生成权限树
                for (var i = 0; i < allRights.length; i++) {
                    allRights[i].assigntype = 0;
                    if(allRights[i].menupos.split("").length < 3){
                        allRights[i].showChildren=false;
                        allRights[i].show=true;
                    } else {
                        allRights[i].showChildren=true;
                        allRights[i].show=false;
                    }

                    allRights[i].children=[];

                    var propertyArr = allRights[i].menupos.split("");
                    allRights[i].tier=propertyArr.length-1;
                    // console.log("arr",rightTree,null,allRights[i], propertyArr);
                    addProperty(rightTree,null,allRights[i], propertyArr, 0  );
                }
                console.log(allRights,rightTree,$scope.allRight);
                $scope.$apply();
            } else {
                cms.message.error("查询成功，但没有数据");
            }
        });
    }

    //如果考虑固定层数的循环,以后不用遍历以前遍历的节点了
    function addProperty( curArr,parent,destObj, propertyArr, rowIndex) {
        if(propertyArr.length <= rowIndex )
            return;

        var propertyIndex=cms.binarySearch(curArr, propertyArr[rowIndex], "1");
        if (propertyIndex == -1 ) {
            curArr.push(destObj);
            destObj.parent=parent;
            destObj[ propertyArr[rowIndex] ]="1";
        } else {
            addProperty( curArr[propertyIndex].children,curArr[propertyIndex],destObj, propertyArr, rowIndex+1);
        }
    }

    $scope.compare=function(property) {
        return function (a, b) {
            let value1 = a[property];
            let value2 = b[property];
            if (value1 > value2) {
                return 1;
            } else if (value1 == value2) {
                return 0;
            } else {
                return -1;
            }
        };
    }

    $scope.addRole=function() {
        if(! $scope.checkRoleData($scope.operateRole, false) ) {
            return;
        }

        if (typeof $scope.operateRole.roledesc == "undefined") {
            $scope.operateRole.roledesc = "";
        }

        var requestData = {maid: $scope.operateRole.maid, type: 1, name: $scope.operateRole.rolename, desc: $scope.operateRole.roledesc};

        permissionManageService.AddRole({ serviceid: $rootScope.serviceid["ccms-server"], body: requestData }, function (data) {
            if (data.error) {
                cms.message.error("新增角色失败."+data.error.msg);
                return;
            }

            $scope.currentRoleIndex=-1;
            $scope.getAllRoles();
            $scope.hidePermissionModal();
            $scope.$apply();
        });
    }

    // $scope.getRoleRight=function(maid,roleid) {
    //     if(!maid || !roleid) {
    //         cms.message.error("参数错误.");
    //         return;
    //     }

    //     //先恢复状态
    //     $scope.allRight.forEach(function(obj) {
    //         if(obj.rightcode.split(":").length < 3){
    //             obj.showChildren=false;
    //             obj.show=true;
    //         } else {
    //             obj.showChildren=true;
    //             obj.show=false;
    //         }

    //         obj.assigntype= "0";
    //     });
    //     var requestData = {body:{maid:maid,roleid:roleid}};
    //     permissionManageService.getRoleRight(requestData,function(res) {
    //         if(res.msret.msgcode != '00') {
    //             cms.message.error("获取所有权限列表失败."+res.msret.msg);
    //             return;
    //         }
    //         $scope.hadRight=res.body;

    //         var i = 0, j = 0;
    //         for (; i < $scope.hadRight.length; i++) {

    //             for (; j < $scope.allRight.length; j++) {

    //                 if ($scope.hadRight[i].rightcode == $scope.allRight[j].rightcode) {
    //                     $scope.allRight[j].assigntype = $scope.hadRight[i].assigntype;
    //                     j++;
    //                     break;
    //                 } else if ($scope.hadRight[i].rightcode > $scope.allRight[j].rightcode) {
    //                     $scope.allRight[j].assigntype = "0";
    //                     continue;
    //                 } else {
    //                     break;
    //                 }
    //             }

    //         }

    //         $scope.$apply();
    //     });
    // }

    $scope.getRoleRights=function(roleid){
        if(typeof roleid == "undefined") {
            cms.message.error("参数错误.");
            return;
        }
        //先恢复状态
        $scope.allRight.forEach(function(obj) {
            if(obj.menupos.split("").length < 3){
                obj.showChildren=false;
                obj.show=true;
            } else {
                obj.showChildren=true;
                obj.show=false;
            }

            obj.assigntype= 0;
        });

        permissionManageService.getRoleRights({ serviceid: $rootScope.serviceid["ccms-server"], body: {roleid: roleid, rootid: 2, depth: 4} }, function (data) {
            if (data.error) {
                cms.message.error(data.error.msg);
                return;
            }

            if (data.res.length > 0) {
                for (var i = 0; i < $scope.allRight.length; ++i) {
                    for (var j = 0; j < data.res.length; ++ j) {
                        if (data.res[j].menuid == $scope.allRight[i].menuid) {
                            $scope.allRight[i].assigntype = 1;
                        }
                    }
                }
                $scope.$apply();
            } else {
                cms.message.error("查询成功，但没有数据");
            }
        });
    }

    function compareRight(first, second) {
        if (first.rightcode > second.rightcode) {
            return 1;
        } else if (first.rightcode < second.rightcode) {
            return -1;
        } else {
            if (first.assigntype > second.assigntype) {
                return 1;
            } else if (first.assigntype < second.assigntype) {
                return -1;
            } else {
                return 0;
            }
        }
    }

    //如果destObj不存在于数组中,则加入
    function insertArray(array,destObj) {
        // for (var i = 0; i < array.length; i++) {
        //     if ( compareRight(array[i], destObj) < 0 ) {
        //
        //     }
        // }
    }

    function delArray(array,destObj) {
        var arrayIndex=cms.binarySearchByFunction(array, destObj, compareRight);
        if( arrayIndex != -1 ) {
            array.splice(arrayIndex,1);
        }
    }

    function setChildrenUnVisible(right) {
        right.assigntype="0";
        right.children.forEach(function(obj) {
            setChildrenUnVisible(obj);
        });
    }

    function setChildrenVisible(right) {
        if (right.assigntype != "3") {
            right.assigntype="1";
        }

        right.children.forEach(function(obj) {
            setChildrenVisible(obj);
        });
    }


    function setParentVisible(right) {
        if (!right) {
            return ;
        }
        if ( right.assigntype != "3") {
            right.assigntype="1";
        }

        setParentVisible(right.parent);
    }

    function setParentUseable(right) {
        if (right.parent){
            right.parent.assigntype = 1;
            setParentUseable(right.parent);
        }
    }

    function setChildrenUseable(right) {
        if (right.children && right.children.length > 0){
            right.children.forEach(function(obj) {
                obj.assigntype = 1;
                setChildrenUseable(obj);
            });
        }
    }

    function setChildrenUnUseable(right) {
        if ( right.assigntype == "3") {
            right.assigntype="1";
        }
        // right.assigntype=right.assigntype>>1;
        right.children.forEach(function(obj) {
            setChildrenUnUseable(obj);
        });
    }


    $scope.clickVisibleCheckBox=function(right) {
        if(right.assigntype == "3" || right.assigntype == "1") {
            setChildrenUnVisible(right);
        } else {
            setParentVisible(right.parent);
            setChildrenVisible(right)
        }
    }

    $scope.clickUseableCheckBox=function(right) {
        if(right.assigntype == 1) {
            right.assigntype = 0;
        } else {
            right.assigntype = 1;
        }
        
        if (right.assigntype == 1) {
            setChildrenUseable(right);
            setParentUseable(right);
        }
    }

    $scope.clickAllCheckBox = function() {
        if (!$scope.allRightChecked) {
            $scope.allRightChecked = true;
            for (var i = 0; i < $scope.allRight.length; ++i) {
                $scope.allRight[i].assigntype = 1;
            }
        } else {
            $scope.allRightChecked = false;
            for (var i = 0; i < $scope.allRight.length; ++i) {
                $scope.allRight[i].assigntype = 0;
            }
        }
    }

    $scope.saveChangeRight=function() {
        var nowRights=[];
        for (var i = 0; i < $scope.allRight.length; i++) {
            if ($scope.allRight[i].assigntype == 1) {
                nowRights.push($scope.allRight[i].menuid);
            }
        }

        var requestData = {roleid:$scope.currentRole.roleid, menuIDs: nowRights};
        permissionManageService.EditRoleRight({ serviceid: $rootScope.serviceid["ccms-server"], body: requestData }, function (data) {
            if (data.error) {
                cms.message.error("修改菜单权限失败."+data.error.msg);
                return;
            }
            cms.message.success("修改菜单权限成功.");
            $scope.changeRoleRight=false;
            $scope.$apply();
        });
    }

    $scope.editRole=function() {
        if(! $scope.checkRoleData($scope.operateRole, true) ) {
            return;
        }
        if (typeof $scope.operateRole.roledesc == "undefined") {
            $scope.operateRole.roledesc = "";
        }
        var requestData = {roleid: $scope.operateRole.roleid, rolename: $scope.operateRole.rolename, roledesc: $scope.operateRole.roledesc};
        permissionManageService.EditRole({ serviceid: $rootScope.serviceid["ccms-server"], body: requestData }, function (data) {
            if (data.error) {
                cms.message.error("修改角色失败."+data.error.msg);
                return;
            }
            $scope.currentRoleIndex=-1;
            $scope.getAllRoles();
            $scope.hidePermissionModal();
            $scope.$apply();
        });
    }
    $scope.checkRoleData=function(role,isEdit) {
        if(!isEdit && typeof role.maid == "undefined") {
            cms.message.error("必须选择资产管理人.");
            return false;
        }

        if(isEdit && !role.roleid) {
            cms.message.error("角色的ID不能为空.");
            return false;
        }

        if(typeof role.rolename == "undefined" || role.rolename == "") {
            cms.message.error("角色名称不能为空");
            return false;
        }

        return true;
    }

    $scope.delRole=function(maid,roleid) {
        if(typeof roleid == "undefined") {
            cms.message.error("参数错误.");
            return;
        }
        var requestData = {roleid: roleid};
        permissionManageService.DeleteRole({ serviceid: $rootScope.serviceid["ccms-server"], body: requestData }, function (data) {
            if (data.error) {
                cms.message.error("删除角色失败."+data.error.msg);
                return;
            }
            $scope.currentRoleIndex=-1;
            $scope.getAllRoles();
            $scope.hidePermissionModal();
            $scope.$apply();
        });
    }

    $scope.modifyRoleRight=function(roleRightArrary) {
        var requestData = {body:{maid:maid, roleid:roleid, roleRightArrary:roleRightArrary}};
        permissionManageService.modifyRoleRight(requestData,function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("修改角色权限失败."+res.msret.msg);
                return;
            }
            $scope.$apply();
        });
    }

    $scope.clickAddRole=function () {
        $scope.operateRole={};
        if ($scope.allAssetManager.length) {
            $scope.operateRole.maid=$scope.allAssetManager[0].maid;
        }
        $scope.modalInfo.state="addRole";
        $scope.modalInfo.path="../permissionManage/permissionRoleDetail.html";
    }

    $scope.clickEditRole=function () {

        if(typeof $scope.currentRole.maid == "undefined"  ||$scope.currentRole.isTitle ) {
            cms.message.error("请选择一个需要编辑的角色. ");
            return;
        }

        $scope.operateRole.maid=$scope.currentRole.maid;
        $scope.operateRole.name=$scope.currentRole.maname + "(" + $scope.currentRole.maid + ")";
        $scope.operateRole.roleid=$scope.currentRole.roleid;
        $scope.operateRole.rolename=$scope.currentRole.rolename;
        $scope.operateRole.roledesc=$scope.currentRole.roledesc;

        $scope.modalInfo.state="editRole";
        $scope.modalInfo.path="../permissionManage/permissionRoleDetail.html";
    }

    $scope.clickDelRole=function (role) {
        if(role.isTitle || typeof role.maid == "undefined") {
            cms.message.error("请选择一个需要删除的角色. ");
            return;
        }
        if(role.maid == -1) {
            cms.message.error("系统默认角色不能删除. ");
            return;
        }
        $scope.operateRole=role;
        $scope.modalInfo.state="delRole";
        $scope.modalInfo.path="../permissionManage/permissionRoleDelete.html";
    }

    $scope.clickChangeRoleRight=function () {
        if($scope.currentRole.isTitle || typeof $scope.currentRole.maid == "undefined") {
            cms.message.error("请选择一个需要编辑权限的角色. ");
            return;
        }
        $scope.changeRoleRight=true;
    }


    $scope.cancelChange=function () {
        $scope.changeRoleRight=false;
        $scope.getRoleRights($scope.currentRole.roleid);
    }

    $scope.permissionManageLoadModalReady=function () {
        switch ($scope.modalInfo.state) {
            case "addRole":
            mainService.showModal("permissionManage_modal_back","permissionManage_add_modal","permissionManage_add_modal_title");
                break;
            case "editRole":
            mainService.showModal("permissionManage_modal_back","permissionManage_add_modal","permissionManage_add_modal_title");
                break;
            case "delRole":
            mainService.showModal("permissionManage_modal_back","permissionManage_del_modal","permissionManage_del_modal_title");
                break;
            default:

        }
    }

    $scope.hidePermissionModal=function () {
        mainService.hideModal("permissionManage_modal_back","permissionManage_del_modal","permissionManage_del_modal_title");
        $scope.modalInfo.state="";
        $scope.modalInfo.path="";
    }

    $scope.refresh=function() {
        $scope.modalInfo.state="";
        $scope.modalInfo.path="";
        $scope.currentRoleIndex=-1;
        $scope.currentRightIndex=-1;

        //先恢复状态
        $scope.allRight.forEach(function(obj) {
            if(obj.menupos.split(":").length < 3){
                obj.showChildren=false;
                obj.show=true;
            } else {
                obj.showChildren=true;
                obj.show=false;
            }

            obj.assigntype= "0";
        });

        $scope.getAllRoles();
        $scope.getAllRights();
        $scope.getAllTaMgr();
    }

    $scope.exportRoleRight=function() {
        if(typeof $scope.currentRole.roleid == "undefined"){
            cms.message.error("请选择一个需要导出权限的角色");
            return;
        }
        var exportExceldata=[];
        console.log($scope.allRight);
        for (var i = 1; i < $scope.allRight.length; i++) {
            var singleData=[];
            var menuprompt="";
            for (var j = 0; j < $scope.allRight[i].tier; j++) {
                menuprompt += " ";
            }
            menuprompt += $scope.allRight[i].menuprompt;
            singleData.push(menuprompt);

            if ($scope.allRight[i].assigntype == 1) {
                singleData.push("可用");
            } else {
                singleData.push("不可用");
            }
            exportExceldata.push(singleData);
        }
        var dataObj={data:exportExceldata,fileName:"功能权限数据-"+$scope.currentRole.rolename ,fileType:"xlsx",
            headers:["功能名称", "权限"]};

        cms.exportExcelFile(dataObj,function(err,res){
            if(err) return ;
            if (!res.result) {
                cms.message.error("导出表格数据失败。"+res.reason);
                return;
            }
            cms.message.success("导出成功");
        })

    }

	//导入
	$scope.importRoleRight = function () {
        if(typeof $scope.currentRole.roleid == "undefined"){
            cms.message.error("请选择一个需要导出权限的角色");
            return;
        }
		cms.importExcelFile(function (err, res) {
			if (err) return;
			if (res.result == true) {
				$scope.anlazyData(res.data);
			}
			else {
				cms.log(res.reason);
				cms.message.error(res.reason);
			}
		})
	}


	//分析数据
	$scope.anlazyData = function (data) {
		if (data.length <= 1) {
			cms.message.error("选择的文件无数据，请重新选择.")
			return;
		}

        if (data.length != $scope.allRight.length) {
			cms.message.error("选择的文件数据有误，请检查版本或数据完整性.")
			return;
        }

        var hasRight = [];
        
		for (var i = 1; i < $scope.allRight.length; ++i) {
			if (data[i].length < 2) {
				cms.message.error("第" + (i + 1) + "行存在空数据，请修改后重试.");
                return;
			}
            if (data[i][1] == "可用") {
                hasRight.push($scope.allRight[i].menuid);
            } else if (data[i][1] == "不可用") {

            } else {
				cms.message.error("第" + (i + 1) + "行数据错误，请修改后重试.");
                return;
            }

        }

        var requestData = {roleid:$scope.currentRole.roleid, menuIDs: hasRight};
        permissionManageService.EditRoleRight({ serviceid: $rootScope.serviceid["ccms-server"], body: requestData }, function (data) {
            if (data.error) {
                cms.message.error("导入菜单权限失败."+data.error.msg);
                return;
            }
            cms.message.success("导入菜单权限成功.");
            $scope.changeRoleRight=false;
            $scope.getRoleRights($scope.currentRole.roleid);
            $scope.$apply();
        });
	}
});
