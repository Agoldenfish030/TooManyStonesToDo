var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const crypto = require("crypto");
dotenv.config();

const dblink = process.env.DATABASE.replace('<db_password>', process.env.DATABASE_PASSWORD);
mongoose.connect(dblink);
const db = mongoose.connection;
let dbConnection, smallDb;

db.on('error', console.error.bind(console, 'connection fails...'));
db.once('open', function (){ console.log('connected...') });

const connectToDb = async()=>{
  try{
    const client = await MongoClient.connect(dblink);
    dbConnection = client.db('GameUsers');
    console.log("已連接db collection");
  }catch(err){
    console.error("未連接db collection：", err);
  }
}

const getDb = ()=>{
  if(!dbConnection){
    throw new Error("查無db collection");
  }
  return dbConnection;
}

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
});
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
    await connectToDb;
    smallDb = getDb;
  }catch(err){
    console.error("拿不到小Db：", err);
  }
  smallDb.collection('gameUsers')
    .insertOne(user)
    .then(result => res.status(201).json(result))
    .catch(err => {
      res.status(500).json({ message: err});
    });
});

module.exports = router;
