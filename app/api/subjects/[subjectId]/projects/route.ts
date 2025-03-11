import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(
  request: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    const subjectId = params.subjectId;
    
    const currentUser = await getCurrentUser();
    if (!currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: {
        subjectId: subjectId,
        userId: currentUser.id,
      },
      select: {
        id: true,
        name: true,
        projectType: true,
        totalMarks: true,
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("[SUBJECT_PROJECTS]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}