import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// POST /api/projects/questions - Create a new question
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: {
        email: currentUser.email
      }
    });
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const body = await request.json();
    const { projectId, questionNum, maxMarks, description, coCode } = body;
    
    if (!projectId || !questionNum || !maxMarks || maxMarks <= 0) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    
    // Check if the project exists and belongs to the current user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id
      }
    });
    
    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }
    
    // Ensure the question marks do not exceed project total marks
    if (maxMarks > project.totalMarks) {
      return new NextResponse(
        `Maximum marks cannot exceed project total marks (${project.totalMarks})`,
        { status: 400 }
      );
    }
    
    // Create the project question
    const question = await prisma.projectQuestion.create({
      data: {
        projectId,
        questionNum,
        maxMarks,
        description,
        coCode
      }
    });
    
    return NextResponse.json(question);
  } catch (error) {
    console.error("[PROJECT_QUESTION_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
