var express = require('express')
var router = express.Router()
var db = require('../../db.js')
var http = require('http')
var request = require('request')
var cheerio = require('cheerio') // node 的jquery
var iconv = require('iconv-lite') //转码
let charset = require('superagent-charset'); //解决乱码问题:
var async = require('async'); //异步编程

var time = [20180115]

function getData() {
    for (let i = 0; i < 100000000 / 1000; i++) {
        request('http://wap.eastmoney.com/3g/news/article,8,344,1,' + time + i + '.shtml', function(error, response, body) {
            if (!error && response.statusCode == 200) {
                // $ = cheerio.load(body)
                console.log(1)
            }
        })
    }

}

async.map(time, function(num) { //异步循环
    console.log(num)
    getData(num) //爬取用户所有微博
}, function(err, results) {
    if (err) {
        console.log(err)
    } else {}
})