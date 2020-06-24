require("dotenv").config();
import request from "request";
import chatBotService from "../services/chatBotService";
const MY_VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
let postWebhook = (req, res) => {
    // Parse the request body from the POST
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);


            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });

        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
};

let getWebhook = (req, res) => {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = MY_VERIFY_TOKEN;

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
};

// Handles messages events
/*function handleMessage(sender_psid, received_message) {
    let response;

    // Check if the message contains text
    if (received_message.text) {

        // Create the payload for a basic text message
        response = {
            "text": `You sent the message: "${received_message.text}". Now send me an image!`
        }
    } else if (received_message.attachments) {

        // Gets the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Is this the right picture?",
                        "subtitle": "Tap a button to answer.",
                        "image_url": attachment_url,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Yes!",
                                "payload": "yes",
                            },
                            {
                                "type": "postback",
                                "title": "No!",
                                "payload": "no",
                            }
                        ],
                    }]
                }
            }
        }

    }

    // Sends the response message
    callSendAPI(sender_psid, response);
}*/

// Handles messaging_postbacks events
let handlePostback = async (sender_psid, received_postback) => {
    let response;
    // Get the payload for the postback
    let payload = received_postback.payload;
    // Set the response based on the postback payload
    switch (payload['__button_text__']) {
        case "Get Started":
            console.log("marchéééééé")
            //get username
            let username = await chatBotService.getFacebookUsername(sender_psid);
            await chatBotService.sendResponseWelcomeNewCustomer(username, sender_psid);

            response = { "text": `Welcome ${username} to SYDNA community`};
            break;
        case "no":
            response = { "text": "hey hey no"};
            break;
        case "yes":
            response = { "text": "hoo hoo"};
            break;
        default:
            console.log("Something wrong with switch case payload")
    }
    // Send the message to acknowledge the postback
    // callSendAPI(sender_psid, response);
};

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": { "text": response }
    };


    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v6.0/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

function firstEntity(nlp, name) {
    return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
};

function handleMessage(sender_psid, message) {
    // handle message for react, like press like button
    // id loke button: sticker_id ...

    if( message && message.attachments && message.attachments[0].payload){
        callSendAPI(sender_psid, "Thanks a lot");
        callSendAPIWithTemplate(sender_psid);
        return;
    }

    let entitiesArr = [ "greetings", "thanks", "bye" ];
    let entityChosen = "";
    entitiesArr.forEach((name) => {
        let entity = firstEntity(message.nlp, name);
        if (entity && entity.confidence > 0.8) {
            entityChosen = name;
        }
    });

    if(entityChosen === ""){
        //default
        callSendAPI(sender_psid,"Sorry, I don't understand. Please, try with other words");
    }else{
        if(entityChosen === "greetings"){
            //send greetings message
            callSendAPI(sender_psid,'Hi there! Welcome to the SWYDNA bot!');
        }
        if(entityChosen === "thanks"){
            //send thanks message
            callSendAPI(sender_psid,`You're wwelcome!`);
        }
        if(entityChosen === "bye"){
            //send bye message
            callSendAPI(sender_psid,'Bye-bye!');
        }
    }
}

let callSendAPIWithTemplate = (sender_psid) => {
    // document fb message template
    // https...
    let body = {
        "recipient":{
            "id": sender_psid
        },
        "message":{
            "attachment":{
                "type":"template",
                "payload":{
                    "template_type":"generic",
                        "elements":[
                        {
                            "title":"Test",
                            "image_url":"https://petersfancybrownhats.com/company_image.png",
                            "subtitle":"It's just a test.",
                            "buttons":[
                                {
                                    "type":"web_url",
                                    "url":"https://petersfancybrownhats.com",
                                    "title":"View Website"
                                },{
                                    "type":"postback",
                                    "title":"Start Chatting",
                                    "payload":"DEVELOPER_DEFINED_PAYLOAD"
                                }
                            ]
                        }
                    ]
                }
            }
        }
    };

    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "acces_token": process.env.PAGE_ACCESS_TOKEN},
        "method": "POST",
        "json": body
    },(err, res, body) => {
        if (!err) {
            //console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
};

module.exports = {
    postWebhook: postWebhook,
    getWebhook: getWebhook,
};