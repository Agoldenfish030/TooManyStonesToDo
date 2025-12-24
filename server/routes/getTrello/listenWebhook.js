const express = require('express');
const router = express.Router();
const verifyWebhook = require('./verifyWebhook');

router.head("/", async(req, res)=>{
    res.status(200);
});

router.post("/", async(req, res)=>{
    try{
        //check whether the request is from trello or not
        if(verifyWebhook(req, 'https://toomuchstonestodo.onrender.com/listenWebhook')){
            const action = req.body.action.json();
            const model = req.body.model.json();
            const webhook = req.body.webhook.json();
            console.log(
                "正確收到webhook request！\n" +
                `action: ${action}\n` +
                `model: ${model}\n` +
                `webhook: ${webhook}`
            );

        }else{
            res.status(400).json({message: "listenWebhook回報：收到不正確的post require"});
        }
    }catch(err){
        res.status(500).json({message: "listenWebhook回報："+ err.message});
    }
});

module.exports = router;