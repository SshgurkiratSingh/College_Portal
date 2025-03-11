"use client";

import { useState, useEffect } from "react";
import Container from "../../components/container";
import Heading from "../../components/Heading";
import EmptyState from "../../components/EmptyState";
import apiClient from "../../utils/apiClient";

interface Project {
  id: string;
  name: string;
  projectType: string;
  totalMarks: number;
}

interface Subject {
  id: string;
  name: string;
  code?: string;
  courseOutcomes?: any;
}

interface StudentScore {
  studentId: string;
  studentName: string;
  rollNo: string;
  coScores: {
    [key: string]: {
      earned: number;
      total: number;
    };
  };
  poScores: {
    [key: string]: {
      earned: number;
      total: number;
    };
  };
  totalScore: number;
  maxScore: number;
}

const StudentMarksPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [studentScores, setStudentScores] = useState<StudentScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchProjects(selectedSubject);
    } else {
      setProjects([]);
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedProject) {
      fetchStudentScores();
    }
  }, [selectedProject]);

  const fetchSubjects = async () => {
    try {
      const data = await apiClient.get<Subject[]>("/api/subjects");
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchProjects = async (subjectId: string) => {
    try {
      const data = await apiClient.get<Project[]>(
        `/api/subjects/${subjectId}/projects`
      );
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchStudentScores = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<StudentScore[]>(
        `/api/projects/${selectedProject}/students/copo`
      );
      setStudentScores(data);
    } catch (error) {
      console.error("Error fetching student scores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <div className="pt-24">
        <Heading
          title="Student Marks"
          subtitle="View and analyze student performance"
        />

        <div className="flex gap-4 mb-6">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} {subject.code ? `(${subject.code})` : ""}
              </option>
            ))}
          </select>

          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
            disabled={!selectedSubject}
          >
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} ({project.totalMarks} marks)
              </option>
            ))}
          </select>
        </div>

        {isLoading && selectedProject ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : !selectedProject ? (
          <EmptyState
            title="Select a subject and project"
            subtitle="Please choose a subject and project to view student marks"
          />
        ) : studentScores.length === 0 ? (
          <EmptyState
            title="No scores found"
            subtitle="No student scores are available for the selected project"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-black rounded-md overflow-hidden">
              <thead>
                <tr className="bg-gray-600 text-white">
                  <th className="py-2 px-4 text-left">Roll No</th>
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Total Score</th>
                  {Object.keys(studentScores[0].coScores).map((co) => (
                    <th key={co} className="py-2 px-4 text-left">
                      {co}
                    </th>
                  ))}
                  {Object.keys(studentScores[0].poScores).map((po) => (
                    <th key={po} className="py-2 px-4 text-left">
                      {po}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {studentScores.map((score) => (
                  <tr
                    key={score.studentId}
                    className="border-b border-gray-700"
                  >
                    <td className="py-2 px-4 text-white">{score.rollNo}</td>
                    <td className="py-2 px-4 text-white">
                      {score.studentName}
                    </td>
                    <td className="py-2 px-4 text-white">
                      {score.totalScore}/{score.maxScore}
                    </td>
                    {Object.entries(score.coScores).map(([co, scores]) => (
                      <td key={co} className="py-2 px-4 text-white">
                        {scores.earned}/{scores.total}
                      </td>
                    ))}
                    {Object.entries(score.poScores).map(([po, scores]) => (
                      <td key={po} className="py-2 px-4 text-white">
                        {scores.earned}/{scores.total}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Container>
  );
};

export default StudentMarksPage;
