const express = require('express');
const router = express.Router();

router.head("/", async(req, res)=>{
    res.status(200);
});

router.post("/", async(req, res)=>{
    const action = req.body.action;
    const model = req.body.model;
});

module.exports = router;