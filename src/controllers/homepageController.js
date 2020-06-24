import request from "request";
require("dotenv").config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

let getHomepage = (req, res) => {
    return res.render("homepage.ejs");
};

let getFacebookUserProfile = (req, res) => {
    return res.render("profile.ejs");
};

let setUpUserFacebookProfile = (req, res) => {
    // Send the HTTP request to the Messenger Platform
    let data = {
        "get_started":{
            "payload":"GET_STARTED"
        },
        "persistent_menu": [
            {
                "locale": "default",
                "composer_input_disabled": false,
                "call_to_actions": [
                    {
                        "type": "web_url",
                        "title": "View Ytb Chnl",
                        "url": "https://www.youtube.com/channel/UCHqJxLo7mKam9GKqqwr2wfA",
                        "webview_height_ratio": "full"
                    },
                    {
                        "type": "web_url",
                        "title": "view website",
                        "url": "https://sydna.herokuapp.com/",
                        "webview_height_ratio": "full"
                    }
                ]
            }
        ],
        "whitelisted_domains":[
            "https://sydna.herokuapp.com/"
        ]
    };

    request({
        "uri": "https://graph.facebook.com/v6.0/me/messager_profile",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": data
    }, (err, res, body) => {
        if (!err) {
            return res.status(200).json({
                message: "setup done!"
            })
        } else {
            return res.status(500).json({
                "message": "Error from node server"
            })
        }
    });
    return res.status(200).json({
        message: "Ok"
    });
};

module.exports = {
    getHomepage: getHomepage,
    getFacebookUserProfile: getFacebookUserProfile,
    setUpUserFacebookProfile: setUpUserFacebookProfile
};