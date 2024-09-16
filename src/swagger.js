const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Hair Salon Booking API",
    description: "API Documentation for the Hair Salon Booking Application",
  },
  host: "localhost:8080",
  schemes: ["http"],
  // tags: [
  //   {
  //     name: "Authentication",
  //     description: "APIs for user authentication (login, register)",
  //   },
  //   {
  //     name: "User",
  //     description: "APIs for user management (edit, delete, get all users)",
  //   },
  // ],
};
const outputFile = "./swagger-output.json";
const endpointsFiles = ["src/route/web.js"]; // Đường dẫn tới tệp chứa route chính

swaggerAutogen(outputFile, endpointsFiles, doc);
