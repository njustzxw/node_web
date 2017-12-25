var express = require('express');
var router = express.Router();
//引入数据库包
var db = require("../db.js");
/* GET home page. */

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });    //不能删
});
router.post('/login', function(req, res, next) {    //登录
    let keyname = req.body.name;
    let keyuser = req.body.key;
    db.query("select * from person where name='"+keyname+"'", function (err, rows) {
        if(err){
            console.log(err.message);
            return;
        }else{
            if(rows.length>0){
                if(keyuser == rows[0].key){
                    res.send({sta:"登录成功"});
                }else{
                    res.send({sta:"密码错误"});
                }
            }else{
                res.send({sta:"该用户不存在"});
            }
        }
    })
});
router.post('/register', function(req, res, next) {    //注册
    let name = req.body.name;
    let key = req.body.key;
    db.query("insert into person  values('"+name+"','"+key+"')",function (err,rows) {
        if(err){
            console.log(err.code)
            if(err.code == "ER_DUP_ENTRY"){    //冲突
                res.send({sta:"该用户名已被注册"});
            }
        }else {
            res.send({sta:"恭喜你，注册成功！"});
        }
    })
})


router.get('/adduser',function(req,res,next){
    var name = req.query.name
    var age = req.query.age
    var sex = req.query.sex
    var score = req.query.score
    db.query("insert into person1(name,age,sex,score) values('"+name+"','"+age+"','"+sex+"','"+score+"')",function (err,rows) {
        if(err){
            console.log("fail");
            res.send({status:'fail'})
        }else{
            console.log("success")
            res.send({status:'success'})
        }
    })
})
module.exports = router;
