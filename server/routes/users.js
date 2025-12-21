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
    haveBoard: {
      type: Boolean,
      require: true
    },
    mainBoardID: {
      type: String,
      require: true
    },
    cardUpdate: {
      type: [String],
      require: false
    }
});
const User = mongoose.model('User', userSchema);

router.get("/findID", async(req, res)=>{
  const userID = req.body.id;
  db.collection('userDatas')
    .findOne({userID: userID})
    .then(response => res.status(200).json(response))
    .catch(err => res.status(400).json({message: err.message}));
});

router.get("/findUser", (req, res)=>{
    const reqID = req.body.resID;
    db.collection('userTokens')
        .findOne({ userID: reqID })
        .then(user => res.json({ found: true }) )
        .catch(err => res.json({ found: false }) );
});

/* GET users listing. */
router.post('/', async(req, res, next)=>{
  const user = new User({
    userID: req.body.resID,
    haveBoard: false,
    mainBoardID: null,
    cardUpdate: []
  });
  try{
    await user.save('userDatas');
  }catch(err){
    res.status(500).json("儲存user失敗：", err.message);
  }
});

module.exports = router;
