import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Define interfaces
interface CourseOutcome {
  id: string;
  name: string;
  description: string;
}

interface OutcomeMapping {
  outcomeId: string;
  value: number; // 0-3
}

interface COMapping {
  coId: string;
  mappings: OutcomeMapping[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  studentListId: string;
  description?: string;
  courseOutcomes: CourseOutcome[];
  mappings: COMapping[];
  credits?: number;
}

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

// GET handler - Get all subjects or filter by studentListId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentListId = searchParams.get('studentListId');
    
    const subjects = getSubjects();
    
    // Filter by studentListId if provided
    const filteredSubjects = studentListId 
      ? subjects.filter(subject => subject.studentListId === studentListId)
      : subjects;
    
    return NextResponse.json(filteredSubjects);
  } catch (error) {
    console.error('Error getting subjects:', error);
    return NextResponse.json(
      { error: 'Failed to get subjects' },
      { status: 500 }
    );
  }
}

// POST handler - Create a new subject
export async function POST(request: Request) {
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
    
    // Validation
    if (!name || !code || !studentListId) {
      return NextResponse.json(
        { error: 'Name, code, and student list are required' },
        { status: 400 }
      );
    }
    
    const subjects = getSubjects();
    
    // Generate IDs for course outcomes if they don't have one
    const processedCourseOutcomes = (courseOutcomes || []).map((co: CourseOutcome) => ({
      ...co,
      id: co.id || uuidv4()
    }));
    
    // Create new subject
    const newSubject: Subject = {
      id: uuidv4(),
      name,
      code,
      studentListId,
      description,
      courseOutcomes: processedCourseOutcomes,
      mappings: mappings || [],
      credits
    };
    
    // Save updated subjects
    subjects.push(newSubject);
    saveSubjects(subjects);
    
    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    );
  }
}

// Helper function to get a specific subject
export const getSubject = (id: string): Subject | undefined => {
  const subjects = getSubjects();
  return subjects.find(subject => subject.id === id);
};