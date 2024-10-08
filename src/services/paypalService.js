import axios from "axios";
require("dotenv").config();

async function generateAccessToken() {
    try {
        let response = await axios({
            url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
            method: "POST",
            data: "grant_type=client_credentials",
            auth: {
                username: process.env.PAYPAL_CLIENT_ID,
                password: process.env.PAYPAL_CLIENT_SECRET,
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error("Error generating access token:", error);
        throw error;
    }
}

async function createBooking(bookingAmount, returnUrl, cancelUrl) {
    const accessToken = await generateAccessToken();
    const paymentData = {
        intent: "sale",
        payer: { payment_method: "paypal" },
        redirect_urls: {
            return_url: returnUrl,
            cancel_url: cancelUrl,
        },
        transactions: [{
            amount: {
                total: bookingAmount,
                currency: "USD",
            },
            description: "Booking Appointment",
        }],
    };

    try {
        let response = await axios({
            url: `${process.env.PAYPAL_BASE_URL}/v1/payments/payment`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            data: paymentData,
        });
        return response.data;
    } catch (error) {
        console.error("Error creating booking with PayPal:", error);
        throw error;
    }
}

async function capturePayment(paymentId, payerId) {
    const accessToken = await generateAccessToken();
    try {
        let response = await axios({
            url: `${process.env.PAYPAL_BASE_URL}/v1/payments/payment/${paymentId}/execute`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            data: {
                payer_id: payerId // Include the Payer ID in the request
            },
        });
        return response.data; // Ensure this returns the correct data structure
    } catch (error) {
        console.error("Error capturing payment:", error.response ? error.response.data : error.message); // Log detailed error
        throw error;
    }
}

export default {
    createBooking,
    capturePayment,
};