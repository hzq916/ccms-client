angular.module('cmsService').factory("calendarService",function() {
	var service = {};
	service.getCalendar = function(params,callback) {
		cms.request("getCalendar",params,callback);
	}
	service.updateCalendar = function(params,callback) {
		cms.request('AltCalendar',params,callback);
	}
	service.loadCalendarToDb = function(params,callback) {
		cms.request('MakeCalendar',params,callback);
	}
	service.getMarket = function(params,callback) {
		cms.request('getMarket',params,callback);
	}
	service.makeCalendar = function(startDate,endDate,callback) {
		function getDate(datestr) {
	        var temp = datestr.split("-");
	        var date = new Date(temp[0], temp[1], temp[2]);
	        return date;
	    }

		function days(year, month, day) {
		    var days = 0;  //表示改日期为当年的第几天
		    //累加月天数
		    for(var i = 1; i < month; i++ ){
		        switch(i){
		            //大月的情况加31
		        case 1:
		        case 3:
		        case 5:
		        case 7:
		        case 8:
		        case 10:
		        case 12:{
		            days += 31;
		            break;
		        }
		        //小月的情况加30
		        case 4:
		        case 6:
		        case 9:
		        case 11:{
		            days += 30;
		            break;
		        }
		        //二月的情况，根据年类型来加
		        case 2:{
		            if(isLeapYear(year)){
		                days += 29; //闰年加29
		            }
		            else {
		                days += 28;
		            }
		            break;
		        }
		        }
		    }
		    day = day * 1;
		    days += day;  //月天数之和加上日天数

		    var date0 = new Date(year,0,1);   //当年的第一天是周几
		    //   alert(date0.getDay());
		    var date1 = new Date(year,month-1,day); //将日期值格式化,0-11代表1月-12月；
		    //   alert((days + date0.getDay()+6)/7);
		    var nthOfWeek = Math.floor((days + date0.getDay()+6)/7);  //向下取整
		    //   alert(nthOfWeek);
		    var toDay = new Array("sun","mon","thu","wen","thr","fri","sat");

		    return nthOfWeek.toString()

		    //day.getDay();根据Date返一个星期中的某其中0为星期日
		    //console.log("the day is year of "+days+"day\n"+" hahah"+nthOfWeek+"week"+toDay[date1.getDay()])
		    // alert("该日期是一年中的第"+days+"天\n"+"     是第"+nthOfWeek+"周的"+toDay[date1.getDay()]);
		}

		function isLeapYear(year) {
    		return (year % 400 == 0) || (year % 4 == 0 && year % 100 != 0);
		}

	    var startTime = getDate(startDate);
	    var endTime = getDate(endDate);

	    var importTrdayArr = []

	    var weekArr = ["日", "一", "二", "三", "四", "五", "六"]

	    var i = 0;

	    while((endTime.getTime()-startTime.getTime())>=0) {
	        var year = startTime.getFullYear();
	        var mon = (startTime.getMonth() + 1).toString()
	        var month = mon.length == 1 ? "0" + mon : mon;
	        var day = startTime.getDate().toString().length==1?"0"+startTime.getDate():startTime.getDate();
	        var weekno = days(year, parseInt(mon), day)
	        var dayofweek = startTime.getDay()
	        var trday = year.toString() + month.toString() + day.toString()
	        var week = weekArr[dayofweek]

	        var holiday = (dayofweek == "0" || dayofweek == "6") ? "1" : "0";
	        var comm = (dayofweek == "0" || dayofweek == "6") ? "周末" : "*";

	        importTrdayArr.push({trday: trday, weekno: weekno, dayofweek: dayofweek,
	                                showDayofweek: week, holiday: holiday, comm: comm})

	        startTime.setDate(startTime.getDate() + 1);
	    }
		var ret = {body:importTrdayArr};
		callback(ret);
	}
	return service;
})
