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
var code = '300104' //乐视

getNewsnum(code) //第一步（注释掉第二个方法）
    // gettext() //第二步（注释掉第一个方法）
function getNewsnum(code) {
    // var url = 'http://guba.eastmoney.com/list,' + code + ',99.html' //热帖
    var url = 'http://guba.eastmoney.com/list,' + code + ',1,f.html' //新闻
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            $ = cheerio.load(body)
            var num = Number($('.sumpage').text()) || 2
            console.log(num)
            var arr = []
            for (let i = 1; i <= num; i++) {
                arr.push(i)
            }
            // var arr = [0, 1, 2] //测试专用
            async.map(arr, function(page) { //异步循环
                getkey_news(page, code) //
            }, function(err, results) {
                if (err) {
                    console.log(err)
                } else {}
            })
        } else {
            console.log(err)
        }
    })
}

function getkey_news(page, code) {
    var url = 'http://guba.eastmoney.com/list,' + code + ',1,f_' + page + '.html' //新闻
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            $ = cheerio.load(body)
            for (let i = 0; i < $('.articleh').length; i++) {
                var ydl = $($('.articleh .l1')[i]).text() //阅读量
                var url = 'http://guba.eastmoney.com' + $($('.articleh .l3 a')[i]).attr('href') //url
                var title = $($('.articleh .l3 a')[i]).text() //标题内容
                var time = $($('.articleh .l6')[i]).text() //时间
                var id = url.slice(url.lastIndexOf(',') + 1, url.lastIndexOf('.'))
                console.log(time)
                db.query(`insert into dc_key_news(id,title,url,ydl)values('${id}','${title}','${url}','${ydl}')`, function(err1, rows1) {
                    if (err1) {
                        console.log(err1)
                        return
                    } else {}
                })
            }
        }
    })
}

function getkey_news(page, key) {
    var url = 'http://so.cnfol.com/cse/search?q=' + encodeURI(key) + '&s=12596448179979580087&nsid=1&p=' + page
    console.log(url)
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
                        // console.log(err1)
                        return
                    } else {}
                })
            }
        }
    })
}

function gettext() {
    db.query(`select url from dc_key_news where text IS NULL`,
        function(err1, rows1) {
            var arr = []
            for (i in rows1) {
                arr.push(rows1[i].url)
            }
            async.map(arr, function(url) { //异步循环
                getArticle(url) //爬取用户所有微博
            }, function(err, results) {
                if (err) {
                    console.log(err)
                } else {}
            })
        })
}

function getArticle(url) {
    console.log(url)
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            $ = cheerio.load(body)
                // var text = $('.Article').text().replace(/\ +/g, "").replace(/[\r\n]/g, "").replace(/'/g, '’').slice(0, 9000) || $('#Content').text().replace(/\ +/g, "").replace(/'/g, '’').replace(/[\r\n]/g, "").slice(0, 9000)
                // console.log(url)
            var time = $('.zwfbtime').text().slice(4, 23)
            console.log(time)
            db.query(`update dc_key_news set time = '${time}', text = '${text}' where url = '${url}'`, function(err2, rows2) {
                if (err2) {
                    console.log(err2)
                    return
                } else {}

            })
        }
    })
}