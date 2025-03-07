import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(    request: Request, ) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();
 
const dob = new Date(body.dob);

  try {
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: { DateOfBirth: dob,Height:parseInt(body.height),weight:parseFloat(body.weight),gender:body.gender,lastUpdated:new Date() },
    });

    return NextResponse.json({ profilePicture: updatedUser.image });
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
