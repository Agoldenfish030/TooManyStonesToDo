const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const {User} = require('./users');
dotenv.config();
mongoose.connect(process.env.DATABASE);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection fails...'));
db.once('open', function (){ console.log('connected userToken...') });

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        require: true
    },
    state: {
        type: String,
        require: true
    },
    userID: {
        type: String,
        require: true
    }
}, {collection: 'userTokens'});
const Token = mongoose.model('Token', tokenSchema);

router.get("/", async(req, res)=>{
    const reqState = req.body.state;
    db.collection('userTokens')
        .findOne({state: reqState})
        .then(response => res.status(200).json(response))
        .catch(err => res.status(400).json({ message: err.message }));
});

router.post("/add", async(req, res)=>{
    //find id
    const token = req.body.token;
    const response1 = await fetch(`https://api.trello.com/1/members/me?key=${process.env.APIKEY}&token=${token}` , {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    const resID = await response1.json().id;

    //find user是否有登入過
    const found = await User.findOne({userID: resID});
    if(!found){
        const user = new User({
            userID: resID,
            haveBoard: false,
            mainBoardID: null,
            cardUpdate: []
        });
        try{
            await user.save();
            res.json("儲存user成功");
        }catch(err){
            res.status(500).json("儲存user失敗：", err.message);
        }
    }

    const userState = crypto.randomBytes(32).toString('hex');
    const userToken = new Token({
        token: req.body.token,
        state: userState,
        userID: resID
    });

    try{
        await userToken.save();
        res.status(200).json({'userState': userState});
    }catch(err){
        res.status(500).json("暫存token失敗：", err.message );
    }
});

router.delete("/", async(req, res)=>{
    const delState = req.body.state;
    db.collection('userTokens')
        .deleteOne({state: delState})
        .then(response => res.status(200).json("刪除暫存token成功"))
        .catch(err => res.status(500).json({ message: err.message }));
});

module.exports = router;