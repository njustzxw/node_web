/*+++++++++++++++++++++++++++++++++
获取热门话题下的所有微博
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
var fs = require('fs');
charset(superagent);

/*--------------------------------------------------------------
 指定某个话题 开始搜索该话题下的所有微博
 -------------------------------------------------------------*/
var topic_value = '南京理工大学'
    /*--------------------------------------------------------------
     获取某个话题下的所有微博数量
     -------------------------------------------------------------*/
var get_topic_num = function(topic_value, num, since_id, containerid) {
    if (num == 1) {
        var url = `https://m.weibo.cn/api/container/getIndex?from=feed&type=topic&value=${encodeURIComponent(topic_value)}`
    } else {
        var url = `https://m.weibo.cn/api/container/getIndex?from=feed&type=topic&value=${encodeURIComponent(topic_value)}&containerid=${containerid}&since_id=${since_id}`
    }
    console.log(url)
    request(url, function(error, response, body) {
        console.log(response.statusCode)
        if (!error && response.statusCode == 200) {
            // var data = decodeUnicode(body)
            var alldata = eval('(' + body + ')');
            if (alldata.ok == 1) {
                var pageInfo = alldata.data.pageInfo //基本信息集合
                var card = alldata.data.cards //帖子集合

                var page_type_name = pageInfo.page_type_name //话题名称
                var title_icon = pageInfo.title_icon //话题图片
                var desc = pageInfo.desc //话题简介
                var desc_more = pageInfo.desc_more ? pageInfo.desc_more.toString() : '' //话题阅读量、讨论量、粉丝数
                var since_id = pageInfo.since_id //  开始的时间    ！！！！作为下次请求的重要参数！
                var total = pageInfo.total //帖子总数
                var containerid = pageInfo.containerid //查询ID
                for (let i = 0; i < card.length; i++) { //微博话题下的card中有很多别的内容，此时要过滤掉（看截图） 对每一组微博进行循环
                    if (card[i].card_group && card[i].card_group.length > 0) {
                        for (let j = 0; j < card[i].card_group.length; j++) { //对每一条微博进行循环
                            var weibo_info = card[i].card_group[j].mblog
                            var id = weibo_info.id //微博id
                            var created_at = weibo_info.created_at //发帖时间
                            var text = weibo_info.text //发帖内容
                            var textLength = weibo_info.textLength //帖子长度
                            var source = weibo_info.source //帖子来源
                            var userid = weibo_info.user.id //发帖人的id （发帖人的所有个人信息都可以获取，这里只获取id）
                            db.query(`insert into hot_weibo(id,created_at,text,textLength,source,userid,page_type_name,title_icon,since_id,total,desc_more,introduce) values(${id},'${created_at}','${text.replace(/'/g, '')}','${textLength}','${source}','${userid}','${page_type_name}','${title_icon.replace(/'/g, '')}','${since_id}','${total}','${desc_more}','${desc}')`, function(err1, rows1) {
                                if (err1) {
                                    console.log(err1)
                                } else {}
                            })
                        }
                    }
                }
                console.log(topic_value, num + 1, since_id, containerid)
                get_topic_num(topic_value, num + 1, since_id, containerid)
            } else {

            }
        }
    })
}
get_topic_num(topic_value, 1) //关键字、请求次数
function decodeUnicode(str) {
    str = str.replace(/\\u/g, '%u');
    return unescape(str);
}