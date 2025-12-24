const fetch = require('node-fetch');
const dotenv = require('dotenv');
const {User} = require('../users');
const {Token} = require('../userToken');
dotenv.config();

const getWebhook = async({ userState })=>{
    const userToken = await Token.findOne({state: userState}).lean();
    const token = userToken.token;
    const id = userToken.userID;

    const userData = await User.findOne({userID: id});
    const user = await userData.json();
    const boardID = user.mainBoardID;
    const callbackURL = "https://toomuchstonestodo.onrender.com/listenWebhook";

    fetch(`https://api.trello.com/1/tokens/${token}/webhooks/?key=${process.env.APIKEY}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            description: "TooMuchStonesToDo",
            callbackURL: callbackURL,
            idModel: boardID
        })
    })
        .then(response => {
            console.log(
              `Response: ${response.status} ${response.statusText}`
            );
            return response.text();
        })
        .then(text => console.log(text))
        .catch(err => console.error(err));
    }

module.exports = getWebhook;