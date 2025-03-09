import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

/**
 * API endpoint to fetch all scores for a project
 * This allows for efficient batch loading of scores for caching purposes
 */
export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId;
    if (!projectId) {
      return NextResponse.json(
        { error: "Missing project ID" },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();
    if (!currentUser?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Fetch all scores for the project
    // Include project question details for more complete cache data
    const scores = await prisma.projectQuestionScore.findMany({
      where: {
        projectQuestion: {
          projectId,
        },
      },
      include: {
        projectQuestion: {
          select: {
            id: true,
            questionNum: true,
            maxMarks: true,
            description: true,
            coCode: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            rollNo: true,
            email: true,
            section: true,
          },
        },
      },
    });

    // Structure the data for easier consumption in the frontend
    const scoresWithDetails = scores.map((score) => ({
      id: score.id,
      score: score.score,
      projectQuestionId: score.projectQuestionId,
      studentId: score.studentId,
      questionNum: score.projectQuestion.questionNum,
      maxMarks: score.projectQuestion.maxMarks,
      description: score.projectQuestion.description,
      coCode: score.projectQuestion.coCode,
      studentName: score.student.name,
      studentRollNo: score.student.rollNo,
      studentEmail: score.student.email,
      studentSection: score.student.section,
    }));

    return NextResponse.json(scoresWithDetails);
  } catch (error) {
    console.error("[GET_ALL_SCORES]", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}