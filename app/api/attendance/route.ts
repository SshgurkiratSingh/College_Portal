import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// POST /api/attendance
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, description, totalMarks, subjectId, students } = body;

    if (!name || !totalMarks || !subjectId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create attendance record
    const attendance = await prisma.attendanceInternal.create({
      data: {
        name,
        description,
        totalMarks,
        subject: { connect: { id: subjectId } },
        user: { connect: { id: currentUser.id } },
      },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("ERROR_ATTENDANCE_POST", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// GET /api/attendance
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(request.url);
    const subjectId = url.searchParams.get("subjectId");

    let attendance;
    if (subjectId) {
      attendance = await prisma.attendanceInternal.findMany({
        where: {
          subjectId: subjectId,
          userId: currentUser.id,
        },
        include: {
          subject: true,
        },
      });
    } else {
      attendance = await prisma.attendanceInternal.findMany({
        where: {
          userId: currentUser.id,
        },
        include: {
          subject: true,
        },
      });
    }

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("ERROR_ATTENDANCE_GET", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}