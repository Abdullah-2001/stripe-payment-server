const express = require('express');
const stripe = require('stripe')('sk_test_51PDL8U2Kb7CbmLKZMkr3y0z0UvvfgUIfLmOzyzdMSm21AngkQwExQDX6G6dKKK3YohhdkLZaidXlNpFMfJWjLwis00PMjJZvvB');
const cors = require('cors')

const app = express();
const PORT = 5000;
app.use(express.json());
app.use(cors())

// Endpoint to create a payment intent
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency, metadata } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({ amount, currency, metadata });
        res.status(200).json({ client_secret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/process-payment', async (req, res) => {
    const { paymentMethodId } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            payment_method: paymentMethodId,
            amount: 100, // Amount in cents
            currency: 'usd',
            confirmation_method: 'manual',
            confirm: true,
        });
        // Handle successful payment here
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ error: 'Failed to process payment' });
    }
});

app.listen(PORT, () => {
    console.log('Server is running on port 5000');
});