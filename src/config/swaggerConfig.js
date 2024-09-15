// src/config/swaggerConfig.js
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hair Salon Booking API",
      version: "1.0.0",
      description: "API documentation for Hair Salon Booking",
    },
  },
  apis: ["./src/controllers/*.js", "./src/route/*.js"], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
