/*+++++++++++++++++++++++++++++++++
东方财富要闻
因为东财的摘要做得比较好，所以暂时只抓取摘要
++++++++++++++++++++++++++++++++++++*/
var express = require('express')
var router = express.Router()
var db = require('../../db.js')
var http = require('http')
var request = require('request')
var cheerio = require('cheerio') // node 的jquery
var iconv = require('iconv-lite') //转码
let charset = require('superagent-charset'); //解决乱码问题:
let superagent = require('superagent'); //发起请求
var async = require('async'); //异步编程
charset(superagent);


var arr = []
for (let i = 1; i <= 20; i++) {
    arr.push(i)
}
async.map(arr, function(num) { //异步循环
    console.log(num)
    getData(num)
}, function(err, results) {
    if (err) {
        console.log(err)
    } else {}
})

function getData(page, time) {
    request('http://newsapi.eastmoney.com/kuaixun/v1/getlist_101_ajaxResult_50_' + page + '_.html?r=0.1351498085663858&_=' + new Date().getTime(), function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = decodeUnicode(body.slice(15, body.length))
            var alldata = JSON.parse(data)
                // console.log(alldata)
            if (!alldata.me) {
                var data = alldata.LivesList
                for (let i = 0; i < data.length; i++) {
                    var id = data[i].id //新闻id
                    var title = data[i].title
                    var zy = data[i].digest
                    var time = data[i].showtime
                    console.log(id, title, )
                    db.query(`insert into dc_yaowen(id,title,zy,time)values(${id},'${title}','${zy}','${time}')`, function(err1, rows1) {
                        if (err1) {
                            return
                        } else {}
                    })
                }
            }


        }
    })

}

function decodeUnicode(str) {
    str = str.replace(/\\u/g, '%u');
    return unescape(str);
}