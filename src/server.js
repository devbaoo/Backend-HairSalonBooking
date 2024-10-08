import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from "./route/web";
import connectDB from "./config/connectDB";
import paypalService from './services/paypalService';
import db from "./models/index";
import cors from "cors";
require("dotenv").config();




let app = express();

// Configure CORS
app.use(cors());
app.use(express.json());


// Config app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

viewEngine(app);
initWebRoutes(app);
connectDB();


let port = process.env.PORT || 8080; // Port configuration

app.listen(port, () => {
  console.log("Backend Node.js is running on the port: " + port);
});

