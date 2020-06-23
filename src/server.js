require("dotenv").config();
import express from "express";
import configViewEngine from "./config/viewEngine";
import initWebRoute from "./routes/web";
import bodyParser from "body-parser";

let app = express();

// config view engine
configViewEngine(app);

//use body-parser to post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// init all web routes
initWebRoute(app);

let port = process.env.PORT || 8080;

app.listen(port, ()=>{
    console.log(`App is running at the port ${port}`);
});