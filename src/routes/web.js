import express from "express";
import homepageController from "../controllers/homepageController";
import chatbotController from "../controllers/chatbotController";

let router = express.Router();

let initWebRoutes = (app)=> {
    router.get("/", homepageController.getHomepage);
    router.get("/webhook", chatbotController.getWebhook)
    router.post("/webhook", chatbotController.postWebhook);
    router.get("/profile", homepageController.getFacebookUserProfile);
    router.post("/set-up-user-fb-profile", homepageController.setUpUserFacebookProfile);
    return app.use("/", router);
};

module.exports = initWebRoutes;