"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Heading from "../../components/Heading";
import Button from "../../components/Button";
import EmptyState from "../../components/EmptyState";
import useProjectQuestionModal from "../../hooks/useProjectQuestionModal";
import useFastMarksEntryModal from "../../hooks/useFastMarksEntryModal";
import FastMarksEntry from "../../components/FastMarksEntry";
import { ProjectType } from "../../hooks/useProjectModal";

interface Project {
  id: string;
  name: string;
  description?: string;
  projectType: ProjectType;
  totalMarks: number;
  subjectId: string;
  createdAt: string;
  subject?: {
    name: string;
    code?: string;
  };
}

interface ProjectQuestion {
  id: string;
  projectId: string;
  questionNum: number | string;
  maxMarks: number;
  description?: string;
  coCode?: string;
}

const ProjectDetail = ({ params }: { params: { projectId: string } }) => {
  const router = useRouter();
  const projectQuestionModal = useProjectQuestionModal();
  const fastMarksEntryModal = useFastMarksEntryModal();
  const [project, setProject] = useState<Project | null>(null);
  const [questions, setQuestions] = useState<ProjectQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalQuestionsMarks, setTotalQuestionsMarks] = useState(0);

  useEffect(() => {
    if (params.projectId) {
      fetchProjectData();

      // Reset dataChanged flag after fetching
      if (projectQuestionModal.dataChanged) {
        projectQuestionModal.resetDataChanged();
      }
    }
  }, [params.projectId, projectQuestionModal.dataChanged]);

  const fetchProjectData = async () => {
    try {
      setIsLoading(true);

      // Fetch project details
      const projectResponse = await axios.get(
        `/api/projects/${params.projectId}`
      );
      setProject(projectResponse.data);

      // Fetch project questions
      const questionsResponse = await axios.get(
        `/api/projects/${params.projectId}/questions`
      );
      setQuestions(questionsResponse.data);

      // Calculate total marks from questions
      const totalMarks = questionsResponse.data.reduce(
        (sum: number, question: ProjectQuestion) => sum + question.maxMarks,
        0
      );
      setTotalQuestionsMarks(totalMarks);
    } catch (error) {
      console.error("Error fetching project data:", error);
      toast.error("Failed to load project data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this question? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      await axios.delete(`/api/projects/questions/${questionId}`);
      toast.success("Question deleted successfully");
      projectQuestionModal.setDataChanged(); // Signal that data has changed
      // No need to call fetchProjectData() directly as it will be triggered by useEffect
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectTypeLabel = (type: ProjectType): string => {
    return type.charAt(0) + type.slice(1).toLowerCase();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading && !project) {
    return <div className="text-center py-8">Loading project data...</div>;
  }

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        subtitle="The requested project could not be found"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation and header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push("/projects")}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md mr-4"
        >
          &larr; Back to Projects
        </button>
        <Heading
          title={project.name}
          subtitle={`${getProjectTypeLabel(project.projectType)} Project`}
        />
      </div>

      {/* Project details */}
      <div className="bg-black shadow-md rounded-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Project Details</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Type:</span>{" "}
                {getProjectTypeLabel(project.projectType)}
              </p>
              <p>
                <span className="font-medium">Total Marks:</span>{" "}
                {project.totalMarks}
              </p>
              <p>
                <span className="font-medium">Subject:</span>{" "}
                {project.subject?.name}{" "}
                {project.subject?.code ? `(${project.subject.code})` : ""}
              </p>
              <p>
                <span className="font-medium">Created:</span>{" "}
                {formatDate(project.createdAt)}
              </p>
            </div>
            {project.description && (
              <div className="mt-4">
                <h4 className="font-medium mb-1">Description:</h4>
                <p className="text-gray-700">{project.description}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-medium mb-2">Questions Summary</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Total Questions:</span>{" "}
                  {questions.length}
                </p>
                <p>
                  <span className="font-medium">Questions Total Marks:</span>{" "}
                  {totalQuestionsMarks} / {project.totalMarks}
                </p>
                {totalQuestionsMarks !== project.totalMarks && (
                  <p className="text-amber-600">
                    {totalQuestionsMarks < project.totalMarks
                      ? `You still need to assign ${
                          project.totalMarks - totalQuestionsMarks
                        } marks`
                      : `Warning: Questions exceed project total marks by ${
                          totalQuestionsMarks - project.totalMarks
                        }`}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Button
                label="Add Question"
                onClick={() => projectQuestionModal.onOpen(project.id)}
              />
              <Button
                label="Fast Marks Entry"
                onClick={() => fastMarksEntryModal.onOpen(project.id)}
                outline
              />
              <Button
                label="View Report"
                onClick={() =>
                  router.push(
                    `/projects/${params.projectId}/reports/`
                  )
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Questions list */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Project Questions</h2>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading questions...</div>
        ) : questions.length === 0 ? (
          <EmptyState
            title="No questions yet"
            subtitle="Add questions to this project"
          />
        ) : (
          <div className="bg-white shadow-md rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Marks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CO Mapping
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {question.questionNum}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {question.description || "No description"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {question.maxMarks} marks
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {question.coCode ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {question.coCode}
                        </span>
                      ) : (
                        "Not mapped"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() =>
                          projectQuestionModal.onEdit(project.id, question.id)
                        }
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ModalProvider />
    </div>
  );
};

export default ProjectDetail;

// Render FastMarksEntry modal when triggered
const FastMarksEntryModalProvider = () => {
  const fastMarksEntryModal = useFastMarksEntryModal();

  return (
    <>
      {fastMarksEntryModal.isOpen && fastMarksEntryModal.projectId && (
        <FastMarksEntry
          projectId={fastMarksEntryModal.projectId}
          isOpen={fastMarksEntryModal.isOpen}
          onClose={fastMarksEntryModal.onClose}
        />
      )}
    </>
  );
};

// Register FastMarksEntryModal at the bottom of the page to ensure it's available
export function ModalProvider() {
  return <FastMarksEntryModalProvider />;
}

export const Dynamic = "force-dynamic";
