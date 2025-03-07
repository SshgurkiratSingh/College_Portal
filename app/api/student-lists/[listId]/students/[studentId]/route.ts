import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// Update a student in a student list
export async function PUT(
  request: Request,
  { params }: { params: { listId: string; studentId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { listId, studentId } = params;
    const body = await request.json();
    const { rollNo, name, email, section, batch } = body;

    // Validate required fields
    if (!rollNo || !name) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify that the student list belongs to the current user
    const studentList = await prisma.studentList.findFirst({
      where: {
        id: listId,
        userId: currentUser.id,
      },
    });
    if (!studentList) {
      return new NextResponse("Student list not found or unauthorized", { status: 404 });
    }

    // Fetch the student to ensure it belongs to the list
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student || student.studentListId !== listId) {
      return new NextResponse("Student not found in the specified list", { status: 404 });
    }

    // Update the student using the unique id
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        rollNo,
        name,
        email,
        section,
        batch,
      },
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error("[STUDENT_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Delete a student from a student list
export async function DELETE(
  request: Request,
  { params }: { params: { listId: string; studentId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { listId, studentId } = params;

    // Verify that the student list belongs to the current user
    const studentList = await prisma.studentList.findFirst({
      where: {
        id: listId,
        userId: currentUser.id,
      },
    });
    if (!studentList) {
      return new NextResponse("Student list not found or unauthorized", { status: 404 });
    }

    // Fetch the student to ensure it belongs to the list
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student || student.studentListId !== listId) {
      return new NextResponse("Student not found in the specified list", { status: 404 });
    }

    // Delete the student using the unique id
    await prisma.student.delete({
      where: { id: studentId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[STUDENT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
