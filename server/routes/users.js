var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
mongoose.connect(process.env.DATABASE);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection fails...'));
db.once('open', function (){ console.log('connected users...') });

const userSchema = new mongoose.Schema({
    userID: {
        type: String,
        require: true
    },
});
const User = mongoose.model('User', userSchema);

/* GET users listing. */
router.post('/', async(req, res, next)=>{
  const user = new User({
    userID: req.body.resID
  });
  try{
    await user.save();
  }catch(err){
    res.status(500).json("儲存user失敗：", err.message);
  }
});

module.exports = router;
