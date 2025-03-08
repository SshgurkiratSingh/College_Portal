import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// GET /api/projects/questions/[questionId] - Get a specific question
export async function GET(
  request: Request,
  { params }: { params: { questionId: string } }
) {
  try {
    const questionId = params.questionId;
    if (!questionId) {
      return new NextResponse("Missing question ID", { status: 400 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch the question
    const question = await prisma.projectQuestion.findUnique({
      where: {
        id: questionId,
      },
      include: {
        project: true,
      },
    });

    if (!question) {
      return new NextResponse("Question not found", { status: 404 });
    }

    // Verify that the project belongs to the current user
    const project = await prisma.project.findFirst({
      where: {
        id: question.projectId,
        userId: currentUser.id,
      },
    });

    if (!project) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("[PROJECT_QUESTIONS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PUT /api/projects/questions/[questionId] - Update a question
export async function PUT(
  request: Request,
  { params }: { params: { questionId: string } }
) {
  try {
    const questionId = params.questionId;
    if (!questionId) {
      return new NextResponse("Missing question ID", { status: 400 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get question data from request body
    const body = await request.json();
    const { projectId, questionNum, maxMarks, description, coCode } = body;

    if (!questionNum || !maxMarks || maxMarks <= 0) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Fetch the existing question with its project
    const existingQuestion = await prisma.projectQuestion.findUnique({
      where: { id: questionId },
      include: { project: true },
    });

    if (!existingQuestion) {
      return new NextResponse("Question not found", { status: 404 });
    }

    // Verify the project belongs to the current user
    const project = await prisma.project.findFirst({
      where: {
        id: existingQuestion.projectId,
        userId: currentUser.id,
      },
    });

    if (!project) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Ensure the updated maxMarks does not exceed the project's totalMarks
    if (maxMarks > project.totalMarks) {
      return new NextResponse(
        `Maximum marks cannot exceed project total marks (${project.totalMarks})`,
        { status: 400 }
      );
    }

    // Update the question
    const updatedQuestion = await prisma.projectQuestion.update({
      where: { id: questionId },
      data: {
        questionNum,
        maxMarks,
        description,
        coCode,
      },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error("[PROJECT_QUESTION_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE /api/projects/questions/[questionId] - Delete a question
export async function DELETE(
  request: Request,
  { params }: { params: { questionId: string } }
) {
  try {
    const questionId = params.questionId;
    if (!questionId) {
      return new NextResponse("Missing question ID", { status: 400 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch the question
    const question = await prisma.projectQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return new NextResponse("Question not found", { status: 404 });
    }

    // Verify the project belongs to the current user
    const project = await prisma.project.findFirst({
      where: {
        id: question.projectId,
        userId: currentUser.id,
      },
    });

    if (!project) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete the question
    await prisma.projectQuestion.delete({
      where: { id: questionId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PROJECT_QUESTION_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
