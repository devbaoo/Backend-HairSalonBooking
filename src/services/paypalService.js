import axios from 'axios';
require('dotenv').config();

// Function to generate an access token from PayPal
async function generateAccessToken() {
    try {
        let response = await axios({
            url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
            method: 'POST',
            data: 'grant_type=client_credentials',
            auth: {
                username: process.env.PAYPAL_CLIENT_ID,
                password: process.env.PAYPAL_CLIENT_SECRET,
            },
        });
        console.log('Generated Access Token:', response.data.access_token); // Log token
        return response.data.access_token;
    } catch (error) {
        console.log('Error generating access token:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Function to create a booking and get the approval link from PayPal
async function createBooking(bookingAmount, returnUrl, cancelUrl) {
    const accessToken = await generateAccessToken();
    const paymentData = {
        intent: 'sale',
        payer: {
            payment_method: 'paypal',
        },
        redirect_urls: {
            return_url: returnUrl,
            cancel_url: cancelUrl,
        },
        transactions: [{
            amount: {
                total: bookingAmount,
                currency: 'USD',
            },
            description: 'Booking Appointment',
        }],
    };

    try {
        let response = await axios({
            url: `${process.env.PAYPAL_BASE_URL}/v1/payments/payment`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            data: paymentData,
        });
        console.log('Create Booking Response:', response.data); // Log response
        return response.data.links.find(link => link.rel === 'approval_url').href; // Return approval link
    } catch (error) {
        console.log('Error creating booking with PayPal:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Function to capture payment after the customer approves it
async function capturePayment(paymentToken) {
    const accessToken = await generateAccessToken();

    try {
        let response = await axios({
            url: `${process.env.PAYPAL_BASE_URL}/v1/payments/payment/${paymentToken}/execute`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            data: {}, // No additional data needed
        });
        return response.data; // Return PayPal response
    } catch (error) {
        console.log('Error capturing payment:', error.response ? error.response.data : error.message);
        throw error;
    }
}

export default {
    createBooking,
    capturePayment,
};
