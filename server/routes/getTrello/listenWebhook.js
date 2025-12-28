const express = require('express');
const router = express.Router();
const {User} = require('../users');
const verifyWebhook = require('./verifyWebhook');

router.head("/", async(req, res)=>{
    res.status(200).send();
});

router.post("/", async(req, res)=>{
    try{
        //check whether the request is from trello or not
        if(verifyWebhook(req, 'https://toomuchstonestodo.onrender.com/listenWebhook')){
            const response = req.body;
            const action = response.action;
            const model = response.model;
            const webhook = response.webhook;

            const found = await User.findOne({ "boardWebhook.id": "webhook.id" });
            if(!found){
                console.error("有未刪除的webhook！id：", webhook.id);
                return res.status(410);
            }
            const boardID = model.id;
            ///* for check content of the data
            console.log(
                "正確收到webhook request！\n" +
                `action: ${action}\n` +
                `model: ${model}\n` +
                `webhook: ${webhook}`
            );
            //*/

            //action in need:
            //add:createCard, copyCard, moveCardFromBoard, emailCard, convertToCardFromCheckItem, *updateCard
            //delete:deleteCard, moveCardToBoard, *updateCard

            res.status(200).send();
        }else{
            res.status(400).send();
        }
    }catch(err){
        res.status(500).send();
    }
});

module.exports = router;