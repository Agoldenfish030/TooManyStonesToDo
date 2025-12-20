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

const userSchema = new mongoose.Schema({
    token: {
        type: String,
        require: true
    },
    state: {
        type: String,
        require: true
    }
});
const User = mongoose.model('User', userSchema);

router.post("/", async(req, res)=>{
    const userState = crypto.randomBytes(32).toString('hex');
    const user = new User({
        token: req.body.token,
        state: userState
    });

    try{
        await user.save();
        res.json({userState: state});
    }catch(err){
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;