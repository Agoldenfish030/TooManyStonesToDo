const express = require('express');
const router = express.Router();
const {User} = require('../users');
const verifyWebhook = require('./verifyWebhook');
const socketHandler = require('./socketHandler');

router.head("/", async(req, res)=>{
    res.status(200).send();
});

router.post("/", async(req, res)=>{
    try{
        //check whether the request is from trello or not
        if(verifyWebhook(req, 'https://toomuchstonestodo.onrender.com/listenWebhook')){
            const response = req.body;
            const action = response.action;
            const webhook = response.webhook; const webhookID = webhook.id;
            const io = socketHandler.getIO;

            const found = await User.findOne({ "boardWebhook.id": webhookID });
            if(!found){
                console.error("有未刪除的webhook！id：", webhook.id);
                return res.status(410).send();
            }
            ///* for check content of the data
            console.log("正確收到webhook request！");
            console.log("action: ", action);
            console.log("webhook: ", webhook);
            //*/

            /*
            //action in need:
            //add: createCard, copyCard, moveCardToBoard, emailCard, convertToCardFromCheckItem
            if(
                action.type == "createCard" ||
                action.type == "copyCard" ||
                action.type == "moveCardToBoard" ||
                action.type == "emailCard" ||
                action.type == "convertToCardFromCheckItem"
            ){
                io.emit('cardChange', {
                    type: 'ADD',
                    cardID: action.data.card.id,
                    cardName: action.data.card.name,
                    cardDue: action.data.card.due
                });
            }else if( //delete: deleteCard, moveCardFromBoard
                action.type == "deleteCard" ||
                action.type == "moveCardFromBoard"
            ){
                io.emit('cardChange', {
                    type: 'DELETE',
                    cardID: action.data.card.id,
                    cardName: action.data.card.name,
                    cardDue: action.data.card.due
                });
            }else if(action.type == "updateCard"){ //spectial: updateCard
                io.emit('cardChange', {
                    type: 'UPDATE',
                    cardID: action.data.card.id,
                    cardName: action.data.card.name,
                    cardDue: action.data.card.due
                });
            }
            //*/
            res.status(200).send();
        }else{
            res.status(400).send();
        }
    }catch(err){
        res.status(500).send();
    }
});

module.exports = router;