import { NextResponse } from "next/server";
import path from 'path';
import fs from 'fs';
import { Subject } from '../route';

// Path to subjects JSON file
const dataFilePath = path.join(process.cwd(), 'data', 'subjects.json');

// Helper to ensure data directory exists
const ensureDataDirectoryExists = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Helper to read subjects
const getSubjects = (): Subject[] => {
  ensureDataDirectoryExists();
  
  try {
    if (!fs.existsSync(dataFilePath)) {
      // If file doesn't exist, create it with empty array
      fs.writeFileSync(dataFilePath, JSON.stringify([]));
      return [];
    }
    
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading subjects data:', error);
    return [];
  }
};

// Helper to write subjects
const saveSubjects = (subjects: Subject[]) => {
  ensureDataDirectoryExists();
  fs.writeFileSync(dataFilePath, JSON.stringify(subjects, null, 2));
};

// Helper to get a specific subject
const getSubject = (id: string): Subject | undefined => {
  const subjects = getSubjects();
  return subjects.find(subject => subject.id === id);
};

// GET handler - Get a specific subject by ID
export async function GET(
  request: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    const subject = getSubject(params.subjectId);
    
    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(subject);
  } catch (error) {
    console.error('Error getting subject:', error);
    return NextResponse.json(
      { error: 'Failed to get subject' },
      { status: 500 }
    );
  }
}

// PATCH handler - Update a specific subject by ID
export async function PATCH(
  request: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    const body = await request.json();
    const { 
      name, 
      code, 
      studentListId,
      description, 
      courseOutcomes, 
      mappings,
      credits 
    } = body;
    
    // Get subjects
    const subjects = getSubjects();
    
    // Find subject index
    const subjectIndex = subjects.findIndex(s => s.id === params.subjectId);
    
    // Check if subject exists
    if (subjectIndex === -1) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }
    
    // Process course outcomes
    const processedCourseOutcomes = (courseOutcomes || []).map((co: any) => ({
      ...co,
      id: co.id || subjects[subjectIndex].courseOutcomes.find(outcome => outcome.name === co.name)?.id || crypto.randomUUID()
    }));
    
    // Update subject
    subjects[subjectIndex] = {
      ...subjects[subjectIndex],
      ...(name !== undefined && { name }),
      ...(code !== undefined && { code }),
      ...(studentListId !== undefined && { studentListId }),
      ...(description !== undefined && { description }),
      ...(courseOutcomes !== undefined && { courseOutcomes: processedCourseOutcomes }),
      ...(mappings !== undefined && { mappings }),
      ...(credits !== undefined && { credits })
    };
    
    // Save updated subjects
    saveSubjects(subjects);
    
    return NextResponse.json(subjects[subjectIndex]);
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json(
      { error: 'Failed to update subject' },
      { status: 500 }
    );
  }
}

// DELETE handler - Delete a specific subject by ID
export async function DELETE(
  request: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    // Get subjects
    const subjects = getSubjects();
    
    // Find subject index
    const subjectIndex = subjects.findIndex(s => s.id === params.subjectId);
    
    // Check if subject exists
    if (subjectIndex === -1) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }
    
    // Remove subject
    subjects.splice(subjectIndex, 1);
    
    // Save updated subjects
    saveSubjects(subjects);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json(
      { error: 'Failed to delete subject' },
      { status: 500 }
    );
  }
}