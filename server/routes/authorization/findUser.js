const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
mongoose.connect(process.env.DATABASE);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection fails...'));
db.once('open', function (){ console.log('connected findUser...') });

router.get("/", (req, res)=>{
    const reqID = req.body.resID;
    db.collection('userTokens')
        .findOne({ userID: reqID })
        .then(user => res.status(200).json({ found: true }) )
        .catch(err => res.status(404).json({ found: false }) );
});

module.exports = router;