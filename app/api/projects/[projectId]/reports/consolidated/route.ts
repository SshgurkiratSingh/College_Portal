import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

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

    // Fetch all assessment data for the subject
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
            },
            studentList: {
              include: {
                students: true
              }
            }
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

    // Generate consolidated report data
    const consolidatedReport = {
      subject: {
        name: project.subject.name,
        code: project.subject.code
      },
      assessmentComponents: project.subject.projects.map(p => ({
        name: p.name,
        type: p.projectType,
        totalMarks: p.totalMarks
      })),
      studentPerformance: project.subject.studentList?.students.map(student => {
        const assessmentScores = project.subject.projects.map(p => {
          const studentScores = p.questions.map(q => {
            const score = q.ProjectQuestionScore.find(
              s => s.studentId === student.id
            );
            return {
              questionNum: q.questionNum,
              coCode: q.coCode,
              score: score?.score || 0,
              maxMarks: q.maxMarks
            };
          });

          return {
            projectName: p.name,
            projectType: p.projectType,
            scores: studentScores
          };
        });

        return {
          studentId: student.id,
          rollNo: student.rollNo,
          name: student.name,
          assessments: assessmentScores
        };
      }),
      courseOutcomes: project.subject.courseOutcomes
    };

    return NextResponse.json(consolidatedReport);
  } catch (error) {
    console.error("Error generating consolidated report:", error);
    return NextResponse.json(
      { error: "Failed to generate consolidated report" },
      { status: 500 }
    );
  }
}