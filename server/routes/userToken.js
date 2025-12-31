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
}, {collection: 'userTokens'}, {_id: false});
const Token = mongoose.model('Token', tokenSchema);

router.get("/getBoards", async(req, res)=>{
    ///*
    console.log("呼叫getBoards成功！");
    //*/
    try{
        const state = req.query.userState;
        const userToken = await Token.findOne({state: state});
        const id = userToken.userID;
        const token = userToken.token;

        const user = await User.findOne({userID: id});
        const allBoardDatas = user.allBoardDatas;
        const mainBoardID = user.mainBoardID;

        //call board name
        let boardList = [];
        for(let boardItem of allBoardDatas){
            const boardID = boardItem.boardID;
            const BoardData = await fetch(`https://api.trello.com/1/boards/${boardID}?key=${process.env.APIKEY}&token=${token}`);
            if(!BoardData.ok){
                console.error("BoardData獲取失敗");
                return res.status(BoardData.status).json(BoardData.statusText);
            }
            const boardData = await BoardData.json();
            const board = {
                id: boardData.id,
                name: boardData.name
            }
            boardList.push(board);
        }

        //check mainBoard if exists now or not
        //if not, then initialize it
        let mainBoardName = "";
        if(mainBoardID != "-"){
            const MainBoard = await fetch(`https://api.trello.com/1/boards/${mainBoardID}?key=${process.env.APIKEY}&token=${token}`);
            if(!MainBoard.ok){
                console.error("mainBoard獲取失敗");
                if(MainBoard.status == 404){
                    console.error("用戶" + id + "刪除了mainBoard！");
                    user.mainBoardID = "-";
                    user.allCards = [];
                    user.boardWebhook = null;
                    await user.save();
                }else{
                    return res.status(MainBoard.status).json(MainBoard.statusText);
                }
            }else{
                const MainBoardName = await MainBoard.json();
                mainBoardName = MainBoardName.name;
            }
        }

        const boardDatas = {
                mainBoard: {
                    id: user.mainBoardID,
                    name: mainBoardName
                },
                boardList: boardList,
                allCards: user.allCards
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
            const boardDatas = [];
            for(let i in boardList){
                const boardID = boardList[i];
                boardDatas.push({
                    boardID: boardID,
                    webhookToken: ""
                });
            }
            const user = new User({
                userID: resID,
                mainBoardID: "-",
                allBoardDatas: boardDatas,
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
    //try{
        ///*
        console.log("呼叫changeMainBoard成功！");
        //*/
        const state = req.body.userState;
        const newMainBoardID = req.body.mainBoardID;

        const userToken = await Token.findOne({state: state});
        const token = userToken.token;
        const id = userToken.userID;

        const response5 = await fetch(`https://api.trello.com/1/boards/${newMainBoardID}?cards=incomplete&key=${process.env.APIKEY}&token=${token}`);
        let newCardsList = [];
        if(!response5.ok){
            console.error("未成功獲取NewCardsList");
            if(response5.status != 404) return res.status(response5.status).json(response5.statusText);
        }else{
            const NewCardsList = await response5.json();
            newCardsList = NewCardsList.cards;
        }

        const user = await User.findOne({userID: id});
        const oldMainBoardID = user.mainBoardID;
        const boardDataIndex = user.allBoardDatas.findIndex(item => item.boardID === oldMainBoardID);
        const boardData = user.allBoardDatas[boardDataIndex];

        console.log("用戶" + id + "即將更新webhook...");
        if(boardData.webhookToken != token){
            //getWebhook
            const callbackURL = "https://toomuchstonestodo.onrender.com/listenWebhook";
            const response3 = await fetch(`https://api.trello.com/1/webhooks/?callbackURL=${callbackURL}&idModel=${newMainBoardID}&key=${process.env.APIKEY}&token=${token}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json'
                    },
                });
            if(!response3.ok){
                console.error("獲得webhook失敗！");
                return res.status(response3.status).json(response3.statusText);
            }
            console.log("成功取得" + id + "之webhook！");
            const newWebhook = await response3.json();

            boardData.webhookToken = token;
            user.allBoardDatas[boardDataIndex] = boardData;
            user.boardWebhook = newWebhook;
        }else console.log("已擁有webhook，用戶不需更新webhook！");

        user.mainBoardID = newMainBoardID;
        user.allCards = newCardsList;
        await user.save();
        ///*
        console.log("回傳卡牌並更新使用者資訊user：", user);
        //*/
        res.status(200).json(newCardsList);
    //}catch(err){
    //    res.status(500).json({message: err.message});
    //}
});

module.exports = {Token, router};