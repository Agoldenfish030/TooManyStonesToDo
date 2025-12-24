const dotenv = require('dotenv');
dotenv.config();
const cardUpdate = async({ boardID, token })=>{
    const cardsList = await fetch(`https://api.trello.com/1/boards/${boardID}/?cards=all&key=${process.env.APIKEY}&token=${token}`);
    return cardsList;
}

module.exports = cardUpdate;