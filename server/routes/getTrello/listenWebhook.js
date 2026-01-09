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
            const io = socketHandler.getIO();

            const foundUser = await User.findOne({ "boardWebhook.id": webhookID });
            if(!foundUser){
                console.error("有未刪除的webhook！id：", webhook.id);
                return res.status(410).send();
            }
            ///* for check content of the data
            console.log("正確收到webhook request！");
            console.log("action: ", action);
            console.log("webhook: ", webhook);
            //*/

            ///*
            let cardData = {
                type: '',
                cardID: action.data.card.id,
                cardName: action.data.card.name,
                cardDue: action.data.card.due,
                cardComplete: action.data.card.dueComplete
            };
            //action in need:
            //add: createCard, copyCard, moveCardToBoard, emailCard, convertToCardFromCheckItem
            if(
                action.type == "createCard" ||
                action.type == "copyCard" ||
                action.type == "moveCardToBoard" ||
                action.type == "emailCard" ||
                action.type == "convertToCardFromCheckItem"
            ){
                foundUser.allCards.push({
                    id: cardData.id,
                    name: cardData.name,
                    due: cardData.due,
                    dueComplete: cardData.dueComplete
                });
                await foundUser.save();

                cardData.type = 'ADD';
                io.emit('cardChange', cardData);
                
            }else if( //delete: deleteCard, moveCardFromBoard
                action.type == "deleteCard" ||
                action.type == "moveCardFromBoard"
            ){
                const newCardsList = foundUser.allCards.filter({
                    id: cardData.cardID,
                    name: cardData.cardName,
                    due: cardData.cardDue,
                    dueComplete: cardData.cardComplete
                });
                foundUser.allCards = newCardsList;
                await foundUser.save();

                cardData.type = 'DELETE';
                io.emit('cardChange', cardData);

            }else if(action.type == "updateCard"){ //spectial: updateCard
                if(
                    action.data.old.name ||
                    action.data.old.due ||
                    action.data.old.dueComplete
                ){
                    const newCardsList = foundUser.allCards.map((item)=>{
                        if(item.id === cardData.cardID){
                            return {
                                id: cardData.cardID,
                                name: cardData.cardName,
                                due: cardData.cardDue,
                                dueComplete: cardData.cardComplete
                            }
                        }
                        return item;
                    });
                    foundUser.allCards = newCardsList;
                    await foundUser.save();

                    cardData.type = 'UPDATE';
                    io.emit('cardChange', cardData);
                }
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