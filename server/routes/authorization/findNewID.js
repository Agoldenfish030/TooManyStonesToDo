const express = require('express');
const router = express.Router();
// This code sample uses the 'node-fetch' library:
// https://www.npmjs.com/package/node-fetch
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

router.get("/", async(req, res)=>{
    const token = req.body.token;
    const url = `https://api.trello.com/1/members/me?key=${process.env.APIKEY}&token=${token}`;
    console.log(url);
    await fetch(url , {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => {
            console.log(
                `Response: ${response.status} ${response.statusText}`
            );
            return response.text();
        })
        .then(text => console.log(text))
        .catch(err => console.error(err));
});

module.exports = router;