import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// GET /api/projects/[projectId]/questions - Get all questions for a specific project
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
    
    // Check if the project exists and belongs to the current user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: currentUser.id,
      },
    });
    
    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }
    
    // Fetch all questions for this project, ordered by question number
    const questions = await prisma.projectQuestion.findMany({
      where: {
        projectId,
      },
      orderBy: {
        questionNum: "asc",
      },
    });
    
    return NextResponse.json(questions);
  } catch (error) {
    console.error("[PROJECT_QUESTIONS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
