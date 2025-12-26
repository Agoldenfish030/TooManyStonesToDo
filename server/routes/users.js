var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection fails...'));
db.once('open', function (){ console.log('connected users...') });

const userSchema = new mongoose.Schema({
    userID: {
      type: String,
      required: true
    },
    haveBoard: {
      type: Boolean,
      required: true
    },
    mainBoardID: {
      type: String,
      required: true
    },
    allBoardsID: {
      type: [String],
      required: true
    },
    allCards: {
      type: [Object],
      required: true
    },
    boardWebhook: {
      type: Object,
      require: false
    }
}, {collection: 'userDatas'});
const User = mongoose.model('User', userSchema);

module.exports = {User, router};
