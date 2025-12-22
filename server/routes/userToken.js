const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const {User} = require('./users');
const { response } = require('../app');
dotenv.config();
mongoose.connect(process.env.DATABASE);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection fails...'));
db.once('open', function (){ console.log('connected userToken...') });

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    userID: {
        type: String,
        required: true
    }
}, {collection: 'userTokens'});
const Token = mongoose.model('Token', tokenSchema);

router.get("/", async(req, res)=>{
    const reqState = req.body.state;
    await Token.findOne({state: reqState})
        .then(response => res.status(200).json(response))
        .catch(err => res.status(400).json({ message: err.message }));
});

router.post("/add", async(req, res)=>{
    try{
        //find id
        const token = req.body.token;
        console.log("收到新用戶的暫時token: ", token);
        if (!token) return res.status(400).json({ message: "缺少 Token" });

        const response1 = await fetch(`https://api.trello.com/1/members/me?key=${process.env.APIKEY}&token=${token}` , {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        if(!response1.ok) return res.status(response1.status).json({ message: "Trello API 請求失敗" });

        const resUser = await response1.json();
        const resID = resUser.id;
        console.log("收到新用戶的trello id: ", resID);

        //find user是否有登入過
        const found = await User.findOne({userID: resID});
        if(!found){
            const user = new User({
                userID: resID,
                haveBoard: false,
                mainBoardID: "-",
                cardUpdate: []
            });
            const newUser = await user.save();
            console.log("儲存user成功: ", newUser);
        }

        const userState = crypto.randomBytes(32).toString('hex');
        const userToken = new Token({
            token: req.body.token,
            state: userState,
            userID: resID
        });


        const newToken = await userToken.save();
        console.log("儲存token成功: ", newToken);
        res.status(200).json({'userState': userState});
    }catch(err){
        console.error("發生錯誤: ", err);
        res.status(500).json({
            message: "伺服器錯誤",
            error: err.message
        });
    }
});

router.delete("/", async(req, res)=>{
    const delState = req.body.state;
    await Token.deleteOne({state: delState})
        .then(response =>{
            console.log("刪除token成功！");
            res.status(200).json({message: "刪除暫存token成功"});
        })
        .catch(err => res.status(500).json({ message: err.message }));
});

module.exports = {Token, router};