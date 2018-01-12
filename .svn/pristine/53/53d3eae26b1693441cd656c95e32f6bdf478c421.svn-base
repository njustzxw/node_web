var express = require('express')
var router = express.Router()
var db = require('../db.js')
router.get('/calendar', function (req, res, next) { // 日历数据
  let type = req.query.type
  let time = req.query.time
  console.log(type, time)
  if (type == 'tfp') { // 停复牌
    var tfp_data = {}
    db.query(`select date,stopList,recoverList from calendar where date like '${time}%'`, function (err, rows) { // 查询最近更新时间
      if (err) {
        console.log(err)
      }else {
        for (let i in rows) {
          let stopList = JSON.parse(rows[i].stopList)
          let recoverList = JSON.parse(rows[i].recoverList) 
          if (stopList.length && recoverList.length) {
            var obj_per = {stopnum: '',stopeg: '',recovernum: '',recovereg: ''}
            var date = rows[i].date
            obj_per.stopnum = stopList.length; // 停牌数量
            obj_per.stopeg = stopList.length > 0 ? stopList[0].name : 'null'; // 列表中第一个股票名称
            obj_per.recovernum = recoverList.length; // 复牌数量
            obj_per.recovereg = recoverList.length > 0 ? recoverList[0].name : 'null'; // 列表中第一个股票名称
            tfp_data[date] = obj_per
          }
        }
      // console.log(tfp_data)
      }
      res.send({data: tfp_data, status: 1})
    })
  } else if (type == 'xgss') { // 首发新股
    var xgss_data = {}
    db.query(`select date,startList,addNewStockNetPublishList from calendar where date like '${time}%'`, function (err, rows) {
      if (err) {
        console.log(err)
      }else {
        for (let i in rows) {
          let startList = JSON.parse(rows[i].startList)
          let addNewStockNetPublishList = JSON.parse(rows[i].addNewStockNetPublishList)
          if (startList.length && addNewStockNetPublishList.length) {
            var obj_per = {startnum: '',starteg: '',addNewStocknum: '',addNewStockeg: ''}
            var date = rows[i].date
            obj_per.startnum = startList.length; // 停牌数量
            obj_per.starteg = startList.length > 0 ? startList[0].name : 'null'; // 列表中第一个股票名称
            obj_per.addNewStocknum = addNewStockNetPublishList.length; // 复牌数量
            obj_per.addNewStockeg = addNewStockNetPublishList.length > 0 ? addNewStockNetPublishList[0].name : 'null'; // 列表中第一个股票名称
            xgss_data[date] = obj_per
          }
        }
        console.log(xgss_data)
      }
      res.send({data: xgss_data, status: 1})
    })
  } else if (type == 'jyts') {
    var jyts_data = {}
    db.query(`select date,stockholderList,shareRegistList, shareDividendList,stockAlarmList from calendar where date like '${time}%'`, function (err, rows) { // 查询最近更新时间
      if (err) {
        console.log(err)
      }else {
        for (let i in rows) {
          let stockholderList = JSON.parse(rows[i].stockholderList)
          let shareRegistList = JSON.parse(rows[i].shareRegistList)
          let shareDividendList = JSON.parse(rows[i].shareDividendList)
          let stockAlarmList = JSON.parse(rows[i].stockAlarmList)
          if (stockholderList.length) {
            var obj_per = { stockholdrenum: '', stockholdereg: '', shareRegisnum: '', shareRegiseg: '',shareDividendnum: '',shareDividendeg: '',stockAlarmnum: '',stockAlarmeg: ''}
            var date = rows[i].date
            obj_per.stockholdrenum = stockholderList.length; // 股东资格登记日列表
            obj_per.stockholdereg = stockholderList.length > 0 ? stockholderList[0].name : 'null'; // 列表中第一个股票名称
            obj_per.shareRegisnum = shareRegistList.length; // 分红转增股权登记列表
            obj_per.shareRegiseg = shareRegistList.length > 0 ? shareRegistList[0].name : 'null'; // 列表中第一个股票名称
            obj_per.shareDividendnum = shareDividendList.length; // 除权除息列表
            obj_per.shareDividendeg = shareDividendList.length > 0 ? shareDividendList[0].name : 'null'; // 列表中第一个股票名称
            obj_per.stockAlarmnum = stockAlarmList.length; // 退市风险警示列表
            obj_per.stockAlarmeg = stockAlarmList.length > 0 ? stockAlarmList[0].name : 'null'; // 列表中第一个股票名称
            jyts_data[date] = obj_per
          }
        }
        console.log(jyts_data)
      }
      res.send({data: jyts_data, status: 1})
    })
  }
})
router.get('/modalcalendar', function (req, res, next) { // 获取弹框
  let type = req.query.type
  let time = req.query.time
  console.log(type, time)
  db.query(`select ${type} from calendar where date ='${time}'`, function (err, rows) {
    if (err) {
      console.log(err)
    }else {
      let obj = JSON.parse(rows[0][type])
      res.send({data: obj, status: 1})
    }
  })
})
module.exports = router
