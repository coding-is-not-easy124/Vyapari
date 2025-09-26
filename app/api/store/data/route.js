import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Get Store Info and Store Products

export async function GET(request) {
    try {
        // Get Store Username from Query Params
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username').toLowerCase();
        if(!username){
            return NextResponse.json({ error: "Missing Username" }, { status: 400 })
        }

        // Get Store Info and InStock Products With Ratings
        const store = await prisma.store.findUnique({
            where: {username, isActive: true},
            include: {Product: {include: {rating: true}}}
        })
        if(!store){
            return NextResponse.json({error: "Store Not Found"}, {status: 400})
        }
        return NextResponse.json({store})
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}