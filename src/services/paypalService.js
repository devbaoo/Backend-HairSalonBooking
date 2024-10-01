const axios = require('axios');
require('dotenv').config();

async function generateAccessToken() {
    let response = await axios({
        url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
        method: 'POST',
        data: 'grant_type=client_credentials',
        auth: {
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_CLIENT_SECRET,
        },
    });
    return response.data.access_token;
}

async function createBooking(bookingAmount, returnUrl, cancelUrl) {
    try {
        // Ensure bookingAmount is a valid number
        if (typeof bookingAmount !== 'number' || isNaN(bookingAmount) || bookingAmount <= 0) {
            throw new Error('Invalid booking amount: must be a valid number.');
        }

        let accessToken = await generateAccessToken();
        let response = await axios({
            url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: 'USD', // Currency type
                        value: bookingAmount.toFixed(2), // Correctly formatted value
                    },
                }],
                application_context: {
                    return_url: returnUrl,
                    cancel_url: cancelUrl,
                },
            }),
        });
        return response.data.links.find(link => link.rel === 'approve').href;
    } catch (error) {
        console.log('Error creating PayPal order: ', error.response ? error.response.data : error.message);
        throw error; // Rethrow the error after logging
    }
}

async function capturePayment(paymentToken) {
    let accessToken = await generateAccessToken();
    let response = await axios({
        url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${paymentToken}/capture`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data;
}

module.exports = { createBooking, capturePayment };
