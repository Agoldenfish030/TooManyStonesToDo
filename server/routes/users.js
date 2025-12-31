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
    mainBoardID: {
      type: String,
      required: true
    },
    allBoardDatas: [{
      boardID:{
        type: String,
        required: true
      },
      webhookToken: {
        type: String,
        required: false
      }
    }],
    allCards: {
      type: [Object],
      required: true
    },
    boardWebhook: {
      type: Object,
      required: false
    }
}, {collection: 'userDatas'}, {_id: false});
const User = mongoose.model('User', userSchema);

module.exports = {User, router};
