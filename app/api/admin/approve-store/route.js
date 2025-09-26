import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";



//Approve Seller
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const isAdmin = await authAdmin(userId);
        if(!isAdmin){
            return NextResponse.json({ error: 'Not Authorized' }, { status: 401 })
        }
        const {storeId, status} = await request.json()
        if(status === 'approveed'){
            await prisma.store.update({
                where: { id: storeId },
                data: { status: "approved", isActive: true }
            })
        } else if(status === 'rejected'){
            await prisma.store.update({
                where: { id: storeId },
                data: { status: "rejected"}
            })
        }
        return NextResponse.json({ message: status + 'Successfully' })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}


// Get All Pending and Rejected Stores
export async function GET(request){
    try {
        const { userId } = getAuth(request);
        const isAdmin = await authAdmin(userId);
        if(!isAdmin){
            return NextResponse.json({ error: 'Not Authorized' }, { status: 401 })
        }

        const stores = await prisma.store.findMany({
            where: { status: { int: ["pending", "rejected"] }},
            include: { user: true }
        })

        return NextResponse.json({ stores })

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}

