const swaggerJsdoc = require("swagger-jsdoc");

// Định nghĩa các thông tin cơ bản cho API của bạn
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hair Salon Booking API",
      version: "1.0.0",
      description: "API documentation for Hair Salon Booking Application",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8080}`, // Địa chỉ server
      },
    ],
  },
  apis: ["./route/*.js"], // Đường dẫn tới các tệp API của bạn
};

// Tạo swagger docs
const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
