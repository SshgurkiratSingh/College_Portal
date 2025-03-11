import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");

    if (!subjectId) {
      return new NextResponse("Subject ID is required", { status: 400 });
    }

    // First get the subject to find its student list ID
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { studentListId: true }
    });

    if (!subject?.studentListId) {
      return new NextResponse("No student list found for this subject", { status: 404 });
    }

    // Then fetch the students from that student list
    const studentList = await prisma.studentList.findUnique({
      where: { id: subject.studentListId },
      include: {
        students: {
          select: {
            id: true,
            rollNo: true,
            name: true
          }
        }
      }
    });

    if (!studentList) {
      return new NextResponse("Student list not found", { status: 404 });
    }

    return NextResponse.json(studentList.students);
  } catch (error) {
    console.error("[ATTENDANCE_STUDENT_LIST_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}