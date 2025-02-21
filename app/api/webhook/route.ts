/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "../../lib/stripe";
import {prisma} from "../../lib/prisma";
export async function POST(request:NextRequest){
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");
    const webhooksecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event:Stripe.Event;
    try {
        event = Stripe.webhooks.constructEvent(body, signature|| "",webhooksecret);
    } catch (error:any) {
        return NextResponse.json({error:error.message},{ status: 400 });
    }
    try{
    switch(event.type){
        case "checkout.session.completed":{
            const session = event.data.object as Stripe.Checkout.Session;
            await  handleCheckoutSessionCompleted(session)
            break;
        }
        case "customer.subscription.deleted":{
            const session = event.data.object as Stripe.Subscription;
            await handleSubscriptionDeleted(session)
            break;
        }
        case "invoice.payment_failed":{
            const session = event.data.object as Stripe.Invoice;
            await handleInvoicePaymentFailed(session)
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);

    }
    }catch(error){
        return NextResponse.json({error:error.message},{ status: 400 });
    }
    return NextResponse.json({received:true});

}

async function handleCheckoutSessionCompleted(session:Stripe.Checkout.Session){
    const userId = session.metadata?.clerkUserId;
    if(!userId){
        console.log("no user id found");
        return;
    }
    const subscriptionId = session.subscription as string;
    if(!userId){
        console.log("no subscription id found");
        return;
    }
    try {
        await prisma.profile.update({    
            where:{userId},
            data:{
                stripeSubscriptionId:subscriptionId,
                subscriptionActive:true,
                subscriptionTier:session.metadata?.planType || null
            }
        });
    }catch(error){
        console.log("error updating user profile",error.message);
    }
}
async function handleSubscriptionDeleted(subscription:Stripe.Subscription){
    const subId = subscription.id;
    let userId:string|undefined
    try{
        const profile = await prisma.profile.findUnique({
            where:{
                stripeSubscriptionId:subId
            },select:{
                userId:true
            }
        })
        if(!profile?.userId){
            console.log("no user found");
            return;
        }
        userId = profile.userId;
    } catch(error){
        console.log("error finding user",error.message);
        return;
    }
    try {
        await prisma.profile.update({
            where:{userId:userId},
            data:{
                subscriptionActive:false,
                stripeSubscriptionId:null,
                subscriptionTier:null,
            }
        });
    } catch (error) {
        console.log("error updating user profile",error.message);
    }
}
async function handleInvoicePaymentFailed(invoice:Stripe.Invoice){
    const subId = invoice.subscription as string;
    if(!subId){
        console.log("no subscription id found");
        return;
    }
    let userId:string|undefined
    try{
        const profile = await prisma.profile.findUnique({
            where:{
                stripeSubscriptionId:subId
            },select:{
                userId:true
            }
        })
        if(!profile?.userId){
            console.log("no user found");
            return;
        }
        userId = profile.userId;
    } catch(error){
        console.log("error finding user",error.message);
        return;
    }
    try {
        await prisma.profile.update({
            where:{userId:userId},
            data:{
                subscriptionActive:false
            }
        });
    } catch (error) {
        console.log("error updating user profile",error.message);
    }
}