const crypto = require('crypto');

const verifyWebhook = (request, callbackURL)=>{
    const content = JSON.stringify(request.body) + callbackURL;
    const doubleHash = crypto.createHmac("sha1", process.env.APISECRET)
                            .update(content)
                            .digest("base64");
    const headerHash = request.headers["x-trello-webhook"];
    return headerHash == doubleHash;
};

module.exports = verifyWebhook;