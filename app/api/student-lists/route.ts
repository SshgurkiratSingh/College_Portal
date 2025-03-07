import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    // Check if user is authenticated
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { name, description, csvText } = body;

    // Validate required fields
    if (!name || !csvText) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create new student list
    const studentList = await prisma.studentList.create({
      data: {
        name,
        description,
        user: {
          connect: {
            id: currentUser.id,
          },
        },
      },
    });

    // Record the upload
    await prisma.studentListUpload.create({
      data: {
        filename: `${name}_${new Date().toISOString()}.csv`,
        user: {
          connect: {
            id: currentUser.id,
          },
        },
      },
    });

    // Process CSV data
    const lines = csvText.trim().split(/\r?\n/);
    const students = [];

    for (let i = 0; i < lines.length; i++) {
      // Skip header line if it exists
      if (i === 0 && lines[i].toLowerCase().includes("rollno")) {
        continue;
      }

      const parts = lines[i].split(',');
      
      // Need at least roll number and name
      if (parts.length < 2) {
        continue;
      }

      const rollNo = parts[0].trim();
      const name = parts[1].trim();
      const email = parts.length > 2 ? parts[2].trim() : null;
      const section = parts.length > 3 ? parts[3].trim() : null;
      const batch = parts.length > 4 ? parts[4].trim() : null;

      students.push({
        rollNo,
        name,
        email,
        section,
        batch,
        studentListId: studentList.id,
      });
    }

    // Create students
    if (students.length > 0) {
      await prisma.student.createMany({
        data: students,
      });
    }

    return NextResponse.json(studentList);
  } catch (error) {
    console.log("[STUDENT-LISTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    // Check if user is authenticated
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get student lists
    const studentLists = await prisma.studentList.findMany({
      where: {
        userId: currentUser.id,
      },
      include: {
        students: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(studentLists);
  } catch (error) {
    console.log("[STUDENT-LISTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
