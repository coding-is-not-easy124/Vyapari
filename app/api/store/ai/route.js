import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { openai } from "@/configs/openai";

async function main(base64Image, mimeType) {
    const messages = [
    {
        "role": "system",
        "content": `
            You are a product listing assistant for an e-commerce store.
            Your job is to analyze an image of a product and generate structured data.

            Respond ONLY with raw JSON (no code block, no markdown, no explanation).
            The JSON must strictly follow this schema:
            
            {
                "name": string,                 // Short Product Name
                "description": string,          // Marketing-Friendly
                description of the product
            }
        `
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Analyze this image and return name + description",
        },
        {
          "type": "image_url",
          "image_url": {
            "url": `data: ${mimeType};base64,${base64Image}`
          },
        },
      ],
    }
  ];

   const response = await openai.chat.completions.create({
       model: "gemini-2.0-flash",
       messages: messages,
   });

   console.log(response.choices[0]);

}


export async function POST(request) {
    try {

        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);
        if(!isSeller){
            return NextResponse.json({ error: 'not authorized' }, { status: 401 })
        }
        const { base64Image, mimeType } = await request.json();

    } catch (error) {
        
    }
}