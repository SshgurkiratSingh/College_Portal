import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
// Helper function to calculate PO scores from CO scores and mappings
const calculatePOScores = (coScores: { [key: string]: { earned: number; total: number } }, courseOutcomes: any[]) => {
  const poScores: { [key: string]: { earned: number; total: number } } = {};

  // Initialize PO scores
  courseOutcomes.forEach((co) => {
    Object.entries(co.mappings as { [key: string]: number }).forEach(([po, weight]: [string, number]) => {
      if (weight > 0) {
        if (!poScores[po]) {
          poScores[po] = { earned: 0, total: 0 };
        }
      }
    });
  });

  // Calculate PO scores based on CO scores and mappings
  courseOutcomes.forEach((co) => {
    const coCode = co.code;
    if (coScores[coCode]) {
      Object.entries(co.mappings as { [key: string]: number }).forEach(([po, weight]: [string, number]) => {
        if (weight > 0) {
          const weightedEarned = (coScores[coCode].earned * weight) / 3; // weight is 1-3
          const weightedTotal = (coScores[coCode].total * weight) / 3;
          poScores[po].earned += weightedEarned;
          poScores[po].total += weightedTotal;
        }
      });
    }
  });

  return poScores;
};
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

    // Fetch the project with its questions and subject (including course outcomes)
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: currentUser.id,
      },
      
      include: {
        questions: {
          include: {
            ProjectQuestionScore: {
              include: {
                student: true,
              },
            },
          },
        },
        subject: true,
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    // Get all unique students who have scores for this project
    const studentScores = new Map();

    // Calculate scores for each student
    project.questions.forEach((question) => {
      question.ProjectQuestionScore.forEach((score) => {
        const student = score.student;
        if (!studentScores.has(student.id)) {
          studentScores.set(student.id, {
            studentId: student.id,
            studentName: student.name,
            rollNo: student.rollNo,
            coScores: {},
            totalScore: 0,
            maxScore: project.totalMarks,
          });
        }

        const studentScore = studentScores.get(student.id);
        
        // Initialize or update CO scores
        if (!studentScore.coScores[question.coCode]) {
          studentScore.coScores[question.coCode] = {
            earned: 0,
            total: 0,
          };
        }
        studentScore.coScores[question.coCode].earned += score.score;
        studentScore.coScores[question.coCode].total += question.maxMarks;
        
        // Update total score
        studentScore.totalScore += score.score;
      });
    });

    // Calculate PO scores for each student using CO-PO mapping
    const courseOutcomes = project.subject.courseOutcomes as any[];
    const finalScores = Array.from(studentScores.values()).map((score: any) => ({
      ...score,
      poScores: calculatePOScores(score.coScores, courseOutcomes),
    }));
    return NextResponse.json(finalScores);
  } catch (error) {
    console.error("[PROJECT_STUDENTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}