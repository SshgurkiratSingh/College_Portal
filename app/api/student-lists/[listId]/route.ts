import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function DELETE(
  request: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { listId } = params;
    
    if (!listId || typeof listId !== "string") {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    // Verify that the student list exists and belongs to the current user.
    // We use findFirst to allow filtering by both id and userId.
    const existingList = await prisma.studentList.findFirst({
      where: {
        id: listId,
        userId: currentUser.id
      }
    });

    if (!existingList) {
      return NextResponse.json(
        { error: "List not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    // Delete all students associated with this list first.
    await prisma.student.deleteMany({
      where: {
        studentListId: listId
      }
    });

    // Now safely delete the student list.
    await prisma.studentList.delete({
      where: {
        id: listId
      }
    });

    return NextResponse.json(
      { message: "Student list deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[STUDENT_LIST_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
