import { NextApiRequest, NextApiResponse } from 'next'

import { CURRENCY, MIN_AMOUNT, MAX_AMOUNT } from '../../../config'
import { formatAmountForStripe } from '../../../utils/stripe-helpers'

import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // https://github.com/stripe/stripe-node#configuration
    apiVersion: '2022-08-01',
    // apiVersion: '2020-08-27',
})

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    console.log("payment_intent")
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method Not Allowed')
        return
    }
    console.log("payment_intent2")
    const {
        amount,
        payment_intent_id,
    }: { amount: number; payment_intent_id?: string } = req.body
    // Validate the amount that was passed from the client.
    if (!(amount >= MIN_AMOUNT && amount <= MAX_AMOUNT)) {
        res.status(500).json({ statusCode: 400, message: 'Invalid amount.' })
        return
    }
    console.log("payment_intent3")
    if (payment_intent_id) {
        try {
            const current_intent = await stripe.paymentIntents.retrieve(
                payment_intent_id
            )
            // If PaymentIntent has been created, just update the amount.
            if (current_intent) {
                const updated_intent = await stripe.paymentIntents.update(
                    payment_intent_id,
                    {
                        amount: formatAmountForStripe(amount, CURRENCY),
                    }
                )
                res.status(200).json(updated_intent)
                return
            }
        } catch (e) {
            if ((e as any).code !== 'resource_missing') {
                const errorMessage =
                    e instanceof Error ? e.message : 'Internal server error'
                res.status(500).json({ statusCode: 500, message: errorMessage })
                return
            }
        }
    }
    console.log("payment_intent4")
    try {
        // Create PaymentIntent from body params.
        const params: Stripe.PaymentIntentCreateParams = {
            amount: formatAmountForStripe(amount, CURRENCY),
            currency: CURRENCY,
            description: process.env.STRIPE_PAYMENT_DESCRIPTION ?? '',
            automatic_payment_methods: {
                enabled: true,
            },
        }
        const payment_intent: Stripe.PaymentIntent =
            await stripe.paymentIntents.create(params)

        console.log("payment_intent5")
        // console.log(payment_intent)
        res.status(200).json(payment_intent)
    } catch (err) {
        console.log("payment_intent6")
        console.log(err)
        const errorMessage =
            err instanceof Error ? err.message : 'Internal server error'
        res.status(500).json({ statusCode: 500, message: errorMessage })
    }
}
