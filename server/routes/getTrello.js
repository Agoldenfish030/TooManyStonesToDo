const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

router.get("/", (req, res)=>{
    const link = process.env.AUTHORIZE_URL;
    link.replace('<KEYWORD>', process.env.MY_API_KEY);
    if(!link) res.status(500).json({ message: "LINK LOST" });
    res.json(link);
});

module.exports = router;