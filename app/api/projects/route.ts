import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// GET /api/projects - Get all projects or filter by subjectId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    
    const session = await getCurrentUser();
    if (!session?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: {
        email: session.email
      }
    });
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Build query with filters if provided
    const query: any = {
      where: {
        userId: user.id
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    };
    
    // Apply subject filter if provided
    if (subjectId) {
      query.where.subjectId = subjectId;
    }
    
    const projects = await prisma.project.findMany(query);
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error("[PROJECTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(request: Request) {
  try {
    // Use getCurrentUser to obtain the user object directly.
    const session = await getCurrentUser();
    if (!session?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: {
        email: session.email
      }
    });
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const body = await request.json();
    const { name, description, projectType, totalMarks, subjectId } = body;
    
    if (!name || !projectType || !subjectId || !totalMarks || totalMarks <= 0) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    
    // Validate marks based on project type
    if (projectType === "SESSIONAL" && totalMarks > 30) {
      return new NextResponse("Sessional projects cannot exceed 30 marks", { status: 400 });
    }
    
    if (projectType === "FINAL" && totalMarks > 50) {
      return new NextResponse("Final projects cannot exceed 50 marks", { status: 400 });
    }
    
    // Verify subject exists and belongs to user
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        createdById: user.id
      }
    });
    
    if (!subject) {
      return new NextResponse("Subject not found or does not belong to user", { status: 404 });
    }
    
    // Create the project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        projectType,
        totalMarks,
        userId: user.id,
        subjectId
      },
      include: {
        subject: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });
    
    
    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
