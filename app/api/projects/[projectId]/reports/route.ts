import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// Helper function to calculate CO attainment levels
const calculateCOAttainment = (scores: { [key: string]: { earned: number; total: number } }) => {
  const attainmentLevels: { [key: string]: number } = {};
  
  Object.entries(scores).forEach(([coCode, score]) => {
    const percentage = (score.earned / score.total) * 100;
    // Define attainment levels based on percentage
    if (percentage >= 70) attainmentLevels[coCode] = 3;
    else if (percentage >= 60) attainmentLevels[coCode] = 2;
    else if (percentage >= 50) attainmentLevels[coCode] = 1;
    else attainmentLevels[coCode] = 0;
  });
  
  return attainmentLevels;
};

// Generate consolidated report for a project
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

    // Fetch project details with questions and subject
    const project = await prisma.project.findFirst({
      where: { id: projectId },
      include: {
        subject: {
          include: {
            studentList: {
              include: {
                students: true
              }
            }
          }
        },
        questions: {
          include: {
            ProjectQuestionScore: true
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Generate report data
    const reportData = {
      projectDetails: {
        name: project.name,
        type: project.projectType,
        totalMarks: project.totalMarks
      },
      studentScores: project.subject.studentList?.students.map(student => {
        const scores: { [key: string]: { earned: number; total: number } } = {};
        
        // Aggregate scores by CO
        project.questions.forEach(question => {
          const score = question.ProjectQuestionScore.find(
            s => s.studentId === student.id
          );
          
          if (!scores[question.coCode]) {
            scores[question.coCode] = { earned: 0, total: 0 };
          }
          
          scores[question.coCode].earned += score?.score || 0;
          scores[question.coCode].total += question.maxMarks;
        });

        return {
          studentId: student.id,
          rollNo: student.rollNo,
          name: student.name,
          coScores: scores,
          attainmentLevels: calculateCOAttainment(scores)
        };
      }),
      courseOutcomes: project.subject.courseOutcomes
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}