import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(
    request: Request, 
  ) {
    const currentUser = await getCurrentUser();
  
    if (!currentUser) {
      return NextResponse.error();
    }
    if (currentUser.email !== "guri2022@hotmail.com") {
      return NextResponse.error();
    }
  const body = await request.json();
  const { category, calories, availability, SubDes, counter, imageSrc1, imageSrc2, price, title, description } = body;
const newProduct=await prisma.item.create({data:{
    category,calories:parseInt(calories),availability:parseInt(availability),SubDes,counter:parseInt(counter),imageSrc1,imageSrc2,price:parseInt(price),title,description
}})
return NextResponse.json(newProduct);
    console.log(body);
  }  
