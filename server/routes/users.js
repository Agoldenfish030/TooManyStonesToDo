var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const crypto = require("crypto");
dotenv.config();

const link = process.env.DATABASE;
const dblink = link.replace('<db_password>', process.env.DATABASE_PASSWORD);
mongoose.connect(dblink);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection fails...'));
db.once('open', function (){ console.log('connected...') });

const userSchema = new mongoose.Schema({
    token: {
      type: String,
      require: true
    },
    state: {
      type: String,
      require: true
    },
    expire_at: {
      type: Number,
      require: true
    }
}, { collation: 'gameUsers' });
const User = mongoose.model('User', userSchema);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post("/", async(req, res)=>{
  const randomState = crypto.randomBytes(32).toString();
  const now = Date.now();
  const user = new User({
    token: req.body.token,
    state: randomState,
    expire_at: now+86400000
  });

  try{
    const response = await user.save();
    res.status(201).json(response);
  }catch(err){
    res.status(500).json({ error: err.message});
  }
});

module.exports = router;
