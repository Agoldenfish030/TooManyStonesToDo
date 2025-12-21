import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const getWebhook = async({ userState })=>{
    const userToken = await fetch('userToken',{
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({userState})
    });
    const token = await userToken.json().token;
    const id = await userToken.json().userID;
    const userData = await fetch('users/findID', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id})
    });
    const boardID = await userData.json().mainBoardID;
    const callbackURL = "https://toomuchstonestodo.onrender.com/trello/listenWebhook";

    fetch(`https://api.trello.com/1/tokens/${token}/webhooks/?key=${process.env.APIKEY}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            description: "TooManyStonesToDo",
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

export default getWebhook;