const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const { response } = require('../app');
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
});
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
    const url = `https://api.trello.com/1/members/me?key=${process.env.APIKEY}&token=${token}`;
    console.log(url);
    await fetch(url , {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => {
            console.log(
                `Response: ${response.status} ${response.statusText}`
            );
            return response.text();
        })
        .then(text => console.log(text))
        .catch(err => console.error(err));
    const resID = await response1.json().id;

    //find user是否有登入過
    const response1 = await fetch('users/findUser', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({resID})
    });
    const found = await response1.json().found;
    if(!found){
        const response2 = await fetch('users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({resID})
        });
        if(!response2.ok) res.status(500).json("回報：儲存user失敗");
    }

    const userState = crypto.randomBytes(32).toString('hex');
    const userToken = new Token({
        token: req.body.token,
        state: userState
    });

    try{
        await userToken.save('userTokens');
        res.json({'userState': state});
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