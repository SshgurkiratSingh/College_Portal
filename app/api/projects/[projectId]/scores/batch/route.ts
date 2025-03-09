import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// POST /api/projects/[projectId]/scores/batch - Batch save scores for a project
export async function POST(
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
    
    // Get data from request body
    const body = await request.json();
    const { scores, sessionId } = body;
    
    if (!Array.isArray(scores) || scores.length === 0) {
      return new NextResponse("No scores provided", { status: 400 });
    }
    
    // Verify the project belongs to the current user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: currentUser.id
      }
    });
    
    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }
    
    // Verify all questions belong to the project
    const questionIds = Array.from(new Set(scores.map(score => score.projectQuestionId)));
    const questions = await prisma.projectQuestion.findMany({
      where: {
        id: {
          in: questionIds
        },
        projectId
      }
    });
    
    if (questions.length !== questionIds.length) {
      return new NextResponse("Some questions do not belong to this project", { status: 400 });
    }
    
    // Process each score - update if exists, create if not
    const results = await Promise.all(
      scores.map(async (score: any) => {
        // Validate basic score data
        if (!score.projectQuestionId || !score.studentId || score.score === undefined) {
          return { error: "Invalid score data", score };
        }
        
        // Find the question to get max marks
        const question = questions.find(q => q.id === score.projectQuestionId);
        if (!question) {
          return { error: "Question not found", score };
        }
        
        // Validate score value
        if (typeof score.score !== 'number' || score.score < 0 || score.score > question.maxMarks) {
          return { 
            error: `Score must be between 0 and ${question.maxMarks}`, 
            score 
          };
        }
        
        // Update or create the score
        try {
          if (score.id) {
            // Update existing score
            await prisma.projectQuestionScore.update({
              where: {
                id: score.id
              },
              data: {
                score: score.score
              }
            });
            return { success: true, action: "updated", score };
          } else {
            // Create new score
            const newScore = await prisma.projectQuestionScore.create({
              data: {
                projectQuestionId: score.projectQuestionId,
                studentId: score.studentId,
                score: score.score
              }
            });
            return { success: true, action: "created", score: newScore };
          }
        } catch (error) {
          console.error("Error processing score", error);
          return { error: "Failed to process score", score };
        }
      })
    );
    
    // Log session activity
    console.log(`Marks entry session ${sessionId} saved ${scores.length} scores for project ${projectId}`);
    
    return NextResponse.json({
      message: "Scores processed",
      results
    });
  } catch (error) {
    console.error("[SCORES_BATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
