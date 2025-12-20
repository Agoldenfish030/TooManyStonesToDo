import { response } from 'express';

const fetch = require('node-fetch');
const getDefault = async({ token, boardID })=>{
    try{
        const response = await fetch(`https://api.trello.com/1/boards/${boardID}/?key=${process.env.APIKEY}&token=${token}&cards=all`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        console.log(
            `Response: ${response.status} ${response.statusText}`
        );
        console.log(response.text());
        return response;
    }catch(err){
        console.error(err);
    }
}

export default getDefault;