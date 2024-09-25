import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from "./route/web";
import connectDB from "./config/connectDB";
import cors from "cors";

require("dotenv").config();

let app = express();

// app.use(cors()); co the config nhu nay cung duoc
// nhung van recommend cai nay
app.use(
  cors({
    origin: process.env.URL_REACT,
    methods: "GET, POST, OPTIONS, PUT, PATCH, DELETE",
    allowedHeaders: "X-Requested-With,content-type",
    credentials: true,
  })
);

//config app

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

viewEngine(app);
initWebRoutes(app);

connectDB();

let port = process.env.PORT || 8080;
//Port === undefined => port = 6969

app.listen(port, () => {
  //callback
  console.log("Backend Nodejs is runing on the port : " + port);
});
