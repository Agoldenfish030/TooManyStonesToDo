const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const {User} = require('./users');
dotenv.config();
mongoose.connect(process.env.DATABASE);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection fails...'));
db.once('open', function (){ console.log('connected userToken...') });

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    userID: {
        type: String,
        required: true
    }
}, {collection: 'userTokens'});
const Token = mongoose.model('Token', tokenSchema);

router.get("/getBoards", async(req, res)=>{
    ///*
    console.log("呼叫getBoards成功！");
    //*/
    try{
        const state = req.query.userState;
        const userToken = Token.findOne({state: state});
        const id = userToken.userID;
        const token = userToken.token;

        const user = User.findOne({userID: id});
        const boardIDList = user.allBoardsID;
        const mainBoardID = user.mainBoardID;
        const allCards = user.allCards;
        const response4 = (await fetch(`https://api.trello.com/1/boards/${mainBoardID}?key=${process.env.APIKEY}&token=${token}`)).json();
        if(response4.status == 404){
            console.error("用戶" + id + "刪除了mainBoard！");
            user.mainBoardID = "-";
            user.allCards = [];
            user.boardWebhook = null;
            await user.save();
        }

        const boardList = [];
        for(let boardID in boardIDList){
            const boardData = (await fetch(`https://api.trello.com/1/boards/${boardID}?key=${process.env.APIKEY}&token=${token}`)).json();
            const board = {
                id: id,
                name: boardData.name
            }
            boardList.push(board);
        }

        const mainBoardName = (await fetch(`https://api.trello.com/1/boards/${mainBoardID}?key=${process.env.APIKEY}&token=${token}`)).json().name;
        const boardDatas = {
                mainBoard: {
                    id: mainBoardID,
                    name: mainBoardName
                },
                boardList: boardList,
                allCards: allCards
            };
        ///*
        console.log("即將寄出board物件：", boardDatas);
        //*/
        res.status(200).json(boardDatas);
    }catch(err){
        res.status(500).json({message: "getBoards失敗：" + err.message});
    }
});

router.post("/", async(req, res)=>{
    try{
        //find id
        const token = req.body.token;
        console.log("收到新用戶的暫時token: ", token);
        if (!token) return res.status(400).json({ message: "缺少 Token" });

        const response1 = await fetch(`https://api.trello.com/1/members/me?key=${process.env.APIKEY}&token=${token}` , {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        if(!response1.ok) return res.status(response1.status).json({ message: "Trello API 請求失敗" });

        const resUser = await response1.json();
        const resID = resUser.id;
        console.log("收到用戶的trello id: ", resID);

        //find user是否有登入過
        const found = await User.findOne({userID: resID});
        if(!found){
            const boardList = resUser.idBoards;
            const user = new User({
                userID: resID,
                haveBoard: false,
                mainBoardID: "-",
                allBoardsID: boardList,
                allCards: []
            });
            const newUser = await user.save();
            console.log("儲存user成功: ", newUser);
        }else{
            await Token.deleteOne({userID: resID});
            console.log("準備更新用戶之token，用戶id：", resID);
        }

        const userState = crypto.randomBytes(32).toString('hex');
        const userToken = new Token({
            token: req.body.token,
            state: userState,
            userID: resID
        });

        const newToken = await userToken.save();
        console.log("儲存token成功: ", newToken);
        res.status(201).json({'userState': userState});
    }catch(err){
        console.error("發生錯誤: ", err);
        res.status(500).json({
            message: "伺服器錯誤",
            error: err.message
        });
    }
});

router.put("/changeMainBoard", async(req, res)=>{
    ///*
    console.log("呼叫changeMainBoard成功！");
    //*/
    const state = req.body.userState;
    const newMainBoardID = req.body.mainBoardID;

    const userToken = (await Token.findOne({state: state})).json();
    const token = userToken.token;
    const id = userToken.userID;

    const user = (await User.findOne({userID: id})).json();
    if(!user.boardWebhook){
        console.log("用戶" + id + "為初次進入，請忽略404");
    }
    const oldWebhookID = user.boardWebhook.id;
    const newCardsList = (await fetch(`https://api.trello.com/1/boards/${newMainBoardID}/?cards=incomplete`)).json();

    console.log("用戶" + id + "即將更新webhook...");
    //delWebhook
    if(oldMainBoardID != "-"){
        const response2 = await fetch(`https://api.trello.com/1/webhooks/${oldWebhookID}?key=${process.env.APIKEY}&token=${token}`, {
            method: 'DELETE'
        });
        if(!response2.ok){
            console.error("刪除webhook失敗！");
            return res.status(response2.status).json(response2.statusText);
        }
        console.log("用戶" + id + "之舊webhook刪除成功！");
    }

    //getWebhook
    const callbackURL = "https://toomuchstonestodo.onrender.com/listenWebhook";
    const response3 = await fetch(`https://api.trello.com/1/tokens/${token}/webhooks/?key=${process.env.APIKEY}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                description: "TooMuchStonesToDo",
                callbackURL: callbackURL,
                idModel: newMainBoardID
            })
        });
    if(!response3.ok){
        console.error("獲得webhook失敗！");
        return res.status(response3.status).json(response3.statusText);
    }
    console.log("成功取得" + id + "之webhook！");
    const newWebhook = await response3.json();
    
    user.mainBoardID = newMainBoardID;
    user.allCards = newCardsList;
    user.boardWebhook = newWebhook;
    await user.save();
    ///*
    console.log("回傳卡牌並更新使用者資訊user：", user);
    //*/
    res.status(200).json(newCardsList);
});

module.exports = {Token, router};