/*+++++++++++++++++++++++++++++++++
某个用户的所有微博
getnum(id)
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
var Weibo = require('nodeweibo'); // require('nodeweibo') also works if you have installed nodeweibo via npm
var setting = require('nodeweibo/examples/setting.json'); // get setting (appKey, appSecret, etc.)

// var page_weibo_num = []
// Weibo.init(setting);
getnum(2304133055675935); //获取某个用户的微博数量

function getnum(id) { //参数用户id
    var url = 'https://m.weibo.cn/api/container/getIndex?containerid=' + id + '&page=1'
    request(url, function(error, response, body) {
        console.log(url)
        console.log(response.statusCode)
        if (!error && response.statusCode == 200) {
            var data = decodeUnicode(body)
            var alldata = JSON.parse(data)
            if (alldata.ok == 1) {
                var total = alldata.data.cardlistInfo.total //获取总共的微博数量
                var xhnum = Math.ceil(total / 10)
                console.log('微博总数：' + total, '循环页数' + xhnum)
                var arr = []
                for (let i = 1; i < xhnum; i++) {
                    arr.push(i)
                }
                var page_weibo_num = []
                async.map(arr, function(num) { //异步循环
                    console.log(num)
                    getweibodata(id, num) //爬取用户所有微博
                }, function(err, results) {
                    if (err) {
                        console.log(err)
                    } else {
                        // res.send({ status: '成功', message: all_num })
                    }
                })
            }
        } else {
            console.log('获取数据出错！')
        }
    })
}

function getweibodata(id, num) {
    let url = 'https://m.weibo.cn/api/container/getIndex?containerid=' + id + '&page=' + num;
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = decodeUnicode(body)
            var alldata = JSON.parse(data)
            if (alldata.ok == 1) {
                var weibo_current_page = alldata.data.cards // 当前页面里的10条微博
                for (let i = 0; i < weibo_current_page.length; i++) {
                    var per_num = Number(10 * (num - 1)) + (Number(i) + 1) //该用户发布的第几条微博
                    var created_at = weibo_current_page[i].mblog.created_at; //创建微博的时间
                    var weiboid = weibo_current_page[i].mblog.id; //微博ID
                    var weibomid = weibo_current_page[i].mblog.mid; //微博MID
                    var text = weibo_current_page[i].mblog.text; //内容
                    var textlength = weibo_current_page[i].mblog.textLength; //内容长度
                    var source = weibo_current_page[i].mblog.source //来源
                    var thumbnail_pic = weibo_current_page[i].mblog.thumbnail_pic || '空' //配图地址
                    var userid = weibo_current_page[i].mblog.user.id //用户id
                    var screen_name = weibo_current_page[i].mblog.user.screen_name //用户昵称
                    var description = weibo_current_page[i].mblog.user.description //用户描述
                    var followers_count = weibo_current_page[i].mblog.user.followers_count //粉丝数
                    var follow_count = weibo_current_page[i].mblog.user.follow_count //关注数
                    var cover_image_phone = weibo_current_page[i].mblog.user.cover_image_phone || '空' //手机背景图片
                    var reposts_count = weibo_current_page[i].mblog.reposts_count //转发数
                    var comments_count = weibo_current_page[i].mblog.comments_count //评论数
                    var attitudes_count = weibo_current_page[i].mblog.attitudes_count //点赞数
                    var reads_count = weibo_current_page[i].mblog.reads_count //阅读数
                    var visible = weibo_current_page[i].mblog.visible.type //微博的可见性
                    var retweeted_status = weibo_current_page[i].mblog.retweeted_status ? weibo_current_page[i].mblog.retweeted_status.id : '原创' //如果是转发的 就是原微博id
                        // console.log(reads_count)
                    db.query(`insert into weibo_person(per_num,created_at,weiboid,weibomid,text,textlength,source,thumbnail_pic,userid,screen_name,description,followers_count,follow_count,cover_image_phone,reposts_count,comments_count,attitudes_count,reads_count,visible,retweeted_status)values(${per_num},'${created_at}','${weiboid}',${weibomid},'${text.replace(/'/g, '')}','${textlength}','${source}','${thumbnail_pic.replace(/'/g, '')}',${userid},'${screen_name}','${description}','${followers_count}','${follow_count}','${cover_image_phone.replace(/'/g, '')}','${reposts_count}','${comments_count}','${attitudes_count}','${reads_count}','${visible}','${retweeted_status}')`, function(err1, rows1) {
                        if (err1) {
                            console.log(err1)
                                // res.send({status:'出错',reason:err1})
                        } else {
                            // res.send({ status: '成功', message: all_num })
                            // console.log('更新记录数成功')
                        }
                    })
                }
            }
        } else {
            console.log('获取数据出错！')
        }
    })
}

function decodeUnicode(str) {
    str = str.replace(/\\u/g, '%u');
    return unescape(str);
}





/*
+-------------------------------------------------
例1：开启微博认证
+-------------------------------------------------
*/

// Weibo.authorize();


/*
+--------------------------------------------------
例2：需要获取access_token
+---------------------------------------------------
*/
// var jsonParas = {
//     code: "d4254825b4fe4b9d964b8d1186615ffb",
//     grant_type: "authorization_code"
// };

// Weibo.OAuth2.access_token(jsonParas, function(data) {
//     console.log(data);
// });

/*
    example 3, get public timeline
 */

// set parameters
// var para = {
//     "source": Weibo.appKey.appKey,
//     "access_token": '2.00jtSn1DFMkhVE0945750e14AQBwCC',
//     // "page": 1,
//     // "screen_name": '人民日报'
// };

// // get public timeline
// Weibo.Statuses.home_timeline(para, function(data) {
//     console.log(data);
// });