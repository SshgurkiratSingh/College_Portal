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

    // Fetch project and related data with subject and projects data
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

    // Helper function to map a percentage to a level
    const getLevel = (percentage: number) => {
      if (percentage >= 75) return 3;
      else if (percentage >= 50) return 2;
      else if (percentage >= 25) return 1;
      else return 0;
    };

    // Calculate attainment for each CO
    const courseOutcomes = project.subject.courseOutcomes as any[];
    const attainmentReport: COAttainment[] = courseOutcomes.map((co) => {
      const coCode = co.code;

      // Collect all questions mapped to this CO across all projects
      const relatedQuestions = project.subject.projects.flatMap((p) =>
        p.questions.filter((q) => q.coCode === coCode)
      );

      // Group scores by student for this CO
      const scoresByStudent: {
        [studentId: string]: { totalScore: number; totalMax: number };
      } = {};
      relatedQuestions.forEach((q) => {
        q.ProjectQuestionScore.forEach((s) => {
          if (!scoresByStudent[s.studentId]) {
            scoresByStudent[s.studentId] = { totalScore: 0, totalMax: 0 };
          }
          scoresByStudent[s.studentId].totalScore += s.score;
          scoresByStudent[s.studentId].totalMax += q.maxMarks;
        });
      });

      // Compute distribution and overall average percentage for the CO
      const distribution = { level0: 0, level1: 0, level2: 0, level3: 0 };
      let totalPercentageSum = 0;
      let studentCount = 0;
      for (const studentId in scoresByStudent) {
        const { totalScore, totalMax } = scoresByStudent[studentId];
        const percentage = totalMax ? (totalScore / totalMax) * 100 : 0;
        totalPercentageSum += percentage;
        studentCount++;
        const level = getLevel(percentage);
        if (level === 0) distribution.level0++;
        else if (level === 1) distribution.level1++;
        else if (level === 2) distribution.level2++;
        else if (level === 3) distribution.level3++;
      }
      const avgPercentage = studentCount ? totalPercentageSum / studentCount : 0;
      const actualLevel = getLevel(avgPercentage);

      // Aggregate assessment components per project for this CO
      const assessmentComponents = project.subject.projects.map((p) => {
        const coQuestions = p.questions.filter((q) => q.coCode === coCode);
        const scores = coQuestions.flatMap((q) =>
          q.ProjectQuestionScore.map((s) => ({
            score: s.score,
            maxScore: q.maxMarks,
          }))
        );

        const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
        const totalMaxScore = scores.reduce((sum, s) => sum + s.maxScore, 0);

        return {
          name: p.name,
          type: p.projectType,
          averageScore: scores.length > 0 ? totalScore / scores.length : 0,
          maxScore: scores.length > 0 ? totalMaxScore / scores.length : 0,
        };
      });

      return {
        coCode,
        targetLevel: 2, // Default target level; can be made configurable
        actualLevel,
        studentDistribution: distribution,
        assessmentComponents,
      };
    });

    return NextResponse.json({
      subjectCode: project.subject.code,
      subjectName: project.subject.name,
      attainmentData: attainmentReport,
    });
  } catch (error) {
    console.error("Error generating attainment report:", error);
    return NextResponse.json(
      { error: "Failed to generate attainment report" },
      { status: 500 }
    );
  }
}
