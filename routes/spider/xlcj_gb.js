/*-----------------------------------
    新浪财经股吧所有帖子
    http://guba.sina.com.cn/?s=bar&name=sz300104&page=100
    1.页数pagenum可以无限多，不会被封ip，等把所有数据都更新完之后，改成10，定期更新新的帖子
    2.66行的num 取值从100到900，每次增加100，出现封ip的现象，多运行几次gettext（），等把所有数据都更新完之后，改成最大值900，定期更新新的帖子
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
charset(superagent);
var code = 'sh600519' //茅台
var table = 'xlcj_gb' + '_' + code
var pagenum = 840 //834   页数

// getNewsnum(code, pagenum) //第一步（注释掉第二个方法）  
gettext() //第二步（注释掉第一个方法）

function getNewsnum(code, pagenum) { //手动查总页数
    // var url = 'http://guba.sina.com.cn/?s=bar&name=sz300104&page='+pagenum
    var arr = []
    for (let i = pagenum - 99; i <= pagenum; i++) {
        arr.push(i)
    }
    async.map(arr, function(page) { //异步循环
        getkey_news(page, code) //
    }, function(err, results) {
        if (err) {
            console.log(err)
        } else {}
    })

}

function getkey_news(page, code) {
    var url = 'http://guba.sina.com.cn/?s=bar&name=' + code + '&page=' + page
    superagent
        .get(url)
        .charset('gb2312') //取决于网页的编码方式
        .end(function(error, response) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(response.text);
                for (let i = 1; i < $('#blk_list_02 table tr').length; i++) {
                    var clicknum = $($($('#blk_list_02 table tr')[i]).find('td')[0]).text() //点击量
                    var url = 'http://guba.sina.com.cn' + $($('.linkblack ')[i]).attr('href') //url
                    var title = $($('.linkblack ')[i]).text().replace(/'/g, "’") //标题内容
                    var author = $($('.author')[i]).text() //作者
                    console.log(page, clicknum, url, title, author)
                    db.query(`insert into ${table}(title,url,fag,author,clicknum)values('${title}','${url}',${page},'${author}','${clicknum}')`, function(err1, rows1) {
                        if (err1) {
                            console.log(err1)
                            return
                        } else {}
                    })
                }
            }
        })
}

function gettext() {
    var num = 840
    db.query(`select url from ${table} where (text IS NULL or text = '') and fag between '${num-839}' and '${num}'`,
        function(err1, rows1) {
            var arr = []
            for (i in rows1) {
                arr.push(rows1[i].url)
            }
            console.log(arr.length)
            async.map(arr, function(url) { //异步循环
                getArticle(url) //
            }, function(err, results) {
                if (err) {
                    console.log(err)
                } else {}
            })
        })
}

function getArticle(url) {
    superagent
        .get(url)
        .charset('gb2312') //取决于网页的编码方式
        .end(function(error, response) {
            // console.log(response.statusCode)
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(response.text);
                var title = $('.ilt_tit').text()
                var text = $('#thread_content').text().replace(/\s+/g, "").replace(/'/g, "’").slice(0, 9000)
                var time1 = $('.iltp_time').text()
                var time = formate(time1)
                console.log(time, title, url)
                if (title) {
                    db.query(`update ${table} set time = '${time}', text = '${text}',title = '${title}' where url = '${url}'`, function(err2, rows2) {
                        if (err2) {
                            console.log(err2)
                            return
                        } else {}
                    })
                } else { //帖子删除的情况
                    db.query(`delete from ${table} where url = '${url}'`)
                }
            }
        })
}

function formate(date) {
    if (date[0] == 2) {
        return date.slice(0, 4) + '-' + date.slice(5, 7) + '-' + date.slice(8, 10) + ' ' + date.slice(11, 17)
    } else if (date[2] == '分' || date[1] == '分') {
        var time = new Date().getTime() - date.slice(0, date.indexOf('分')) * 60 * 1000
        return '2018' + '-' + new Date(time).getMonth() + 1 + '-' + new Date(time).getDate() + ' ' + Appendzero(new Date(time).getHours()) + ':' + Appendzero(new Date(time).getMinutes()) + ':' + '00'
    } else if (date[0] == '今') {
        return '2018' + '-' + new Date().getMonth() + 1 + '-' + new Date().getDate() + ' ' + date.slice(2)
    } else {
        return '2018' + '-' + date.slice(0, 2) + '-' + date.slice(3, 5) + ' ' + date.slice(7)
    }

}

function Appendzero(obj) {
    if (obj < 10) return "0" + "" + obj;
    else return obj;
}