var express = require('express')
var router = express.Router()
var db = require('../db.js')
var http = require('http')

router.get('/getcalendardata', function (req, res, next) { // 获取日历数据
  const time = req.query.time
  db.query(`select updatetime from calendar limit 1`, function (err, rows) { // 查询最近更新时间
    if (err) {
      console.log(err.message)
      return
    } else {
      if (rows[0]) { // 如果表不为空
        lasttime = rows[0].updatetime // 上次更新时间
        get_time_arr(lasttime)
      }else {
        get_time_arr(1513872000000); // 如果表为空则从这个时刻开始 2017-12-22
      }
    }
  })
  const get_time_arr = (lasttime) => { // 获取数据更新                      
    console.log('开始：' + lasttime)
    console.log('结束：' + time)
    let startTime = new Date(Number(lasttime) + 86400000); // 开始循环时间（从下一天开始）
    let endTime = new Date(Number(time)); // 结束循环的时间
    let daynum = 0
    while (endTime.getTime() >= startTime.getTime()){
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
    http.get('http://route.showapi.com/131-57?date=' + datetime + '&showapi_appid=51699&showapi_sign=423c642aaf344e5b876ed34167f60c91', function (result) {
      //   console.log(result.statusCode)
      var size = 0
      var chunks = []
      result.on('data', function (chunk) {
        size += chunk.length
        chunks.push(chunk)
      })
      result.on('end', function () {
        var data = Buffer.concat(chunks, size)
        var all_data = JSON.parse(data).showapi_res_body
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
        db.query(`insert into calendar(date,stopList,recoverList,startList,stockholderList,addNewStockNetPublishList,shareRegistList,shareDividendList,stockAlarmList,updatetime) values(${date},'${stopList}','${recoverList}','${startList}','${stockholderList}','${addNewStockNetPublishList}','${shareRegistList}','${shareDividendList}','${stockAlarmList}',${updatetime})`, function (err, rows) {
          if (err) {
            console.log(err)
            res.send({status: '获取数据出错'})
          }else {
            // console.log('success')
          }
        })
      })
    }).on('error', function (e) {
      console.log('Got error: ' + e.message)
    })
  }
  const updatenum = (num, table) => { // 更新记录数
    db.query(`select * from datalog order by date desc limit 1`, function (err, rows) { // 获取最近的更新纪录
      if (err) {
        console.log(err)
        res.send({status: '更新记录数出错'})
      }else {
        let calendar = Number(rows[0].calendar)
        let yuqing = rows[0].yuqing
        let financeEvent = rows[0].financeEvent
        let stock = rows[0].stock
        var date = new Date().getTime(); // 时间戳
        var bz_date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() + ''
        // console.log(bz_date)
        if (num == 0) {
          res.send({ status: 'cf', num: num, updatetime: date })
        }else {
          db.query(`insert into datalog(date,bz_date,chgitem,calendar,yuqing,financeEvent,stock)values(${date},'${bz_date}','calendar',${num + calendar},${yuqing},${financeEvent},${stock})`, function (err1, rows1) {
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
router.get('/clearcalendardata', function (req, res, next) { // 清除日历数据
  db.query(`delete from calendar`, function (err, row) {
    if (err) {
      console.log(err)
    }else {
      console.log('表calendar已清空')
      res.send({ status: '已清空',table: 'calendar'})
    }
  })
})
module.exports = router
