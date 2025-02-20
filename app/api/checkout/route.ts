/* eslint-disable @typescript-eslint/no-unused-vars */
import { getPlanIDFromType } from "@/app/lib/plans";
import { NextRequest, NextResponse } from "next/server";
import {stripe} from "@/app/lib/stripe";
export async function POST(request:NextRequest){
    try{
    const{interval, userId, email} = await request.json();
    if(!interval || !userId || !email){
        return NextResponse.json({error:"Missing required fields"}, {status:400});
    }

    const allowedIntervals = ["week", "month", "year"];
    if(!allowedIntervals.includes(interval)){
        return NextResponse.json({error:"Invalid Plan type"}, {status:400});
    }

    const priceID = getPlanIDFromType(interval);
    if(!priceID){
        return NextResponse.json({error:"Invalid price ID"}, {status:400});
    }

    const session = await stripe.checkout.sessions.create({
        mode:"subscription",
        payment_method_types:["card"],
        line_items:[
            {
                price:priceID,
                quantity:1,
            }
        ],
        customer_email:email,
        metadata:{
            clerkUserId: userId, interval
        },
        success_url:`${process.env.NEXT_PUBLIC_BASE_URL}/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:`${process.env.NEXT_PUBLIC_BASE_URL}/subscribe`
    });
    return NextResponse.json({url:session.url});
}catch(error:unknown){
    return NextResponse.json({error:"Internal ServerError"}, {status:500});
}
}