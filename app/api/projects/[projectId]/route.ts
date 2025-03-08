import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// GET /api/projects/[projectId] - Get a specific project by ID
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
    
    // Fetch the project with subject details, ensuring it belongs to the current user.
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: currentUser.id
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });
    
    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }
    
    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PUT /api/projects/[projectId] - Update a project
export async function PUT(
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
    
    // Get project data from request body
    const body = await request.json();
    const { name, description, projectType, totalMarks, subjectId } = body;
    
    if (!name || !projectType || !totalMarks || totalMarks <= 0) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    
    // Validate marks based on project type
    if (projectType === "SESSIONAL" && totalMarks > 30) {
      return new NextResponse("Sessional projects cannot exceed 30 marks", { status: 400 });
    }
    
    if (projectType === "FINAL" && totalMarks > 50) {
      return new NextResponse("Final projects cannot exceed 50 marks", { status: 400 });
    }
    
    // Make sure the project exists and belongs to the current user
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: currentUser.id
      }
    });
    
    if (!existingProject) {
      return new NextResponse("Project not found", { status: 404 });
    }
    
    // If subject is being changed, verify the new subject exists and belongs to the current user
    if (subjectId && subjectId !== existingProject.subjectId) {
      const subject = await prisma.subject.findFirst({
        where: {
          id: subjectId,
          createdById: currentUser.id
        }
      });
      
      if (!subject) {
        return new NextResponse("Subject not found or does not belong to user", { status: 404 });
      }
    }
    
    // Update the project
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId
      },
      data: {
        name,
        description,
        projectType,
        totalMarks,
        ...(subjectId && { subjectId })
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
    
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("[PROJECT_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE /api/projects/[projectId] - Delete a project
export async function DELETE(
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
    
    // Make sure the project exists and belongs to the current user
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: currentUser.id
      }
    });
    
    if (!existingProject) {
      return new NextResponse("Project not found", { status: 404 });
    }
    
    // Delete all associated project questions first (cascade deletion may not work as expected in MongoDB)
    await prisma.projectQuestion.deleteMany({
      where: {
        projectId
      }
    });
    
    // Delete the project
    await prisma.project.delete({
      where: {
        id: projectId
      }
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PROJECT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
