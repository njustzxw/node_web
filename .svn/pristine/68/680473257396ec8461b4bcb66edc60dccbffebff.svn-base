/*--------------------------------------------------------------
 指定某个用户的id  然后从weibo_person表中查找出该用户的所有微博id
 一般是先用allweibo_Spider 爬取出来用户的个人信息到person表里，在运行此文件
 -------------------------------------------------------------*/
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

var userid = 3055675935

/*--------------------------------------------------------------
 开始查找
 -------------------------------------------------------------*/
db.query(`select weiboid from weibo_person where userid = ${userid}`, function(err, rows) { // 查询最近更新时间
    if (err) {
        console.log(err.message)
        return
    } else {
        var idArr = []
        for (let i = 0; i < rows.length; i++) {
            idArr.push(rows[i].weiboid)
        }
        // console.log(idArr)
        async.map(idArr, function(id) { //异步循环
            // console.log(id)
            get_comment_data_num(id) //爬取用户所有微博数量
        }, function(err, results) {
            console.log(results);
        })
    }
})
var get_comment_data_num = function(weiboid) {
    var url = 'https://m.weibo.cn/api/comments/show?id=' + weiboid + '&page=1'
    console.log(url)
    request(url, function(error, response, body) {
        // console.log(response.statusCode) 
        if (!error && response.statusCode == 200) {
            var data = decodeUnicode(body)
            var alldata = JSON.parse(data)
            if (alldata.ok == 1) { //有评论的情况
                // var total = alldata.data.total_number //评论总数
                var totalpage = alldata.data.max //总页数
                var lastpage = [] //总页数
                for (let j = 1; j <= totalpage; j++) {
                    lastpage.push(j)
                }
                // console.log(lastpage)
                async.map(lastpage, function(page) { //异步循环
                    get_comment_data(weiboid, page) //爬取用户所有微博
                }, function(err, results) {
                    console.log('更新记录成功')
                    console.log(results);
                })
            } else {
                return
            }
        }
    })
}

function get_comment_data(weiboid, page) {
    var weiboid = weiboid
    var url = 'https://m.weibo.cn/api/comments/show?page=' + page + '&id=' + weiboid
        // console.log(url)
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = decodeUnicode(body)
            var alldata = JSON.parse(data)
            if (alldata.ok == 1) {
                var current_page_comment = alldata.data.data
                for (let i = 0; i < current_page_comment.length; i++) {
                    var commentid = current_page_comment[i].id //评论的id
                    var created_at = current_page_comment[i].created_at //评论时间
                    var source = current_page_comment[i].source //评论来源
                    var text = current_page_comment[i].text //评论内容
                    var reply_id = current_page_comment[i].reply_id //回复的别人评论的id
                    var reply_text = current_page_comment[i].reply_text || '第一条评论' //评论来源评论，当本评论属于对另一评论的回复时返回此字段
                    var comment_userid = current_page_comment[i].user.id //评论人的id
                    var comment_screen_name = current_page_comment[i].user.screen_name //评论人的昵称
                    var verified = current_page_comment[i].user.verified //是否是认证用户，即加V用户
                    var per_num = 10 * (page - 1) + i + 1
                    var weiboid = url.slice(-16) //原微博id
                    db.query(`insert into weibo_comment(per_num,commentid,weiboid,created_at,source,text,reply_id,reply_text,comment_userid,comment_screen_name,verified)values(${per_num},'${commentid}','${weiboid}','${created_at}','${source}','${text.replace(/'/g, '')}','${reply_id}','${reply_text.replace(/'/g, '')}',${comment_userid},'${comment_screen_name}','${verified}')`, function(err1, rows1) {
                        if (err1) {
                            return
                        } else {
                            // console.log('更新记录数成功')
                        }
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
// get_comment_data_num(4182033154781232)