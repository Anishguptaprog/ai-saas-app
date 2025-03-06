/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/app/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { stat } from "fs";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const clerkUser = await currentUser()
        if(!clerkUser?.id){
            return NextResponse.json({error:"Unauthorized"});
        }
        const profile = await prisma.profile.findUnique({
            where:{userId:clerkUser.id},
            select:{subscriptionTier:true}
        });
        if(!profile){
            return NextResponse.json({error:"Profile not found"});
        }
        return NextResponse.json({subscription:profile});
    } catch (error:unknown){
        return NextResponse.json({error:"Internal Error"},{status:500});
    }
}