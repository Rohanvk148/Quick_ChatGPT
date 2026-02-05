import Stripe from "stripe";
import Transaction from "../models/transaction";
import { User } from "../models/user";

export const stripeWebhook = async (req, res) => {
    const stripe = new Stripe(process.env.STRIPE_SECREAT_KEY);
    const sig = req.headers["stripe-signature"]
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }
    
    try {
        switch (event.type) {
            case "payment_intent.succeeded":
                {
                    const paymentIntent = event.data.object;
                    // Handle successful payment here
                    const sessionList = await stripe.checkout.sessions.list({
                        payment_intent: paymentIntent.id,
                    })
                    const session = sessionList.data[0];
                    // extract the transactionId, appId from session metadata
                    const {transactionId, appId} = session.metadata;
                    if(appId === 'QuickGPT') 
                    {
                        // Update the transaction status in the database
                        const transaction = await Transaction.findById({_id: transactionId, isPaid: false});
                        // If transaction found, update user credits in user account
                        await User.updateOne({_id: transaction.userId}, {$inc: {credits: transaction.credits}}) // here inc add the number of credits
                        // update credit payment status
                        transaction.isPaid = true;
                        await transaction.save( )
                    }
                    else
                    {
                        return res.json({received: true, message: "Ignored event: Invalid app"})
                    }
                }

                break;
        
            default:
                console.log("unhandled event type:", event.type);
                break;
        }
        res.json({received: true})
    } catch (error) {
        console.error("Error handling webhook:", error);
        return res.status(500).send("Internal Server Error");
    }
}

