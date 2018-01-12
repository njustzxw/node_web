var express = require('express')
var router = express.Router()
var db = require('../db.js')
var http = require('http')
var request = require('request')
var cheerio = require('cheerio') // node 的jquery
var iconv = require('iconv-lite') //转码
let charset = require('superagent-charset'); //解决乱码问题:
let superagent = require('superagent'); //发起请求
// var YQL = require("yql");
// var jsdom = require('jsdom')
charset(superagent);

router.get('/getcalendardata', function(req, res, next) { // 获取日历数据
    const time = req.query.time
    db.query(`select updatetime from calendar limit 1`, function(err, rows) { // 查询最近更新时间
        if (err) {
            console.log(err.message)
            return
        } else {
            if (rows[0]) { // 如果表不为空
                lasttime = rows[0].updatetime // 上次更新时间
                get_time_arr(lasttime)
            } else {
                get_time_arr(1483200000000); // 如果表为空则从这个时刻开始 2017-01-01
            }
        }
    })
    const get_time_arr = (lasttime) => { // 获取数据更新                      
        console.log('开始：' + lasttime)
        console.log('结束：' + time)
        let startTime = new Date(Number(lasttime) + 86400000); // 开始循环时间（从下一天开始）
        let endTime = new Date(Number(time)); // 结束循环的时间
        let daynum = 0
        while (endTime.getTime() >= startTime.getTime()) {
            var year = startTime.getFullYear()
            var month = (startTime.getMonth() + 1).toString().length == 1 ? '0' + (startTime.getMonth() + 1).toString() : (startTime.getMonth() + 1)
            var day = startTime.getDate().toString().length == 1 ? '0' + startTime.getDate() : startTime.getDate()
            var datetime = year + '' + month + '' + day
            console.log(datetime)
            get_final_data(datetime)
            startTime.setDate(startTime.getDate() + 1)
            daynum++
        }
        updatenum(daynum, 'calendar') // 更新的记录数，更新的字段
    }

    const get_final_data = (datetime) => { // 获取数据
        http.get('http://route.showapi.com/131-57?date=' + datetime + '&showapi_appid=51699&showapi_sign=423c642aaf344e5b876ed34167f60c91', function(result) {
            //   console.log(result.statusCode)
            var size = 0
            var chunks = []
            result.on('data', function(chunk) {
                size += chunk.length
                chunks.push(chunk)
            })
            result.on('end', function() {
                var data = Buffer.concat(chunks, size)
                var all_data = JSON.parse(data).showapi_res_body
                if (all_data.ret_code == 0) {
                    var date = JSON.stringify(all_data.date)
                    var stopList = JSON.stringify(all_data.stopList); // 停牌股票列表
                    var recoverList = JSON.stringify(all_data.recoverList); // 复牌股票列表
                    var startList = JSON.stringify(all_data.startList); // 首发上市股票列表
                    // var newStockNetPublishList = JSON.stringify(all_data.newStockNetPublishList); // 首发新股网上发行列表
                    var stockholderList = JSON.stringify(all_data.stockholderList); // 股东资格登记日列表
                    var addNewStockNetPublishList = JSON.stringify(all_data.addNewStockNetPublishList); // 增发新股上市列表
                    var shareRegistList = JSON.stringify(all_data.shareRegistList); // 分红转增股权登记列表
                    var shareDividendList = JSON.stringify(all_data.shareDividendList); // 除权除息列表
                    var stockAlarmList = JSON.stringify(all_data.stockAlarmList); // 退市风险警示列表
                    var updatetime = new Date().getTime(); // 最近更新时间
                    //   console.log(JSON.stringify(JSON.parse(data).showapi_res_body))
                    db.query(`insert into calendar(date,stopList,recoverList,startList,stockholderList,addNewStockNetPublishList,shareRegistList,shareDividendList,stockAlarmList,updatetime) values(${date},'${stopList}','${recoverList}','${startList}','${stockholderList}','${addNewStockNetPublishList}','${shareRegistList}','${shareDividendList}','${stockAlarmList}',${updatetime})`, function(err, rows) {
                        if (err) {
                            console.log(err)
                            res.send({ status: '获取数据出错' })
                        } else {}
                    })
                } else { // 当天没有数据的情况
                    var date1 = (datetime.slice(0, 4)) + '-' + (datetime.slice(4, 6)) + '-' + (datetime.slice(6))
                    db.query(`insert into calendar(date,stopList,recoverList,startList,stockholderList,addNewStockNetPublishList,shareRegistList,shareDividendList,stockAlarmList,updatetime) values('${date1}','[]','[]','[]','[]','[]','[]','[]','[]','[]')`, function(err, rows) {
                        if (err) {
                            console.log(err)
                            res.send({ status: '获取数据出错' })
                        } else {}
                    })
                    console.log(all_data, datetime)
                }
            })
        }).on('error', function(e) {
            console.log('Got error: ' + e.message)
        })
    }
    const updatenum = (num, table) => { // 更新记录数
        db.query(`select * from datalog order by date desc limit 1`, function(err, rows) { // 获取最近的更新纪录
            if (err) {
                console.log(err)
                res.send({ status: '更新记录数出错' })
            } else {
                let calendar = Number(rows[0].calendar)
                let yuqing = rows[0].yuqing
                let financeEvent = rows[0].financeEvent
                let stock = rows[0].stock
                var date = new Date().getTime(); // 时间戳
                var bz_date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() + ''
                    // console.log(bz_date)
                if (num == 0) {
                    res.send({ status: 'cf', num: num, updatetime: date })
                } else {
                    db.query(`insert into datalog(date,bz_date,chgitem,calendar,yuqing,financeEvent,stock)values(${date},'${bz_date}','calendar',${num + calendar},${yuqing},${financeEvent},${stock})`, function(err1, rows1) {
                        if (err1) {
                            console.log(err1)
                        } else {
                            res.send({ status: 'success', num: num, updatetime: date })
                            console.log('更新记录数成功')
                        }
                    })
                }
            }
        })
    }
})
router.get('/clearcalendardata', function(req, res, next) { // 清除日历数据
    db.query(`delete from calendar`, function(err, row) {
        if (err) {
            console.log(err)
        } else {
            console.log('表calendar已清空')
            res.send({ status: '已清空', table: 'calendar' })
        }
    })
})
router.get('/getnews', function(req, res, next) {
    let website = req.query.website;
    if (website == 'zjzx') {
        request('http://3g.cnfol.com/sc_stock/gushizhibo/', function(error, response, body) {
            if (!error && response.statusCode == 200) {
                $ = cheerio.load(body)
                console.log($('#List1 li').length)
                var arr = []
                for (var i = 0; i < $('#List1 li').length; i++) {
                    var obj = {}
                    obj.title = $($('#List1 li .Item-Title a')[i]).text()
                    obj.time = $($('#List1 li time')[i]).text()
                    obj.imgurl = $($('#List1 li img')[i]).attr('src')
                    obj.link = $($('#List1 li .Item-Title a')[i]).attr('href')
                    arr.push(obj)
                }
                res.send({
                    num: $('#List1 li').length,
                    data: arr
                })
            }
        })
    } else if (website == 'dfcf') {
        request('http://stock.eastmoney.com/news/cgszb.html', function(error, response, body) {
            if (!error && response.statusCode == 200) {
                $ = cheerio.load(body)
                console.log($('#newsListContent li').length)
                var arr = []
                for (var i = 0; i < $('#newsListContent li').length; i++) {
                    var obj = {}
                    obj.title = $($('#newsListContent li .title a')[i]).text()
                    obj.info = $($('#newsListContent li .info')[i]).text()
                    obj.time = $($('#newsListContent li .time')[i]).text()
                    obj.link = $($('#newsListContent li .title a')[i]).attr('href')
                    arr.push(obj)
                }
                res.send({
                    num: $('#newsListContent li').length,
                    data: arr
                })
            }
        })
    } else if (website == 'ths') { //gbk的编码方式
        superagent
            .get('http://news.10jqka.com.cn/today_list/')
            .charset('gbk') //取决于网页的编码方式
            .end(function(error, response) {
                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(response.text);
                    console.log($('.list-con ul li').length)
                    var arr = []
                    for (var i = 0; i < $('.list-con ul li').length; i++) {
                        var obj = {}
                        obj.title = $($('.list-con ul li .arc-title a')[i]).text()
                        obj.info = $($('.list-con ul li>a')[i]).text()
                        obj.time = $($('.list-con ul li .arc-title span')[i]).text()
                        obj.link = $($('.list-con ul li .arc-title a')[i]).attr('href')
                        arr.push(obj)
                    }
                    console.log(arr)
                    res.send({
                        num: $('.list-con ul li').length,
                        data: arr
                    })
                }
            })
    } else if (website == 'xlcj') {
        request('http://live.sina.com.cn/zt/f/v/finance/globalnews1', function(error, response, body) {
            if (!error && response.statusCode == 200) {
                $ = cheerio.load(body)
                console.log($('.bd_list div').length)
                let arr = []
                for (let i = 0; i < Math.min($('.bd_list div').length, 15); i++) {
                    let obj = {}
                    let content = $($('.bd_list .bd_i_txt_c')[i]).text()
                    if (content.indexOf('【') == 0) {
                        obj.title = content.slice(1, content.indexOf('】'))
                        obj.info = content.slice(content.indexOf('】') + 1, content.length)
                    } else {
                        obj.title = '';
                        obj.info = content
                    }
                    obj.time = $($('.bd_list .bd_i_time_c ')[i]).text()
                    arr.push(obj)
                }
                res.send({
                    num: $('.bd_list div').length,
                    data: arr
                })
            }
        })
    }
})
router.get('/gethistorynews', function(req, res, next) { // 获取新浪财经热门新闻
    const time = req.query.time
    let startTime = new Date(new Date(2014, 5, 1).getTime()); // 开始循环时间 20140101     1388505600000    1513008000000(1222)
    let endTime = new Date(Number(time)); // 结束循环的时间
    // let endTime = new Date(1514736000000)
    let daynum = 0;
    let Datearr = []
    while (endTime.getTime() >= startTime.getTime()) {
        var year = startTime.getFullYear()
        var month = (startTime.getMonth() + 1).toString().length == 1 ? '0' + (startTime.getMonth() + 1).toString() : (startTime.getMonth() + 1)
        var day = startTime.getDate().toString().length == 1 ? '0' + startTime.getDate() : startTime.getDate()
        var datetime = year + '' + month + '' + day
        Datearr.push(datetime)
        startTime.setDate(startTime.getDate() + 1)
        daynum++;
    }
    console.time("运行时间：");
    for (let i in Datearr) {
        console.log(Datearr[i])
        var url = 'http://top.finance.sina.com.cn/ws/GetTopDataList.php?top_type=day&top_cat=finance_0_suda&top_time=' + Datearr[i] + '&top_show_num=20&top_order=DESC&js_var=all_1_data&get_new=1'
        request(url, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = decodeUnicode(body.slice(17, body.length - 2))
                    // console.log(data)
                var daydata = JSON.parse(data).data
                for (var i = 0; i < daydata.length; i++) {
                    let url = daydata[i].url.replace(/%/g, '')
                    let id = daydata[i].top_time + '-' + ((i + 1) >= 10 ? '' + (i + 1) + '' : '0' + '' + (i + 1) + '')
                    db.query(`insert into hotnews(id,rank,create_date,create_time,title,media,url) values('${id}',${i+1},'${daydata[i].create_date}','${daydata[i].create_time}','${daydata[i].title}','${daydata[i].media}','${url}')`, function(err, rows) {
                        if (err) {
                            console.log(err)
                        } else {}
                    })
                }
            }
        })
    }
    console.timeEnd("运行时间：");
    console.log('数据量：' + 20 * daynum)

    function decodeUnicode(str) {
        str = str.replace(/\\u/g, '%u');
        return unescape(str);
    }
})
module.exports = router