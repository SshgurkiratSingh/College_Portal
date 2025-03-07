import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(    request: Request, ) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();
  console.log(body.imageSrc);

  try {
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: { image: body.imageSrc },
    });

    return NextResponse.json({ profilePicture: updatedUser.image });
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
