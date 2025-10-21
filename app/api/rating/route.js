import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";



// Add New Rating
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const {orderId, productId, rating, review} = await request.json();
        const order = await prisma.order.findUnique({ where: {id: orderId, userId}});
        if (!order) {
            return NextResponse.json({ error: "Order Not Found!!" }, { status: 404 });
        }
        const isAlreadyRated = await prisma.rating.findFirst({ where: {productId, orderId} })
        if(isAlreadyRated){
            return NextResponse.json({ error: "Product Already Rated!!" }, { status: 400 })
        }
        const response = await prisma.rating.create({
            data: {userId, productId, rating, review, orderId}
        })
        return NextResponse.json({ message: "Rating Added Successfully!!", rating: response })
    } catch (error) {
        console.error(error);
        return NextResponse.json({});
    }
}