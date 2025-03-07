import bcrypt from 'bcrypt'
import prisma from '@/app/libs/prismadb'
import {NextResponse} from 'next/server'
export async function GET(
    request:Request
){
    const body = await request.json();
   console.log(body);
   const item = await prisma.item.findUnique({
    where: {
      id: body.id
    }
  });

    return NextResponse.json(item);
}