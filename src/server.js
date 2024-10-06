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

app.get('/api/payment/success', async (req, res) => {
  try {
    const { token } = req.query; // Get PayPal token from the URL query

    if (!token) {
      return res.status(400).json({ errCode: 1, errMsg: 'Missing PayPal token' });
    }

    // Find the booking associated with this token
    let booking = await db.Booking.findOne({
      where: { token: token, statusId: 'S1' }, // Ensure booking is still pending
      include: { model: db.Payment }
    });

    if (!booking) {
      return res.status(404).json({ errCode: 2, errMsg: 'Booking not found or already processed' });
    }

    // Capture payment using the token
    let paymentCapture = await paypalService.capturePayment(token);
    console.log('Payment capture response:', paymentCapture);

    if (paymentCapture.status === 'COMPLETED') {
      // Update payment record
      let payment = await db.Payment.findOne({ where: { bookingId: booking.id } });
      payment.paymentStatus = 'Completed';
      payment.paymentToken = token;
      await payment.save();

      // Update booking status
      booking.statusId = 'S2'; // Mark booking as confirmed
      await booking.save();

      res.redirect(`${process.env.URL_REACT}/payment-confirmation?status=success`); // Redirect to frontend success page
    } else {
      // Handle failed payment
      res.redirect(`${process.env.URL_REACT}/payment-confirmation?status=failed`);
    }
  } catch (error) {
    console.error('Error during payment verification:', error);
    res.redirect(`${process.env.URL_REACT}/payment-confirmation?status=error`);
  }
});


let port = process.env.PORT || 8080; // Port configuration

app.listen(port, () => {
  console.log("Backend Node.js is running on the port: " + port);
});
