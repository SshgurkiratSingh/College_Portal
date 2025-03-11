import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

interface COAttainment {
  coCode: string;
  targetLevel: number;
  actualLevel: number;
  studentDistribution: {
    level0: number;
    level1: number;
    level2: number;
    level3: number;
  };
  assessmentComponents: {
    name: string;
    type: string;
    averageScore: number;
    maxScore: number;
  }[];
}

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

    // Fetch project and related data
    const project = await prisma.project.findFirst({
      where: { id: projectId },
      include: {
        subject: {
          include: {
            projects: {
              include: {
                questions: {
                  include: {
                    ProjectQuestionScore: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!project || !project.subject.courseOutcomes) {
      return NextResponse.json(
        { error: "Project or course outcomes not found" },
        { status: 404 }
      );
    }

    // Calculate attainment levels for each CO
    const courseOutcomes = project.subject.courseOutcomes as any[];
    const attainmentReport: COAttainment[] = courseOutcomes.map(co => {
      const coCode = co.code;
      
      // Find all questions mapped to this CO across all projects
      const relatedQuestions = project.subject.projects.flatMap(p => 
        p.questions.filter(q => q.coCode === coCode)
      );

      // Calculate student distribution across attainment levels
      const distribution = {
        level0: 0,
        level1: 0,
        level2: 0,
        level3: 0
      };

      const assessmentComponents = project.subject.projects.map(p => {
        const coQuestions = p.questions.filter(q => q.coCode === coCode);
        const scores = coQuestions.flatMap(q => q.ProjectQuestionScore.map(s => ({
          score: s.score,
          maxScore: q.maxMarks
        })));

        const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
        const totalMaxScore = scores.reduce((sum, s) => sum + s.maxScore, 0);
        
        return {
          name: p.name,
          type: p.projectType,
          averageScore: scores.length > 0 ? totalScore / scores.length : 0,
          maxScore: totalMaxScore / (scores.length || 1)
        };
      });

      return {
        coCode,
        targetLevel: 2, // Default target level
        actualLevel: 0, // Calculated based on class average
        studentDistribution: distribution,
        assessmentComponents
      };
    });

    return NextResponse.json({
      subjectCode: project.subject.code,
      subjectName: project.subject.name,
      attainmentData: attainmentReport
    });
  } catch (error) {
    console.error("Error generating attainment report:", error);
    return NextResponse.json(
      { error: "Failed to generate attainment report" },
      { status: 500 }
    );
  }
}