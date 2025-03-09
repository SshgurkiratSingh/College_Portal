"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Container from "@/app/components/container";
import Heading from "@/app/components/Heading";
import EmptyState from "@/app/components/EmptyState";
import apiClient from "@/app/utils/apiClient";
import { useNetworkStatus } from "@/app/utils/networkStatus";

interface ProjectQuestion {
  id: string;
  questionNum: number | string;
  maxMarks: number;
  description?: string;
  coCode?: string;
}

interface Score {
  id: string;
  score: number;
  projectQuestionId: string;
  studentId: string;
  questionNum: number | string;
  maxMarks: number;
  description?: string;
  coCode?: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  userId: string;
  subjectId: string;
  maxMarks?: number;
  passingMarks?: number;
  totalQuestions?: number;
}

const ViewMarksPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const isOnline = useNetworkStatus();
  
  const [project, setProject] = useState<Project | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [totalMaxMarks, setTotalMaxMarks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchProjectDetails();
    fetchStudentScores();
  }, [projectId]);
  
  // Calculate total score and max marks whenever scores change
  useEffect(() => {
    if (scores.length > 0) {
      const total = scores.reduce((sum, s) => sum + s.score, 0);
      const max = scores.reduce((sum, s) => sum + s.maxMarks, 0);
      setTotalScore(total);
      setTotalMaxMarks(max);
    }
  }, [scores]);
  
  const fetchProjectDetails = async () => {
    try {
      const data = await apiClient.get<Project>(`/api/projects/${projectId}`);
      setProject(data);
    } catch (error) {
      console.error("Error fetching project:", error);
      setError("Failed to load project details");
    }
  };
  
  const fetchStudentScores = async () => {
    try {
      setLoading(true);
      // In a real application, we would either:
      // 1. Use the currently logged-in student's ID
      // 2. Get the student ID from the URL or query params
      
      // For now, we'll just get the user's ID from localStorage if available
      // This is a placeholder logic - in a real app, use proper authentication
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      
      if (!userId) {
        setError("You must be logged in to view your scores");
        setLoading(false);
        return;
      }
      
      // Fetch scores from the API
      const allScores = await apiClient.get<Score[]>(`/api/projects/${projectId}/scores/all`);
      
      // Filter for the current student's scores
      // In a real app, the API would only return authorized scores for the student
      const studentScores = allScores.filter(score => score.studentId === userId);
      
      if (studentScores.length === 0) {
        setError("No scores found for this project. Your instructor may not have graded your work yet.");
      }
      
      // Sort scores by question number
      const sortedScores = studentScores.sort((a, b) => {
        const numA = typeof a.questionNum === 'number' ? a.questionNum : parseInt(a.questionNum.toString());
        const numB = typeof b.questionNum === 'number' ? b.questionNum : parseInt(b.questionNum.toString());
        return numA - numB;
      });
      
      setScores(sortedScores);
    } catch (error) {
      console.error("Error fetching scores:", error);
      setError("Failed to load your scores. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getPassFailStatus = () => {
    if (!project?.passingMarks) return null;
    
    const passed = totalScore >= (project.passingMarks || 0);
    return (
      <div className={`mt-2 p-2 text-center font-bold rounded ${passed ? 'bg-green-800 text-white' : 'bg-red-800 text-white'}`}>
        {passed ? 'PASSED' : 'FAILED'}
      </div>
    );
  };
  
  const getGrade = () => {
    if (totalMaxMarks === 0) return 'N/A';
    
    const percentage = (totalScore / totalMaxMarks) * 100;
    
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };
  
  if (loading) {
    return (
      <Container>
        <div className="pt-24">
          <Heading title="Loading your marks..." />
          <div className="mt-4">Loading your scores...</div>
        </div>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <div className="pt-24">
          <EmptyState title="Error" subtitle={error} />
        </div>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container>
        <div className="pt-24">
          <EmptyState title="Project not found" subtitle="The project you're looking for does not exist or you don't have access to it." />
        </div>
      </Container>
    );
  }

  // Network status indicator 
  const NetworkIndicator = () => (
    <div className={`mb-4 p-2 rounded-md ${isOnline ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className={`text-sm ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
          {isOnline ? 'Online' : 'Offline - Some data may be from cache'}
        </span>
      </div>
    </div>
  );
  
  return (
    <Container>
      <div className="pt-24">
        <Heading title={project.name} subtitle={project.description || 'View your marks for this project'} />
        
        <NetworkIndicator />
        
        {scores.length === 0 ? (
          <EmptyState 
            title="No scores found" 
            subtitle="Your instructor hasn't entered any marks for you yet." 
          />
        ) : (
          <div className="mt-4">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-black rounded-md overflow-hidden">
                <thead>
                  <tr className="bg-gray-600 text-white">
                    <th className="py-2 px-4 text-left">Question</th>
                    <th className="py-2 px-4 text-left">Description</th>
                    <th className="py-2 px-4 text-left">CO Code</th>
                    <th className="py-2 px-4 text-right">Max Marks</th>
                    <th className="py-2 px-4 text-right">Your Score</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score) => (
                    <tr key={score.id} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="py-2 px-4 text-white">{score.questionNum}</td>
                      <td className="py-2 px-4 text-white">{score.description || '-'}</td>
                      <td className="py-2 px-4 text-white">{score.coCode || '-'}</td>
                      <td className="py-2 px-4 text-white text-right">{score.maxMarks}</td>
                      <td className="py-2 px-4 text-right">
                        <span className={
                          score.score === score.maxMarks ? 'text-green-500 font-bold' : 
                          score.score === 0 ? 'text-red-500' : 'text-white'
                        }>
                          {score.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-800 font-bold text-white">
                    <td className="py-2 px-4" colSpan={3}>Total</td>
                    <td className="py-2 px-4 text-right">{totalMaxMarks}</td>
                    <td className="py-2 px-4 text-right">{totalScore}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="mt-6 p-4 bg-gray-900 rounded-md">
              <div className="flex flex-wrap justify-between">
                <div className="mb-4">
                  <h3 className="text-lg text-white font-medium mb-2">Summary</h3>
                  <p className="text-gray-300">Total Score: {totalScore} / {totalMaxMarks}</p>
                  <p className="text-gray-300">
                    Percentage: {totalMaxMarks > 0 ? ((totalScore / totalMaxMarks) * 100).toFixed(2) : 0}%
                  </p>
                </div>
                
                <div className="mb-4 text-center">
                  <h3 className="text-lg text-white font-medium mb-2">Grade</h3>
                  <div className="text-3xl font-bold text-white">{getGrade()}</div>
                </div>
                
                {project.passingMarks && (
                  <div className="mb-4">
                    <h3 className="text-lg text-white font-medium mb-2">Status</h3>
                    {getPassFailStatus()}
                    <p className="text-gray-300 mt-2">Passing marks: {project.passingMarks}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default ViewMarksPage;