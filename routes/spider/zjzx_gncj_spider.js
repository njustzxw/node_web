/*+++++++++++++++++++++++++++++++++
http://news.cnfol.com/zhengquanyaowen/
中金在线 国内财经新闻数据抓取 操作步骤
第一步 国内财经新闻的url 
第二步 根据第一步的url获取内容（ 使用第一个方法时注释掉第二个， 使用第二个方法时注释掉第一个，）
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
var pagenum = 38 //预定义的要抓去的页数


geturl() //第一步 国内财经新闻的url 
    // gettext() //第二步 根据第一步的url获取内容（使用第一个方法时注释掉第二个，使用第二个方法时注释掉第一个，）


function geturl() {
    var arr = []
    for (let i = 1; i < pagenum; i++) {
        arr.push(i)
    }
    async.map(arr, function(num) { //异步循环
        getData(num)
    }, function(err, results) {
        if (err) {
            console.log(err)
        } else {}
    })
}


function getData(num) {
    var url = 'http://app.cnfol.com/test/newlist_api.php?catid=1277&page=' + num + '& callback = callback & _ = 1516007340571 '
    request(url, function(error, response, body) {
        console.log(url)
        console.log(response.statusCode)
        if (!error && response.statusCode == 200) {
            var alldata = eval('(' + body.slice(1, body.length - 1) + ')');
            for (let j = 0; j < alldata.length; j++) {
                var id = alldata[j].ContId
                var title = alldata[j].Title
                var url = alldata[j].Url
                var createdTime = alldata[j].CreatedTime
                db.query(`insert into zjzx_guoneicaijing(id,title,url,time)values(${id},'${title}','${url}','${createdTime}')`, function(err1, rows1) {
                    if (err1) {
                        return
                    } else {}
                })
            }
        }
    })
}

function gettext() {
    db.query(`select url from zjzx_guoneicaijing`,
        function(err1, rows1) {
            var arr = []
            for (i in rows1) {
                arr.push(rows1[i].url)
                    // console.log(rows1[i].url)
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
    // console.log(url)
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            $ = cheerio.load(body)
            var text = $('.Article').text().replace(/\ +/g, "").replace(/[\r\n]/g, "").replace(/'/g, '’').slice(0, 9000) || $('#Content').text().replace(/\ +/g, "").replace(/'/g, '’').replace(/[\r\n]/g, "").slice(0, 9000)
                // console.log(url)
            db.query(`update zjzx_guoneicaijing set text = '${text}' where url = '${url}'`, function(err2, rows2) {
                if (err2) {
                    console.log(err2)
                    return
                } else {}

            })
        }
    })
}