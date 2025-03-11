import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    if (!studentId) {
      return NextResponse.json(
        { error: "Missing student ID" },
        { status: 400 }
      );
    }
    
    const projectId = params.projectId;
    if (!projectId) {
      return NextResponse.json(
        { error: "Missing project ID" },
        { status: 400 }
      );
    }
    
    const currentUser = await getCurrentUser();
    if (!currentUser?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Verify that the project exists and belongs to the current user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: currentUser.id,
      },
    });
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }
    
    // First, get all valid project question IDs for this project
    const projectQuestions = await prisma.projectQuestion.findMany({
      where: {
        projectId,
      },
      select: {
        id: true,
      },
    });
    
    const projectQuestionIds = projectQuestions.map(q => q.id);
    
    // Now fetch scores using the valid question IDs
    const scores = await prisma.projectQuestionScore.findMany({
      where: {
        studentId,
        projectQuestionId: {
          in: projectQuestionIds,
        },
      },
    });
    
    return NextResponse.json(scores);
  } catch (error) {
    console.error("[GET_SCORES]", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}