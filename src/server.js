import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from "./route/web";
import connectDB from "../src/config/conectDB";
import cors from "cors";
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json"); // Tệp JSON được tạo bởi swagger-autogen

require("dotenv").config();

let app = express();

app.use(cors()); //co the config nhu nay cung duoc\

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile)); //swagger-ui-express

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

viewEngine(app);
initWebRoutes(app);

connectDB();

// default route for testing
app.get("/", (req, res) => {
  res.send(
    "Welcome to the Hair Salon Booking API! Open Postman and test it out!"
  );
});

let port = process.env.PORT || 8080;
//Port === undefined => port = 6969

app.listen(port, () => {
  //callback
  console.log(`Backend Nodejs is runing on the port http://localhost:${port}`);
});
