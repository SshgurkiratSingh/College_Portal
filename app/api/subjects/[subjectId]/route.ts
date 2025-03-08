import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

// GET handler - Get a specific subject by ID
export async function GET(
  request: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: params.subjectId },
      include: {
        // Include the student list (if any) selecting only the name
        studentList: { select: { name: true } },
      },
    });

    if (!subject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    // Ensure courseOutcomes is returned as an array.
    const courseOutcomes = Array.isArray(subject.courseOutcomes)
      ? subject.courseOutcomes
      : [];

    // Return the subject with course outcomes and studentList.
    const transformedSubject = {
      ...subject,
      courseOutcomes,
    };

    return NextResponse.json(transformedSubject);
  } catch (error) {
    console.error("Error getting subject:", error);
    return NextResponse.json(
      { error: "Failed to get subject" },
      { status: 500 }
    );
  }
}

// PATCH handler - Update a specific subject by ID
export async function PATCH(
  request: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    const body = await request.json();
    const { name, code, studentListId, description, courseOutcomes } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Subject name is required" },
        { status: 400 }
      );
    }

    // Update scalar fields and replace the courseOutcomes JSON field.
    const updatedSubject = await prisma.subject.update({
      where: { id: params.subjectId },
      data: {
        name,
        code,
        description,
        studentListId: studentListId || null,
        // Replace courseOutcomes with the new JSON array (or empty array if not provided)
        courseOutcomes: courseOutcomes || [],
      },
      include: {
        studentList: { select: { name: true } },
      },
    });

    return NextResponse.json(updatedSubject);
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json(
      { error: "Failed to update subject" },
      { status: 500 }
    );
  }
}

// DELETE handler - Delete a specific subject by ID
export async function DELETE(
  request: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    const existingSubject = await prisma.subject.findUnique({
      where: { id: params.subjectId },
    });

    if (!existingSubject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    await prisma.subject.delete({
      where: { id: params.subjectId },
    });

    return NextResponse.json(
      { message: "Subject deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}
