import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

interface IParams {
  attendanceId?: string;
}

// GET /api/attendance/[attendanceId]
export async function GET(
  request: Request,
  { params }: { params: IParams }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { attendanceId } = params;
    if (!attendanceId) {
      return new NextResponse("Attendance ID is required", { status: 400 });
    }

    const attendance = await prisma.attendanceInternal.findUnique({
      where: {
        id: attendanceId,
      },
      include: {
        subject: true,
      },
    });

    if (!attendance) {
      return new NextResponse("Attendance not found", { status: 404 });
    }

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("ERROR_ATTENDANCE_GET_BY_ID", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PATCH /api/attendance/[attendanceId]
export async function PATCH(
  request: Request,
  { params }: { params: IParams }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { attendanceId } = params;
    if (!attendanceId) {
      return new NextResponse("Attendance ID is required", { status: 400 });
    }

    const body = await request.json();
    const { name, description, totalMarks } = body;

    const attendance = await prisma.attendanceInternal.findUnique({
      where: {
        id: attendanceId,
      },
    });

    if (!attendance) {
      return new NextResponse("Attendance not found", { status: 404 });
    }

    if (attendance.userId !== currentUser.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedAttendance = await prisma.attendanceInternal.update({
      where: {
        id: attendanceId,
      },
      data: {
        name,
        description,
        totalMarks,
      },
    });

    return NextResponse.json(updatedAttendance);
  } catch (error) {
    console.error("ERROR_ATTENDANCE_PATCH", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/attendance/[attendanceId]
export async function DELETE(
  request: Request,
  { params }: { params: IParams }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { attendanceId } = params;
    if (!attendanceId) {
      return new NextResponse("Attendance ID is required", { status: 400 });
    }

    const attendance = await prisma.attendanceInternal.findUnique({
      where: {
        id: attendanceId,
      },
    });

    if (!attendance) {
      return new NextResponse("Attendance not found", { status: 404 });
    }

    if (attendance.userId !== currentUser.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.attendanceInternal.delete({
      where: {
        id: attendanceId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("ERROR_ATTENDANCE_DELETE", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}