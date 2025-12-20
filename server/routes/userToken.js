const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
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

router.post("/", async(req, res)=>{
    //find id
    const response1 = await fetch('findID', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({token})
    });
    const resID = await response1.json().id;

    //find user是否有登入過
    const response2 = await fetch('findUser', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({resID})
    });
    const found = await response2.json().found;
    if(!found){}

    const userState = crypto.randomBytes(32).toString('hex');
    const user = new Token({
        token: req.body.token,
        state: userState
    });

    try{
        await user.save();
        res.json({'userState': state});
    }catch(err){
        res.status(500).json( "暫存token失敗：", err.message );
    }
});

router.delete("/", async(req, res)=>{

});

module.exports = router;