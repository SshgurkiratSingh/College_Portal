import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// GET /api/projects/[projectId]/students - Get all students assigned to a project's subject
export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId;
    if (!projectId) {
      return new NextResponse("Missing project ID", { status: 400 });
    }
    
    const currentUser = await getCurrentUser();
    if (!currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Find the project and its associated subject
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: currentUser.id,
      },
      include: {
        subject: true,
      },
    });
    
    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }
    
    // Find all student lists associated with this subject
    const studentLists = await prisma.studentList.findMany({
      where: {
        subjects: {
          some: {
            id: project.subjectId,
          },
        },
        userId: currentUser.id,
      },
      include: {
        students: true,
      },
    });
    
    // Combine all students from all student lists
    const allStudents = studentLists.flatMap((list) => list.students);
    
    // Remove potential duplicates (in case a student is in multiple lists)
    const uniqueStudents = Array.from(new Map(allStudents.map((s) => [s.id, s])).values());
    
    // Sort students by roll number
    uniqueStudents.sort((a, b) => a.rollNo.localeCompare(b.rollNo));
    
    return NextResponse.json(uniqueStudents);
  } catch (error) {
    console.error("[PROJECT_STUDENTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}