// const express = require('express');
// const stripe = require('stripe')('sk_test_51PDL8U2Kb7CbmLKZMkr3y0z0UvvfgUIfLmOzyzdMSm21AngkQwExQDX6G6dKKK3YohhdkLZaidXlNpFMfJWjLwis00PMjJZvvB');
// // const stripe = require('stripe')('pk_test_51NApxXIoVTypr6KdA1uTeWKHJy16NBImQ3KsEFfinxaDTVu3RlnOFpYWStrnHiiQza5QBVEn50mtERCcyPtQC4VM000GBZXhAo');
// const cors = require('cors')

// const app = express();
// const PORT = 5000;
// app.use(express.json());
// app.use(cors())

// // Endpoint to create a payment intent
// app.post('/create-payment-intent', async (req, res) => {
//     console.log(req);

//     try {
//         const { amount, currency, metadata } = req.body;
//         const paymentIntent = await stripe.paymentIntents.create({ amount, currency, metadata });
//         res.status(200).json({ client_secret: paymentIntent.client_secret });
//     } catch (error) {
//         console.error('Error creating payment intent:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.post('/process-payment', async (req, res) => {
//     const { paymentMethodId } = req.body;

//     try {
//         const paymentIntent = await stripe.paymentIntents.create({
//             payment_method: paymentMethodId,
//             amount: 100, // Amount in cents
//             currency: 'usd',
//             confirmation_method: 'manual',
//             confirm: true,
//         });
//         // Handle successful payment here
//         res.status(200).json({ success: true });
//     } catch (error) {
//         console.error('Error processing payment:', error);
//         res.status(500).json({ error: 'Failed to process payment' });
//     }
// });

// app.listen(PORT, () => {
//     console.log('Server is running on port 5000');
// });

const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('sk_test_51NApxXIoVTypr6KdwEEqcntQ4WS1iQKbA3qdUbapYg6ThleHSJnzN4FO0nJgJEYKcIye7EDkSOsD4rJaJV4wd1sT00KUFvnHmx');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000', // Set to '*' if testing, but specify frontend URL for production
    methods: 'GET,POST,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
}));

app.use(express.json()); // ✅ Important: Parse JSON body requests

const YOUR_DOMAIN = 'http://localhost:3000';

app.post('/create-checkout-session', async (req, res) => {
    try {
        const item = req.body; // Get cart items from request

        const lineItems = {
            price_data: {
                currency: 'usd',
                product_data: { 
                    name: item.gear_item_details.name,
                    description: item.gear_item_details.description,
                    images: [item.gear_item_details.gear_item_pictures[0].image]
                },
                unit_amount: item.price * 100, // Stripe requires price in cents
            },
            quantity: item.quantity,
        };

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: item.renter,
            line_items: [lineItems],
            mode: 'payment',
            success_url: `${YOUR_DOMAIN}/cart?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${YOUR_DOMAIN}/cart`,
            discounts: [{ coupon: 'bKIiEms5' }], // Example discount
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB'], // Adjust as needed
            },
            automatic_tax: { enabled: true },
        });        

        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/retrieve-session', async (req, res) => {
    const { sessionId } = req.query;
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        res.json(session);
    } catch (error) {
        console.error('Error retrieving session:', error);
        res.status(500).json({ error: 'Failed to retrieve session' });
    }
});

app.listen(5000, () => console.log('Running on port 5000'));