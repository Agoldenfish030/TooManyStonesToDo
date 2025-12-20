const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

router.get("/", async(req, res)=>{
    try{
        const link = process.env.AUTHORIZATION_LINK;
        console.log(link);
        res.json({ reLink: link });
    }catch(err){
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;