/*-----------------------------------

-------------------------------------*/
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
var key = '贾跃亭'
getNewsnum(key)

function getNewsnum(key) {
    var url = 'http://so.cnfol.com/cse/search?q=' + encodeURI(key) + '&s=12596448179979580087&nsid=1'
        // console.log(url)
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            $ = cheerio.load(body)
            var numstr = $('.support-text-top').text()
            var num = ''
            for (let i = 0; i < numstr.length; i++) {
                if (numstr[i] >= 0 && numstr[i] <= 9) {
                    // console.log(numstr[i])
                    num = num + numstr[i] + ''
                }
            }
            pagenum = Math.ceil(Number(num) / 10)
            var arr = []
            for (let i = 0; i < (pagenum - 1); i++) {
                arr.push(i)
            }
            // var arr = [0, 1, 2] //测试专用
            async.map(arr, function(page) { //异步循环
                getkey_news(page, key) //
            }, function(err, results) {
                if (err) {
                    console.log(err)
                } else {}
            })
        }
    })
}

function getkey_news(page, key) {
    var url = 'http://so.cnfol.com/cse/search?q=' + encodeURI(key) + '&s=12596448179979580087&nsid=1&p=' + page
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            $ = cheerio.load(body)
            for (let i = 0; i < $('.result').length; i++) {
                var title = $($('.c-title a')[i]).text()
                var url = $($('.c-title a')[i]).attr('href')
                var a = $($('.c-showurl')[i]).text()
                var time = a.slice(a.lastIndexOf(' ') + 1)
                var id = time + ' ' + url.slice(url.lastIndexOf('/') + 1, url.lastIndexOf('.'))
                db.query(`insert into zjzx_key_news(id,title,url,time)values('${id}','${title}','${url}','${time}')`, function(err1, rows1) {
                    if (err1) {
                        console.log(err1)
                        return
                    } else {}
                })
            }
        }
    })
}