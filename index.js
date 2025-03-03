const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('sk_test_51NApxXIoVTypr6KdwEEqcntQ4WS1iQKbA3qdUbapYg6ThleHSJnzN4FO0nJgJEYKcIye7EDkSOsD4rJaJV4wd1sT00KUFvnHmx');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000/', // Set to '*' if testing, but specify frontend URL for production
    methods: 'GET,POST,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
}));

app.use(express.json()); // ✅ Important: Parse JSON body requests

const YOUR_DOMAIN = 'http://localhost:3000/';

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