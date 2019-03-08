angular.module('cmsController').controller('monitorCtrl',
function($scope,$interval,monitorService,$ocLazyLoad,mainService) {
    $scope.allAssetManager=[]; // 保存账户体系的数组
    $scope.allProducts=[];
    $scope.productNets=[];

    $scope.modalInfo={path:"", state:""};
    var monitorDetailEcharts,monitorPreviewEcharts;
    var startPoint=-1,endPoint=-1;
    var minNet=0,maxNet=0;

    var echartDetailOption,echartPreviewOption;

    $scope.guideTree = [];
    $scope.showSubguide=true;
    $scope.showTable="productInfomation";
    $scope.currentUnit={};
    $scope.currentProduct={};

    $scope.currentActiveProduct= {};
    $scope.currentDataItem={};

    $scope.managerProductDetails=[];
    $scope.productDetailsTree=[];
    $scope.productDetails=[];
    var lastProductDetailsTree=[], newProductDetailsTree=[];
    var lastProductDetails=[], newProductDetails=[];

    $scope.refreshTime="10";
    $scope.spendTime=10;

    $scope.foldStrategyState=false;
    $scope.foldStrategyDesc="折叠策略栏";

    $scope.$on("changedManager_broadcast", function(event, message) {
        $scope.getAllTaMgr();
    });

    $scope.$on("changedProduct_broadcast", function(event, message) {
        $scope.getAllTaMgr();
    });

    //页面加载完毕
    $scope.$watch('$viewContentLoaded', function(){
        $scope.getAllTaMgr();
        $scope.getUkType();
        var autoRefreshTimer=$interval(function() {
            --$scope.spendTime;
            if ($scope.spendTime <= 0) {
                $scope.spendTime=parseInt($scope.refreshTime);
                $scope.clickUnit($scope.currentUnit);
            }
        },60000);

        $ocLazyLoad.load("../../lib/echarts.common.min.js").then(function() {
            monitorDetailEcharts = echarts.init(document.getElementById('monitor_detail_div'));
			var option = {
    			baseOption:{
    				title: {
    		        text: '净值走势图'
    		    },
    		    tooltip: {
    		        trigger: 'axis'
    		    },
    		    legend: {
    		        data:['净值']
    		    },
                grid: {
                         left: 40,
                        // top: 80,
                         right: 40
                        // bottom: 0
                },
    		    xAxis: {
    		        type: 'category',
    		        boundaryGap: false,
    						data: []
    					},
    		    yAxis: {
    		        type: 'value'
    		    },
                dataZoom: [{
                    type: 'inside',
                    xAxisIndex: 0 ,
                    start: 0,
                    end: 100
                }, {
                        start: 0,
                        end: 10,
                        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                        handleSize: '60%',
                        handleStyle: {
                                color: '#fff',
                                shadowBlur: 3,
                                shadowColor: 'rgba(0, 0, 0, 0.6)',
                                shadowOffsetX: 2,
                                shadowOffsetY: 2
                        },
                        left: 80,
                        right: 80
                }],
    		    series: [
    		        {
    		            name:'净值',
    		            type:'line',
    		            data:[]
    		        }
    		    ]
    			}


		};

		monitorDetailEcharts.setOption(option);

        monitorDetailEcharts.on('datazoom', function (params) {
			if (typeof( params.start) != 'undefined') {
				startPoint=Math.floor(params.start/100*$scope.productNets.length);
				endPoint=Math.ceil(params.end/100*$scope.productNets.length);
			}
			else if (typeof( params.batch) != 'undefined'){
				startPoint=Math.floor(params.batch[0].start*$scope.productNets.length/100);
				endPoint=Math.ceil(params.batch[0].end*$scope.productNets.length/100);
			}
			++endPoint;
			--startPoint;
			endPoint=endPoint>$scope.productNets.length?$scope.productNets.length:endPoint;
			startPoint=startPoint>0?startPoint:0;

			$scope.updateEchartsYAxis();

		});

        var previewOption = {
            baseOption:{
                // title: {
                //     text: '净值走势图'
                // },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data:['净值']
                },
                grid: {
                    //  left: 80,
                    // top: 80,
                    //  right: 80
                    // bottom: 0
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: []
                  },
                yAxis: {
                    type: 'value',
                    splitNumber :2
                },
                series: [
                    {
                        name:'净值',
                        type:'line',
                        data:[]
                    }
                ]
            },
            media: [{
                  option: {
                      grid: {
                          top:30,
                          left: 40,
                          right: 0,
                          bottom:0
                      }
                  }
              } , {
                query: {
                    maxWidth: 750
                   },
                   option: {
                      grid: {
                          top:30,
                          bottom:20,
                          left: 40,
                          right:35
                      },
                    yAxis: {}
                  }
                }]

          };
        monitorPreviewEcharts = echarts.init(document.getElementById('monitor_preview_echart'));
        monitorPreviewEcharts.setOption(previewOption);

        })
    });

    $scope.updateEchartsYAxis=function(){
        var max=0,min=0;

        max=getMaximum($scope.productNets,"netvalue",startPoint,endPoint);
        min=getMinimum($scope.productNets,"netvalue",startPoint,endPoint);

        if (typeof(max)=='undefined'||max<=0||typeof(min)=='undefined'||min<0) {
            var option={
                max:1,
                min:0,
                interval:0.2
            };
        }else{
            var option=getMaxAndMinInterval(max,min);
        }

        monitorDetailEcharts.setOption({
            yAxis: {
                max:option.max,
                min:option.min,
                interval:option.interval
            }
        });
    }

    function getMinimum(arr,destMember,start,end){
      	start=start||0;
      	end=end||arr.length;

        if (typeof destMember == "undefined") {
            var min=arr[start];
            for (var i = start; i < end; i++) {
              if(min>arr[i])
                min=arr[i];
            }
            return min;
        }else if (typeof destMember == "string") {
            var min=arr[start][destMember];
            for (var i = start; i < end; i++) {
              if(min>arr[i][destMember])
                min=arr[i][destMember];
            }
            return min;
        }
        return arr[start];

    }

    //主要用于图表的显示,默认
    function getMaximum(arr,destMember,start,end){
      	start=start||0;
      	end=end||arr.length;


        if (typeof destMember == "undefined") {
            var max=arr[start];
            for (var i = start; i < end; i++) {
              if(max<arr[i])
                max=arr[i];
            }
            return max;
        }else if(typeof destMember == "string"){
            var max=arr[start][destMember];
            for (var i = start; i < end; i++) {
              if(max<arr[i][destMember])
                max=arr[i][destMember];
            }
            return max;
        }
        return arr[start];

    }

    function getMaxAndMinInterval(max,min)
    {
        if (max === min) {
           min=0;
        }

       var splitNumber=5;//分割的块数
       var interval=(max-min)/splitNumber;
       var newinterval = interval;
       var n = 0;

       if (newinterval<0.01) {
           newinterval=0.01;

           var startPoint=Math.floor(min/newinterval)*newinterval;
           var endPoint=startPoint+splitNumber*newinterval;
           if (min-startPoint <0.5*newinterval&&startPoint-newinterval>=0) {
               startPoint-=newinterval;
           }
           while(endPoint-max < 0.5*newinterval){
               endPoint+=newinterval;
           }


           startPoint = parseFloat(startPoint.toFixed(2));
           endPoint= parseFloat(endPoint.toFixed(2));

           var obj={};
           obj.max=endPoint;
           obj.min=startPoint;
           obj.interval=newinterval;

           return obj;
       }

       if (interval < 1) {
           while(interval < 1){
               interval = interval*10;
               n = n - 1;
           }
       }else{
           while(interval >= 10)
           {
               interval = interval/10;
               n = n + 1;
           }
       }
       newinterval = Math.round(newinterval/Math.pow(10,n))*Math.pow(10,n);

       if (Math.abs(n)+1<=20) {
           n=Math.abs(n)+1;
       }
       else{
           n=20;
       }

       if ((max-min)>splitNumber*newinterval) {
           while((max-min)>splitNumber*newinterval){
               newinterval+=0.5*newinterval;
           }
           newinterval = parseFloat(newinterval.toFixed(n+1));

       }
       else {
           newinterval = parseFloat(newinterval.toFixed(n));
       }


       var startPoint=Math.floor(min/newinterval)*newinterval;
       var endPoint=startPoint+splitNumber*newinterval;
       if (min-startPoint <0.5*newinterval&&startPoint-newinterval>=0) {
           startPoint-=newinterval;
       }
       while(endPoint-max < 0.5*newinterval){
           endPoint+=newinterval;
       }


       startPoint = parseFloat(startPoint.toFixed(n));
       endPoint= parseFloat(endPoint.toFixed(n));

       var obj={};
       obj.max=endPoint;
       obj.min=startPoint;
       obj.interval=newinterval;

       return obj;
    }


    $scope.clickActiveProductTr= function(product) {
        $scope.currentActiveProduct.active=false;

        product.active=true;
        $scope.currentActiveProduct = product;
    }

    $scope.clickActiveStrategyTr= function(dataItem) {
        $scope.currentDataItem.active=false;
        dataItem.active=true;
        $scope.currentDataItem=dataItem;
    }

    $scope.getAllTaMgr=function() {
        //首先清空已有数据
        $scope.allAssetManager=[];

        var requestData = {body:{}};
        console.log("00000");
        monitorService.getAllTaMgr(requestData,function(res){
            console.log("getAllTaMgr-------");
            console.log(res);
            if(res.msret.msgcode != '0') {
                cms.message.error("获取所有资产管理人失败."+res.msret.msg);
                return;
            }
            $scope.allAssetManager=res.body;
            $scope.allAssetManager.forEach(function(obj){
                obj.maid=parseInt(obj.maid);
                obj.menuId = obj.maid;
                obj.menuName = obj.maname;
                obj.type = 'maid';
                obj.children=[];

            });
            $scope.allAssetManager.splice(0,0,{maid:-1, menuId:-1, menuName:"全部产品", type:"maid", children:[]});
            $scope.currentUnit=$scope.allAssetManager[0];
            $scope.clickUnit($scope.currentUnit);
            $scope.getProducts();
            $scope.$apply();
        });
    }

    $scope.getProducts=function(){
        var requestData = {body:{}};
        console.log("查询产品");
        monitorService.getMonitorProducts(requestData,function(res){
            console.log("getMonitorProducts------");
            console.log(res);
            if(res.msret.msgcode != '0') {
                cms.message.error("获取所有产品失败."+res.msret.msg);
                return;
            }
            $scope.allProducts=res.body;
            var i = 0,j=0;
            for (; i < $scope.allProducts.length; i++) {
                $scope.allProducts[i].maid=parseInt($scope.allProducts[i].maid);
                $scope.allProducts[i].caid=parseInt($scope.allProducts[i].caid);
                $scope.allProducts[i].menuId = $scope.allProducts[i].caid;
                $scope.allProducts[i].menuName = $scope.allProducts[i].caname;
                $scope.allProducts[i].type = 'caid';

                var maIndex=cms.accurateSearch($scope.allAssetManager,"maid",$scope.allProducts[i].maid);
                if (maIndex != -1) {
                    $scope.allAssetManager[maIndex].children.push($scope.allProducts[i]);
                } else {
                    var newManager = {maid: $scope.allProducts[i].maid, menuId: $scope.allProducts[i].maid, menuName: "", type: 'maid', children: []};
                    newManager.children.push($scope.allProducts[i]);
                    $scope.allAssetManager.push(newManager);
                }
            }
            $scope.$apply();

        });
    }

    $scope.changeRefreshTimer=function() {
        if ($scope.refreshTime < $scope.spendTime) {
            $scope.spendTime =$scope.refreshTime ;
        }
    }

    $scope.clickUnit = function(unit) {
        console.log(unit);

        if (typeof unit.maid == "undefined") {
            return ;
        }

        if (unit.caid) {
            console.log("点击详情按钮");
            $scope.showTable="strategyInfomation";
            $scope.foldStrategyState=true;
            if ($scope.foldStrategyState) {
                $scope.foldStrategyDesc="折叠策略栏";
            } else {
                $scope.foldStrategyDesc="打开策略栏";
            }

            if (unit.caid != $scope.currentUnit.caid) {
                lastProductDetailsTree=[];
                lastProductDetails=[];
            } else {
                lastProductDetailsTree=$scope.productDetailsTree;
                lastProductDetails=$scope.productDetails;
            }
            $scope.currentUnit=unit;

            newProductDetailsTree=[];
            newProductDetails=[];

            monitorService.getProductAmt({body:{caid:unit.caid}}, function(res){
                console.log("getProductAmt---");
                console.log(res);
                if(res.msret.msgcode != '0' || !res.body.length) {
                    cms.message.error("获取指定产品的信息失败."+res.msret.msg);
                    return;
                }
                var product=res.body[0];
                // parseProductFundInfo(product);

                // product.marketValue=product.stock_value+product.futures_value;
                // if (product.totalintFuture) {
                //     product.futures_risk=product.totalmargin/product.totalintFuture;
                // } else {
                //     product.futures_risk="—";
                // }

                product.id=product.caid;
                product.name=product.caname;
                product.children=[];
                product.show=true;
                product.showChildren=true;
                product.tier=0;
                product.investmentFunds = [];
                product.investmentOthers = [];

                newProductDetailsTree.push(product);
                console.log(newProductDetailsTree);
                $scope.getStrategyFundInfo(unit.caid);
                $scope.getProductSubject(unit);
                $scope.$apply();
            });

        } else {
            $scope.showTable="productInfomation";

            if ($scope.currentUnit.maid != unit.maid) {
                $scope.currentActiveProduct={};
            }
            $scope.currentUnit=unit;
            $scope.getMonitorProducts(unit);
        }

    }

    $scope.getStrategyFundInfo=function(caid) {
        monitorService.getStrategyFundInfo({body:{caid:caid}}, function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取产品的策略组合信息失败."+res.msret.msg);
                return;
            }

            res.body.forEach(function(obj) {
                parseStrategyFundInfo(obj);

                obj.id=obj.trid;
                obj.name=obj.trname;
                obj.children=[];
                obj.parent= newProductDetailsTree[0];
                obj.show= true;
                obj.showChildren=true;
                obj.tier=1;


                // obj.hold_posipl=0;
                // obj.mtm_posipl=0;
                // obj.spifCap=0;
                // obj.commodityFuturesCap=0;
                // obj.commodityFuturesNetting=0;
                // obj.risk_exposure=0;

                // obj.marketValue = obj.stock_value+obj.futures_value;
                //
                // if (obj.totalintFuture) {
                //     obj.futures_risk=obj.totalmargin/obj.totalintFuture;
                // } else {
                //     obj.futures_risk="—";
                // }

                $scope.ukType.forEach(function(singletype) {
                    obj.children.push({ id:singletype.majortype, name:singletype.typechname, majortype:singletype.majortype, minortype:singletype.minortype,
                        typechname:singletype.typechname, typeenname:singletype.typeenname, children:[], parent:obj, show:obj.showChildren, showChildren:true, tier:2});
                });
                newProductDetailsTree[0].children.push(obj);
            });
            $scope.getStrategyHold(caid);

            $scope.$apply();
        });
    }

    $scope.getProductSubject = function (unit) {
        var requestData = {body:{}};
        if (unit.maid && unit.maid != -1) {
            requestData.body.maid = unit.maid;
        }

        if (unit.caid) {
            requestData.body.caid = unit.caid;
        }

        monitorService.getProductSubject(requestData, function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取产品的外部资产失败."+res.msret.msg);
                return;
            }
            var productSubjects = res.body;

            if (unit.caid) { //表示当前在产品详细界面

                productSubjects.forEach(function(investment) {
                    if (investment.subjecttype == 2) {
                        newProductDetailsTree[0].investmentFunds.push(investment);
                    } else {
                        newProductDetailsTree[0].investmentOthers.push(investment);
                    }
                });
            } else {
                for (var i = 0,j = 0; i < $scope.managerProductDetails.length; i++) {
                    for (; j < productSubjects.length; j++) {
                        if ($scope.managerProductDetails[i].caid == productSubjects[j].caid) {

                            if (productSubjects[j].subjecttype == 2) {
                                $scope.managerProductDetails[i].investmentFunds.push(productSubjects[j]);
                            } else {
                                $scope.managerProductDetails[i].investmentOthers.push(productSubjects[j]);
                            }

                        } else if ($scope.managerProductDetails[i].caid > productSubjects[j].caid) {
                            continue;
                        } else {
                            break;
                        }
                    }

                }

            }

            $scope.$apply();
        });
    }

    function parseStrategyFundInfo(obj) {
        obj.maid=parseInt(obj.maid);
        obj.caid=parseInt(obj.caid);
        obj.trid=parseInt(obj.trid);
        obj.currencyid=parseInt(obj.currencyid);

        // obj.fee=parseFloat(obj.fee);
        // obj.frozenamt=parseFloat(obj.frozenamt);
        // obj.futures_validamt=parseFloat(obj.futures_validamt);
        // obj.futures_value=parseFloat(obj.futures_value);
        // obj.hold_closepl=parseFloat(obj.hold_closepl);
        // obj.hold_posipl=parseFloat(obj.hold_posipl);
        // obj.loan=parseFloat(obj.loan);
        // obj.mtm_closepl=parseFloat(obj.mtm_closepl);
        // obj.mtm_posipl=parseFloat(obj.mtm_posipl);
        // obj.netvalue=parseFloat(obj.netvalue);
        // obj.preloan=parseFloat(obj.preloan);
        // obj.prenetvalue=parseFloat(obj.prenetvalue);
        // obj.pretotalamt=parseFloat(obj.pretotalamt);
        // obj.pretotalint=parseFloat(obj.pretotalint);
        // obj.prevailloan=parseFloat(obj.prevailloan);
        // obj.sellmargin=parseFloat(obj.sellmargin);
        // obj.stock_validamt=parseFloat(obj.stock_validamt);
        // obj.stock_value=parseFloat(obj.stock_value);
        // obj.stockloan=parseFloat(obj.stockloan);
        // obj.totalamt=parseFloat(obj.totalamt);
        // obj.totalint=parseFloat(obj.totalint);
        // obj.totalmargin=parseFloat(obj.totalmargin);
        // obj.validloan=parseFloat(obj.validloan);

        obj.totalint = parseFloat(obj.totalint);
        obj.prenetvalue = parseFloat(obj.prenetvalue);
        obj.netvalue = parseFloat(obj.netvalue);
        obj.stockvalue = parseFloat(obj.stockvalue);
        obj.hold_closepl = parseFloat(obj.hold_closepl);
        obj.hold_posipl = parseFloat(obj.hold_posipl);
        obj.mtm_closepl = parseFloat(obj.mtm_closepl);
        obj.mtm_posipl = parseFloat(obj.mtm_posipl);
        obj.totalmargin = parseFloat(obj.totalmargin);
        obj.stock_validamt = parseFloat(obj.stock_validamt);
        obj.futures_validamt = parseFloat(obj.futures_validamt);
        obj.totalintFuture = parseFloat(obj.totalintFuture);
        obj.stock_value = parseFloat(obj.stock_value);
        obj.spifCap = parseFloat(obj.spifCap);
        obj.risk_exposure = parseFloat(obj.risk_exposure);
        obj.commodityFuturesCap = parseFloat(obj.commodityFuturesCap);
        obj.commodityFuturesNetting = parseFloat(obj.commodityFuturesNetting);
    }

    $scope.getUkType = function() {
        monitorService.getUkType({body:{minortype:0}}, function(res){
            if(res.msret.msgcode != '00') {
                cms.message.error("获取UK种类失败."+res.msret.msg);
                return;
            }
            $scope.ukType=res.body;
            $scope.ukType.forEach(function(obj) {
                obj.majortype=parseInt(obj.majortype);
                obj.minortype=parseInt(obj.minortype);
            });
            $scope.$apply();
        });
    }

    $scope.getMonitorProducts=function(unit) {
        console.log(unit);
        monitorService.getProductAmt({body:{maid:unit.maid}}, function(res){
            console.log(res);
            if(res.msret.msgcode != '0') {
                cms.message.error("获取资产管理人所有产品信息失败."+res.msret.msg);
                $scope.managerProductDetails=[];
                return;
            }
            var lastManagerProductTree=$scope.managerProductDetails;
            $scope.managerProductDetails=res.body;
            //
            // $scope.managerProductDetails.forEach(function(obj) {
            //     parseProductFundInfo(obj);
            //     obj.id=obj.caid;
            //     obj.active=false;
                // obj.marketValue=obj.stock_value+obj.futures_value;
                //
                // if (obj.totalintFuture) {
                //     obj.futures_risk=obj.totalmargin/obj.totalintFuture;
                // } else {
                //     obj.futures_risk="—";
                // }
            //     obj.investmentFunds = [];
            //     obj.investmentOthers = [];

            //     formatProductFundToMoney(obj);
            // });
            //

            if ($scope.currentActiveProduct.active) {
                var tIndex=cms.binarySearch($scope.managerProductDetails,"id",$scope.currentActiveProduct.id);
                if (tIndex != -1 ) {
                    $scope.currentActiveProduct=$scope.managerProductDetails[tIndex];
                    $scope.managerProductDetails[tIndex].active=true;
                }
            }
            console.log("获取对应资产管理人下的产品-----");
            console.log($scope.managerProductDetails);
            $scope.getProductSubject(unit);
            $scope.$apply();
        });
    }

    function formatProductFundToMoney( product ) {
        if (!isNaN(product.futures_risk)) {
            product.futures_riskStr= formatMoney(product.futures_risk*100)+"%" ;
        } else {
            product.futures_riskStr= "—" ;
        }

    }

    function formatTatrdHoldToMoney( product ) {
        if (!isNaN(product.futures_risk)) {
            product.futures_riskStr= formatMoney(product.futures_risk*100)+"%" ;
        } else {
            product.futures_riskStr= "—" ;
        }

    }

    function parseProductFundInfo(obj) {
        obj.caid=parseInt(obj.caid);
        obj.maid=parseInt(obj.maid);
        // obj.fee=parseFloat(obj.fee / 10000);
        // obj.frozenamt=parseFloat(obj.frozenamt / 10000 );
        // obj.futures_validamt=parseFloat(obj.futures_validamt / 10000 );
        // obj.futures_value=parseFloat(obj.futures_value / 10000 );
        // obj.hold_closepl=parseFloat(obj.hold_closepl / 10000 );
        // obj.hold_posipl=parseFloat(obj.hold_posipl / 10000 );
        // obj.loan=parseFloat(obj.loan / 10000 );
        // obj.mtm_closepl=parseFloat(obj.mtm_closepl / 10000 );
        // obj.mtm_posipl=parseFloat(obj.mtm_posipl / 10000 );
        // obj.netvalue=parseFloat(obj.netvalue );
        // obj.preloan=parseFloat(obj.preloan);
        // obj.prenetvalue=parseFloat(obj.prenetvalue);
        // obj.pretotalamt=parseFloat(obj.pretotalamt / 10000 );
        // obj.pretotalint=parseFloat(obj.pretotalint / 10000 );
        // obj.prevailloan=parseFloat(obj.prevailloan / 10000 );
        // obj.sellmargin=parseFloat(obj.sellmargin  / 10000 );
        // obj.stock_validamt=parseFloat(obj.stock_validamt  / 10000 );
        // obj.stock_value=parseFloat(obj.stock_value  / 10000 );
        // obj.stockloan=parseFloat(obj.stockloan  / 10000 );
        // obj.totalint=parseFloat(obj.totalint  / 10000 );
        // obj.totalmargin=parseFloat(obj.totalmargin  / 10000 );
        // obj.validloan=parseFloat(obj.validloan  / 10000 );
        // obj.spifCap = parseFloat(obj.spifCap) / 10000;
        // obj.risk_exposure = parseFloat(obj.risk_exposure) / 10000;
        // obj.commodityFuturesCap = parseFloat(obj.commodityFuturesCap) / 10000;
        // obj.commodityFuturesNetting = parseFloat(obj.commodityFuturesNetting) / 10000;
        obj.totalint = parseFloat(obj.totalint) / 10000;
        obj.prenetvalue = parseFloat(obj.prenetvalue);
        obj.netvalue = parseFloat(obj.netvalue);
        obj.stockvalue = parseFloat(obj.stockvalue) / 10000;
        obj.hold_closepl = parseFloat(obj.hold_closepl) / 10000;
        obj.hold_posipl = parseFloat(obj.hold_posipl) / 10000;
        obj.mtm_closepl = parseFloat(obj.mtm_closepl) / 10000;
        obj.mtm_posipl = parseFloat(obj.mtm_posipl) / 10000;
        obj.management_rate = parseFloat(obj.management_rate);
        obj.totalmargin = parseFloat(obj.totalmargin) / 10000;
        obj.stock_validamt = parseFloat(obj.stock_validamt) / 10000;
        obj.futures_validamt = parseFloat(obj.futures_validamt) / 10000;
        obj.totalintFuture = parseFloat(obj.totalintFuture) / 10000;
        obj.stock_value = parseFloat(obj.stock_value) / 10000;
        obj.spifCap = parseFloat(obj.spifCap) / 10000;
        obj.risk_exposure = parseFloat(obj.risk_exposure) / 10000;
        obj.commodityFuturesCap = parseFloat(obj.commodityFuturesCap) / 10000;
        obj.commodityFuturesNetting = parseFloat(obj.commodityFuturesNetting) / 10000;
        obj.futRiskRatio = obj.futRiskRatio + "%";
    }

    $scope.getStrategyHold=function(caid) {
        monitorService.getStrategyHold({body:{caid:caid}}, function(res){
            console.log(res);
            console.log("+++++++++++++++++=");
            if(res.msret.msgcode != '00') {
                cms.message.error("获取产品的策略信息失败."+res.msret.msg);
                return;
            }
            $scope.strategyHold=res.body;

            var i = 0, j = 0,k = 0;
            var tradeUnitArray=newProductDetailsTree[0].children;

            for (; j < tradeUnitArray.length; j++, k = 0) {

                for (; i < $scope.strategyHold.length; i++) {
                    formatStrategyHold($scope.strategyHold[i]);

                    if ($scope.strategyHold[i].trid == tradeUnitArray[j].trid) {
                        var ukTypeArray=tradeUnitArray[j].children;
                        // insert Hold To UkType
                        for (; k < ukTypeArray.length; k++) {
                            if ($scope.strategyHold[i].majortype == ukTypeArray[k].majortype) {
                                var holdResult={ marketValue:0, hold_posipl:0, mtm_posipl:0, holdStockValue:0, spifCap:0, commodityFuturesCap:0, risk_exposure:0,
                                    commodityFuturesNetting:0, hadStock:false, hadSPIF:false, hadCommodityFutures:false};
                                handleHoldData(holdResult, $scope.strategyHold[i], ukTypeArray[k]);
                                formatTatrdHoldToMoney( $scope.strategyHold[i] );

                                //找到了对应的种类
                                while (i+1 < $scope.strategyHold.length &&
                                    $scope.strategyHold[i+1].trid == $scope.strategyHold[i].trid && // 此处可以写在j循环处
                                    $scope.strategyHold[i+1].majortype == $scope.strategyHold[i].majortype) {
                                        ++i;
                                        formatStrategyHold($scope.strategyHold[i]);
                                        handleHoldData(holdResult, $scope.strategyHold[i], ukTypeArray[k]);
                                        formatTatrdHoldToMoney( $scope.strategyHold[i] );
                                }

                                // 设置品种的信息
                                ukTypeArray[k].stockvalue=holdResult.stockvalue;
                                ukTypeArray[k].hold_posipl=holdResult.hold_posipl;
                                ukTypeArray[k].mtm_posipl=holdResult.mtm_posipl;
                                // ukTypeArray[k].stock_value=holdResult.holdStockValue;
                                // ukTypeArray[k].spifCap=holdResult.spifCap;
                                // ukTypeArray[k].commodityFuturesCap=holdResult.commodityFuturesCap;
                                // ukTypeArray[k].risk_exposure=holdResult.risk_exposure;
                                formatProductFundToMoney(ukTypeArray[k]);

                                // 设置策略的信息
                                tradeUnitArray[j].hadData=true;
                                // tradeUnitArray[j].hold_posipl += holdResult.hold_posipl;
                                // tradeUnitArray[j].mtm_posipl += holdResult.mtm_posipl;
                                // tradeUnitArray[j].stock_value += holdResult.holdStockValue;
                                // tradeUnitArray[j].spifCap += holdResult.spifCap;
                                // tradeUnitArray[j].commodityFuturesCap += holdResult.commodityFuturesCap;
                                // tradeUnitArray[j].commodityFuturesNetting += holdResult.commodityFuturesNetting;
                                // tradeUnitArray[j].risk_exposure += holdResult.risk_exposure;
                            } else if ($scope.strategyHold[i].majortype > ukTypeArray[k].majortype) {
                                continue;
                            } else {
                                break;
                            }
                        }

                    } else if ($scope.strategyHold[i].trid > tradeUnitArray[j].trid) {
                        break;
                    } else {
                        continue;
                    }
                }


            }

            for (var i = 0; i < tradeUnitArray.length; i++) {
                formatProductFundToMoney(tradeUnitArray[i]);
            }
            formatProductFundToMoney(newProductDetailsTree[0]);
            preorderTraversal(newProductDetails,newProductDetailsTree);

            setLastState(lastProductDetailsTree, newProductDetailsTree );
            $scope.productDetailsTree=newProductDetailsTree;
            $scope.productDetails=newProductDetails;
            console.log($scope.productDetails);
            console.log("&&&&&&&&&&&&&&&&&&&&");

            $scope.$apply();
        });
    }

    function setLastState(oldDataTree, newDateTree) {
        if (!oldDataTree || !oldDataTree.length || !newDateTree || !newDateTree.length ) {
            return ;
        }
        var i = 0, j = 0;
        for (; i < oldDataTree.length; i++) {
            for (; j < newDateTree.length; j++) {
                if (oldDataTree[i].id == newDateTree[j].id) {
                    newDateTree[j].show=oldDataTree[i].show;
                    newDateTree[j].showChildren=oldDataTree[i].showChildren;

                    if (oldDataTree[i].active) {
                        newDateTree[j].active=oldDataTree[i].active;
                        $scope.currentDataItem=newDateTree[j];
                    }

                    arguments.callee(oldDataTree[i].children, newDateTree[j].children);
                    ++j;
                    break;
                } else if (oldDataTree[i].id > newDateTree[j].id) {
                    continue;
                } else {
                    break;
                }
            }
        }
    }

    function handleHoldData(holdResult, holdData, destParent) {

        holdData.tier=3;
        holdData.show=destParent.showChildren;
        holdData.children=[];
        holdData.parent=destParent;
        var simbol = holdData.direction == 1 ? 1 : -1;

        if (holdData.majortype == 10) {
            if (holdData.totalvol && holdData.multiplier) {
                holdData.singleHoldCost = holdData.holdcost / holdData.totalvol / holdData.multiplier;
                holdData.singleMtmcost = holdData.mtmcost / holdData.totalvol / holdData.multiplier;
            } else {
                holdData.singleHoldCost = 0;
                holdData.singleMtmcost = 0;
            }

            holdData.stockvalue = holdData.totalvol * holdData.price * holdData.multiplier ;

            // var tmpValue = holdData.stockvalue;
            //
            // holdData.totalvol = holdData.totalvol * holdData.simbol;
            // holdData.hold_posipl = (holdData.marketValue - holdData.holdcost) * holdData.simbol;
            // holdData.mtm_posipl = (holdData.marketValue - holdData.mtmcost) * holdData.simbol ;

            // holdResult.risk_exposure += tmpValue; //敞口
            // holdResult.marketValue +=  tmpValue;
            holdData.hold_posipl = (holdData.stockvalue - holdData.holdcost) * simbol;
            holdData.mtm_posipl = (holdData.stockvalue - holdData.mtmcost) * simbol;

            holdResult.hold_posipl +=  holdData.hold_posipl;
            holdResult.mtm_posipl +=  holdData.mtm_posipl;

            // if (holdData.minortype == 1) { //股指期货
            //     holdResult.spifCap += holdData.marketValue;
            //     holdResult.hadSPIF=true;
            // } else if (holdData.minortype == 2) { //商品期货
            //     holdResult.hadCommodityFutures=true;
            //     holdResult.commodityFuturesCap += holdData.marketValue; //商品期货市值
            //     holdResult.commodityFuturesNetting += tmpValue
            // }

        } else {

            if (holdData.totalvol ) {
                holdData.singleHoldCost = holdData.holdcost / holdData.totalvol;
                holdData.singleMtmcost = holdData.mtmcost / holdData.totalvol;
            } else {
                holdData.singleHoldCost = 0;
                holdData.singleMtmcost = 0;
            }

            holdResult.hadStock=true;
            holdData.stockvalue = holdData.totalvol * holdData.price ;

            holdData.hold_posipl = (holdData.stockvalue - holdData.holdcost) * simbol;
            holdData.mtm_posipl = (holdData.stockvalue - holdData.mtmcost) * simbol;

            holdResult.hold_posipl +=  holdData.hold_posipl;
            holdResult.mtm_posipl +=  holdData.mtm_posipl;
        }

        destParent.children.push(holdData);   //找到了对应的种类

    }

    function preorderTraversal(destArray, srcArray) {
        if (!srcArray) {
            return;
        }
        for (var i = 0; i < srcArray.length; i++) {
            destArray.push(srcArray[i]);
            if (srcArray[i].children && srcArray[i].children.length) {
                preorderTraversal(destArray, srcArray[i].children);
            }
        }
    }

    function formatStrategyHold(destObj) {
        destObj.trid=parseInt(destObj.trid);
        destObj.acid=parseInt(destObj.acid);
        destObj.caid=parseInt(destObj.caid);
        destObj.maid=parseInt(destObj.maid);
        destObj.tracid=parseInt(destObj.tracid);
        destObj.currencyid==parseInt(destObj.currencyid);
        destObj.id=destObj.marketcode;
        destObj.name=destObj.chabbr+"("+destObj.marketcode+")";

        destObj.pretotalvol=parseInt(destObj.pretotalvol);
        destObj.premtmcost=parseFloat(destObj.premtmcost);
        destObj.preholdcost=parseFloat(destObj.preholdcost);
        destObj.precumcost=parseFloat(destObj.precumcost);

        destObj.overnightvol=parseFloat(destObj.overnightvol);
        destObj.totalvol=parseFloat(destObj.totalvol);
        destObj.validvol=parseFloat(destObj.validvol);
        destObj.onwayvol=parseFloat(destObj.onwayvol);
        destObj.frozenamt=parseFloat(destObj.frozenamt);
        destObj.usedbp=parseFloat(destObj.usedbp);
        destObj.pendingbuyvol=parseFloat(destObj.pendingbuyvol);

        destObj.pendingbuyamt=parseFloat(destObj.pendingbuyamt);
        destObj.pendingsellvol=parseFloat(destObj.pendingsellvol);
        destObj.pendingsellamt=parseFloat(destObj.pendingsellamt);
        destObj.lockvalidvol=parseFloat(destObj.lockvalidvol);
        destObj.lockonwayvol=parseFloat(destObj.lockonwayvol);
        destObj.valid_cre_redemp_vol=parseFloat(destObj.valid_cre_redemp_vol);

        destObj.covered_frz_vol=parseFloat(destObj.covered_frz_vol);
        destObj.buyvol=parseFloat(destObj.buyvol);
        destObj.sellvol=parseFloat(destObj.sellvol);
        destObj.buyamt=parseFloat(destObj.buyamt);

        destObj.sellamt=parseFloat(destObj.sellamt);
        destObj.mtmclosepl=parseFloat(destObj.mtmclosepl);
        destObj.holdclosepl=parseFloat(destObj.holdclosepl);
        destObj.mtmcost=parseFloat(destObj.mtmcost);
        destObj.price=parseFloat(destObj.price);
        destObj.trdfee=parseFloat(destObj.trdfee);
        destObj.tractfee=parseFloat(destObj.tractfee);
    }

    $scope.clickFold=function(role) {
        role.showChildren=!role.showChildren;
        setShow(role,role.showChildren);
    }

    function setShow(obj,show) {
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

    }

    function formatMoney(s, n){
       if (isNaN(s)) {
         return '';
       }

        s = parseFloat((s + "").replace(/[^\d\.-]/g, ""));//转化成数字
        if (isNaN(s)) {
          return '';
        }

        if(s<0.01&&s>-0.01){
          return "0.00";
        }

        n = n > 0 && n <= 20 ? n : 2;
        s=s.toFixed(n) ;

        var result='';
        if (s[0] == '-') {
          result='-';
          s=s.slice(1);
        }
        s=s.split(".");
        var integerStr = s[0];//整数部分
        var decimalsStr = s[1];//小数部分

        result+=toThousands(integerStr)+'.'+decimalsStr;

        return result;
     }


     function toThousands(num) {
       var num = (num || 0).toString(), result = '';
       while (num.length > 3) {
           result = ',' + num.slice(-3) + result;
           num = num.slice(0, num.length - 3);
       }
       if (num) { result = num + result; }
       return result;
     }

    $scope.foldStrategy=function() {
        if (!$scope.productDetailsTree.length) {
            return ;
        }

        $scope.foldStrategyState=!$scope.foldStrategyState;
        if ($scope.foldStrategyState) {
            $scope.foldStrategyDesc="折叠策略栏";
        } else {
            $scope.foldStrategyDesc="打开策略栏";
        }

        var tradeUnitArray=$scope.productDetailsTree[0].children;
        console.log($scope.foldStrategyState, '折叠状态');
        console.log($scope.productDetailsTree);
        console.log('++++++++++++++++++++');
        console.log(tradeUnitArray);
        console.log('____________________');
        tradeUnitArray.forEach(function(obj) {
            obj.showChildren=$scope.foldStrategyState;
            setShow(obj, obj.showChildren);
        });

    }
    $scope.getProductNet = function(product, isDetailChart) {

        monitorService.getProductNet({body:{caid:product.caid}},function(res) {
            if(res.msret.msgcode != '00') {
                cms.message.error("获取产品的所有净值失败."+res.msret.msg);
                return;
            }
            $scope.productNets=res.body;
            $scope.createEchartsOption(res.body);
            if (isDetailChart) {
                monitorDetailEcharts.setOption(echartDetailOption);
            } else {
                monitorPreviewEcharts.setOption(echartPreviewOption);
            }



        });
    }

    $scope.createEchartsOption =  function (productNets) {
        if (!productNets.length) {
            echartDetailOption = {
                title: {
                    text: $scope.currentProduct.caname
                },
                dataZoom: [{
                    type: 'inside',
                    xAxisIndex: 0 ,
                    start: 0,
                    end: 100
                }],
                xAxis: {
                        data: []
                },
                yAxis: {
                        max:1,
                        interval:0.2,
                        min:0
                },
                series: [{
                          name: '净值',
                          data: []
                        }]
                };

            echartPreviewOption = {

                xAxis: {
                        data: []
                },
                yAxis: {
                        max:1,
                        interval:0.2,
                        min:0
                },
                series: [{
                          name: '净值',
                          data: []
                        }]
                }
                return;
        }

        minNet = productNets[0].netvalue;
        maxNet = productNets[0].netvalue;
        var netDateForChart=[],netValueForChart=[];

        productNets.forEach(function(netData) {
            netData.netvalue =isNaN(netData.netvalue) ? 0 : parseFloat(netData.netvalue);
            netDateForChart.push(netData.trday);
            netValueForChart.push(netData.netvalue);
            if (netData.netvalue < minNet) {
                minNet = netData.netvalue;
            }
            if (netData.netvalue > maxNet) {
                maxNet = netData.netvalue;
            }
        });


        //数据显示在不顶格的位置
        if (maxNet<=0 || minNet<0) {
            var option={
                max:1,
                interval:0.2
            };
        }else{
            var option=getMaxAndMinInterval(maxNet,minNet);
        }
        echartDetailOption={
            title: {
                text: $scope.currentProduct.caname
            },
            dataZoom: [{
                type: 'inside',
                xAxisIndex: 0 ,
                start: 0,
                end: 100
            }],
            xAxis: {
                data: netDateForChart
            },
            yAxis: {
                max:option.max,
                interval:option.interval,
                min:option.min
            },
            series: [{
                name: '净值',
                data: netValueForChart
                }]
        };

        echartPreviewOption={
            xAxis: {
                data: netDateForChart
            },
            yAxis: {
                max:option.max,
                interval:option.interval,
                min:option.min
            },
            series: [{
                name: '净值',
                data: netValueForChart
                }]
        };

    }

    $scope.showProductNet = function(product) {
        if ($scope.currentProduct != product) {
            $scope.getProductNet(product,true);
        } else {
            monitorDetailEcharts.setOption(echartDetailOption);
        }
        $scope.currentProduct = product;

        mainService.showModal("monitor_modal_back","monitor_detail_modal","monitor_detail_modal_title");

    }

    $scope.monitorLoadModalReady = function() {
        switch ($scope.modalInfo.state) {
            case "detail":
                mainService.showModal("monitor_modal_back","monitor_detail_modal","monitor_detail_modal_title");

                break;
            case "preview":
                mainService.showModal("monitor_modal_back","monitor_preview_modal","monitor_preview_modal_title");

                break;
            default:

        }
    }

    $scope.hideMonitorModal = function () {
            mainService.hideModal("monitor_modal_back","monitor_preview_modal","monitor_preview_modal_title");
    }


    $scope.getMousePos=function(product,event) {
        if ($scope.currentProduct != product) {
            $scope.getProductNet(product,false);
        } else {
            monitorPreviewEcharts.setOption(echartPreviewOption);
        }
        $scope.currentProduct = product;

        $scope.showPreviewNetChart=true;
        var perviewModal = document.getElementById("monitor_preview_modal");
        perviewModal.style.left = event.x - 250 + "px";
        perviewModal.style.top = event.y + 20 + "px";


     }

     $scope.mouseOut=function() {
       $scope.showPreviewNetChart=false;

     }
});
