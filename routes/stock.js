var express = require('express');
var router = express.Router();
var http = require('http');
//引入数据库包
router.get('/stock', function(req, res, next) {    //返回分时图数据
    var code = req.query.code;
    http.get("http://route.showapi.com/131-49?code="+code+"&day=1&showapi_appid=51699&showapi_sign=423c642aaf344e5b876ed34167f60c91", function(result) {
        let size = 0;
        let chunks = [];
        result.on('data', function(chunk){
            size += chunk.length;
            chunks.push(chunk);
        });
        result.on('end', function(){
            var datares = Buffer.concat(chunks, size);
            // console.log(datares.toString())
            var zd_arr = ['red'];
            const year = new Date().getFullYear();
            const month = new Date().getMonth()+1;
            const day =  new Date().getDate();
            var td_15_00 = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate(),15,0).getTime();
            var td_11_30 = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate(),11,30).getTime();
            var td_13_00 = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate(),13,0).getTime();
            var activity ={xData:[],datasets:[]}        //总数据
            var datas1 = {name:'分时',data:[],data_jj:[],unit:'元',type:'line',valueDecimals:2}    //分时图数据
            var datas2 = {name:'成交量',data:[],unit:'万股',type:'column',valueDecimals:2}   //柱状图数据
            var fsdata = JSON.parse(datares).showapi_res_body.dataList[0].minuteList;
            // console.log(fsdata)
            var open = fsdata[0]['nowPrice']
            for (let i = 0; i < fsdata.length; i++) {
                for (let item in fsdata[i]) {
                    if (item == "time") {
                        var hour = fsdata[i][item].slice(0, 2)
                        var minute = fsdata[i][item].slice(2, 4)
                        fsdata[i][item] = new Date(year, month-1,day, hour, minute).getTime();
                        activity.xData.push(fsdata[i][item])
                    }else if(item == "nowPrice"){       //分时图数据push  实时价格
                        datas1.data.push(Number(fsdata[i][item]))
                        // console.log(fsdata[i+1][item])
                        if(i  > 0){                      //颜色上色
                            if(fsdata[i][item] > fsdata[i-1][item]){
                                zd_arr.push('red')
                            }else{
                                zd_arr.push('green')
                            }
                        }
                    }else if(item == "avgPrice"){       //平均价格
                        datas1.data_jj.push(Number(fsdata[i][item]))
                    }else if (item == "volume") {     //柱状图数据push
                        datas2.data.push(Number(fsdata[i][item])/10000)  //单位：万股
                    }
                }
            }
            activity.datasets.push(datas1);
            activity.datasets.push(datas2);
            var last_time = activity.xData[activity.xData.length-1];  //已有数据的最新时间
            var time = last_time
            while(time<=td_15_00){       //没有数据的就push null
                if(time <= td_11_30||time >= td_13_00){
                    activity.xData.push(time)
                    activity.datasets[0].data.push(null)   //价格push
                    activity.datasets[0].data_jj.push(null)  //均价push
                    activity.datasets[1].data.push(null)     //成交量push
                }
                time = time + 60000
            }
            // console.log(activity)
            // res.send(datares.toString());  //传输的时候只能传string类型
            res.send({activity:activity,open:open,zd_arr:zd_arr})
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
});
router.get('/getCalendarData', function (req, res, next) {
    cosole.log(req.body.time)
    res.send({status: 'success'})
})
module.exports = router;