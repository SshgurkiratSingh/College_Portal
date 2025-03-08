import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

// Define interfaces for API request/response
interface CourseOutcomeRequest {
  code: string;
  description?: string;
  // Optionally, the client can send a mappings object.
  // For example: { "PO1": 3, "PO2": 0, ... }
  mappings?: Record<string, number>;
}

export interface SubjectRequest {
  name: string;
  code?: string;
  studentListId?: string;
  courseOutcomes?: CourseOutcomeRequest[];
  // Removed credits and outcomeMappings
}

// Helper to get the current authenticated user
const getCurrentUser = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });
    return currentUser;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// GET handler - Get all subjects (optionally filtered by studentListId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentListId = searchParams.get("studentListId");
    
    // Get the current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Filter by both the user's ID and studentListId (if provided)
    const whereClause = {
      createdById: currentUser.id,
      ...(studentListId ? { studentListId: studentListId } : {}),
    };

    // Fetch subjects including the studentList (if available)
    const subjects = await prisma.subject.findMany({
      where: whereClause,
      include: {
        studentList: { select: { name: true } },
      },
    });

    // Transform the data for the frontend.
    // Ensure that courseOutcomes is an array.
    const transformedSubjects = subjects.map((subject) => {
      const courseOutcomesArray = Array.isArray(subject.courseOutcomes)
        ? subject.courseOutcomes
        : [];
      return {
        id: subject.id,
        name: subject.name,
        code: subject.code || "",
        studentListId: subject.studentListId || "",
        courseOutcomes: courseOutcomesArray.map((co: any) => ({
          code: co.code,
          description: co.description,
          mappings: co.mappings, // expected to be an object, e.g., { "PO1": 3, ... }
        })),
        studentList: subject.studentList,
      };
    });

    return NextResponse.json(transformedSubjects);
  } catch (error) {
    console.error("Error getting subjects:", error);
    return NextResponse.json(
      { error: "Failed to get subjects" },
      { status: 500 }
    );
  }
}

// POST handler - Create a new subject with course outcomes stored as JSON
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, code, studentListId, courseOutcomes = [] } =
      body as SubjectRequest;

    if (!name)
      return NextResponse.json(
        { error: "Subject name is required" },
        { status: 400 }
      );

    // Prepare final course outcomes: ensure each has a mappings property (defaulting to an empty object)
    const finalCourseOutcomes = courseOutcomes.map((co) => ({
      code: co.code,
      description: co.description || "",
      mappings: co.mappings || {},
    }));

    // Create the subject in a transaction.
    const newSubject = await prisma.$transaction(async (prisma) => {
      const subject = await prisma.subject.create({
        data: {
          name,
          code,
          courseOutcomes: finalCourseOutcomes,
          createdBy: { connect: { id: currentUser.id } },
        },
      });

      if (studentListId) {
        await prisma.subject.update({
          where: { id: subject.id },
          data: { studentListId: studentListId },
        });
      }

      return await prisma.subject.findUnique({
        where: { id: subject.id },
        include: { studentList: { select: { name: true } } },
      });
    });

    if (!newSubject) throw new Error("Failed to create subject");

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}

// Helper function to get a specific subject by id
// Removed 'export' keyword to fix "not a valid Route export field" error
const getSubject = async (id: string, userId?: string) => {
  try {
    const subject = await prisma.subject.findFirst({
      where: { 
        id,
        ...(userId ? { createdById: userId } : {})
      },
      include: { studentList: { select: { name: true } } },
    });
    if (!subject) return null;
    return subject;
  } catch (error) {
    console.error("Error getting subject:", error);
    return null;
  }
};

// PUT handler - Update a specific subject by ID
export async function PUT(
  request: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subjectId } = params;
    const body = await request.json();
    const { name, code, studentListId, courseOutcomes = [] } =
      body as SubjectRequest;

    if (!name)
      return NextResponse.json(
        { error: "Subject name is required" },
        { status: 400 }
      );

    // Check if subject exists and belongs to current user
    const existingSubject = await getSubject(subjectId, currentUser.id);
    if (!existingSubject)
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });

    const finalCourseOutcomes = courseOutcomes.map((co) => ({
      code: co.code,
      description: co.description || "",
      mappings: co.mappings || {},
    }));

    const updatedSubject = await prisma.$transaction(async (prisma) => {
      await prisma.subject.update({
        where: { id: subjectId },
        data: {
          name,
          code,
          courseOutcomes: finalCourseOutcomes,
        },
      });

      await prisma.subject.update({
        where: { id: subjectId },
        data: { studentListId: studentListId || null },
      });

      return await prisma.subject.findUnique({
        where: { id: subjectId },
        include: { studentList: { select: { name: true } } },
      });
    });

    if (!updatedSubject) throw new Error("Failed to update subject");

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
    const currentUser = await getCurrentUser();
    if (!currentUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subjectId } = params;
    const existingSubject = await getSubject(subjectId, currentUser.id);
    if (!existingSubject)
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });

    await prisma.subject.delete({
      where: { id: subjectId },
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