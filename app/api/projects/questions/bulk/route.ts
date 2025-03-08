import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// POST /api/projects/questions/bulk - Create multiple questions at once
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
    
    const questions = await request.json();
    
    if (!Array.isArray(questions) || questions.length === 0) {
      return new NextResponse("Invalid request format. Expected an array of questions", { status: 400 });
    }
    
    // Validate the first question's projectId to verify project exists and belongs to user
    const firstQuestion = questions[0];
    const projectId = firstQuestion.projectId;
    
    if (!projectId) {
      return new NextResponse("Missing project ID", { status: 400 });
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
    
    // Validate all questions
    for (const question of questions) {
      if (!question.questionNum || !question.maxMarks || question.maxMarks <= 0) {
        return new NextResponse(
          `Invalid question data: Each question must have a question number and maximum marks greater than 0`,
          { status: 400 }
        );
      }
      
      // Ensure all questions belong to the same project
      if (question.projectId !== projectId) {
        return new NextResponse(
          "All questions must belong to the same project",
          { status: 400 }
        );
      }
    }
    
    // Calculate total marks for all questions
    const totalQuestionMarks = questions.reduce((sum, q) => sum + q.maxMarks, 0);
    
    // Ensure the total question marks do not exceed project total marks
    if (totalQuestionMarks > project.totalMarks) {
      return new NextResponse(
        `Total marks (${totalQuestionMarks}) cannot exceed project total marks (${project.totalMarks})`,
        { status: 400 }
      );
    }
    
    // Create all questions in a transaction to ensure atomicity
    const createdQuestions = await prisma.$transaction(
      questions.map(question => 
        prisma.projectQuestion.create({
          data: {
            projectId: question.projectId,
            questionNum: question.questionNum,
            maxMarks: question.maxMarks,
            description: question.description || "",
            coCode: question.coCode || ""
          }
        })
      )
    );
    
    return NextResponse.json({
      message: `Successfully created ${createdQuestions.length} questions`,
      questions: createdQuestions
    });
  } catch (error) {
    console.error("[PROJECT_QUESTION_BULK_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}