import imagekit from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


// Create the Store
export async function POST(request){
    try {
        const {userId} = getAuth(request)
        // Get the data from the form
        const formData = await request.formData()
        const name = formData.get("name")
        const username = formData.get("username")
        const description = formData.get("description")
        const email = formData.get("email")
        const contact = formData.get("contact")
        const address = formData.get("address")
        const image = formData.get("image")

        if(!name || !username || !description || !email || !contact || !address || !image){
            return NextResponse.json({error: "Missing Store Information"}, {status: 400})
        }

        // Check if User has already registered a Store
        const store = await prisma.store.findFirst({
            where: { userId: userId }
        })

        // If the store is already registered, then send the status of the Store
        if(store){
            return NextResponse.json({ status: store.status })
        }

        // Check if Username is already taken
        const isUsernameTaken = await prisma.store.findFirst({
            where: { username: username.toLowerCase() }
        })

        if(isUsernameTaken){
            return NextResponse.json({ error: "Username is already taken"}, { status: 400 })
        }

        // Image Upload to ImageKit

        const buffer = Buffer.from(await image.arrayBuffer());
        const response = await imagekit.upload({
            file: buffer,
            fileName: image.name,
            folder: "logos"
        })

        const optimizedImage = imagekit.url({
            path: response.filePath,
            transformation: [
                {quality: 'auto'},
                {format: 'webp'},
                {width: '512'}
            ]
        })

        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) {
            return NextResponse.json({ error: "User does not exist" }, { status: 400 });
        }

        const newStore = await prisma.store.create({
            data: {
                userId,
                name,
                description,
                username: username.toLowerCase(),
                email,
                contact,
                address,
                logo: optimizedImage
            }
        })

        // Link Store to User
        await prisma.user.update({
            where: { id: userId },
            data: { store: {connect: {id: newStore.id}} }
        })

        return NextResponse.json({ message: "Applied, Waiting for Approval" })

    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {status: 400})
    }
}

// Check if User has already registered a store, If yes then send status of Store
export async function GET(request) {
    try {
        const {userId} = getAuth(request);
        // Check if User has already registered a Store
        const store = await prisma.store.findFirst({
            where: { userId: userId }
        })

        // If the store is already registered, then send the status of the Store
        if(store){
            return NextResponse.json({ status: store.status })
        }

        return NextResponse.json({status: "Not Registered"})
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {status: 400})
    }
}