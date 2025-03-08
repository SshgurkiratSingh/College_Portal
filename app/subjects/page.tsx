"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import Container from "../components/container";
import Heading from "../components/Heading";
import EmptyState from "../components/EmptyState";
import useSubjectModal, { SubjectModalMode } from "../hooks/useSubjectModal";
import useUploadPaperModal from "../hooks/useUploadPaperModal";
import useProjectModal from "../hooks/useProjectModal";
import useStudentListModal from "../hooks/useStudentListModal";
import ClientOnly from "../components/ClientOnly";
import UploadPaperModal from "../components/modals/UploadPaperModal";
import ProjectModal from "../components/modals/ProjectModal";
import { ProjectType } from "../hooks/useProjectModal";

interface CourseOutcome {
  id?: string;
  code: string;
  description: string;
}

interface OutcomeMapping {
  outcomeId: string;
  value: number;
}

interface COMapping {
  coId: string;
  mappings: OutcomeMapping[];
}

interface Subject {
  id: string;
  name: string;
  code: string;
  studentListId: string | null;
  description?: string;
  courseOutcomes: CourseOutcome[];
  mappings: COMapping[];
  studentList?: {
    name: string;
  };
}

interface StudentList {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  projectType: ProjectType;
  totalMarks: number;
  subjectId: string;
  createdAt: string;
}

const SubjectsPage = () => {
  const router = useRouter();
  const subjectModal = useSubjectModal();
  const uploadPaperModal = useUploadPaperModal();
  const studentListModal = useStudentListModal();
  const projectModal = useProjectModal();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studentLists, setStudentLists] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [subjectProjects, setSubjectProjects] = useState<
    Record<string, Project[]>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const subjectsResponse = await axios.get("/api/subjects");
        setSubjects(subjectsResponse.data);

        const studentListsResponse = await axios.get("/api/student-lists");
        const studentListsMap: Record<string, string> = {};
        studentListsResponse.data.forEach((list: StudentList) => {
          studentListsMap[list.id] = list.name;
        });
        setStudentLists(studentListsMap);

        // Now fetch projects for each subject
        const projectsMap: Record<string, Project[]> = {};
        for (const subject of subjectsResponse.data) {
          try {
            const projectsResponse = await axios.get(
              `/api/projects?subjectId=${subject.id}`
            );
            projectsMap[subject.id] = projectsResponse.data;
          } catch (error) {
            console.error(
              `Error fetching projects for subject ${subject.id}:`,
              error
            );
            projectsMap[subject.id] = [];
          }
        }
        setSubjectProjects(projectsMap);

        // Reset the dataChanged flags after fetching
        if (subjectModal.dataChanged) {
          subjectModal.resetDataChanged();
        }
        if (projectModal.dataChanged) {
          projectModal.resetDataChanged();
        }
        if (studentListModal.dataChanged) {
          studentListModal.resetDataChanged();
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        toast.error("Failed to load subjects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Also refetch data when any dataChanged flag is true
  }, [
    subjectModal.dataChanged,
    projectModal.dataChanged,
    studentListModal.dataChanged,
  ]);

  const handleDelete = async (subjectId: string) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) {
      return;
    }
    try {
      await axios.delete(`/api/subjects/${subjectId}`);
      toast.success("Subject deleted successfully");
      setSubjects((current) =>
        current.filter((subject) => subject.id !== subjectId)
      );
      subjectModal.setDataChanged(); // Signal that data has changed
      router.refresh();
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Failed to delete subject");
    }
  };

  const handleEdit = (subjectId: string) => {
    subjectModal.onOpen(SubjectModalMode.EDIT, subjectId);
  };

  const handleView = (subjectId: string) => {
    subjectModal.onOpen(SubjectModalMode.VIEW, subjectId);
  };

  const handleAddNew = () => {
    subjectModal.onOpen(SubjectModalMode.CREATE);
  };

  const handleUploadPaper = (subjectId: string) => {
    uploadPaperModal.onOpen(subjectId);
  };

  const handleCreateProject = (subjectId: string) => {
    projectModal.onOpen(subjectId);
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleEditProject = (projectId: string, subjectId: string) => {
    projectModal.onEdit(projectId, subjectId);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }
    try {
      setIsLoading(true);
      await axios.delete(`/api/projects/${projectId}`);
      toast.success("Project deleted successfully");

      // Update the local state to remove the deleted project
      setSubjectProjects((prev) => {
        const newProjectsMap = { ...prev };
        for (const subjectId in newProjectsMap) {
          newProjectsMap[subjectId] = newProjectsMap[subjectId].filter(
            (project) => project.id !== projectId
          );
        }
        return newProjectsMap;
      });

      projectModal.setDataChanged(); // Signal that data has changed
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectTypeLabel = (type: ProjectType): string => {
    return type.charAt(0) + type.slice(1).toLowerCase();
  };

  if (isLoading) {
    return (
      <Container>
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
      </Container>
    );
  }

  if (subjects.length === 0) {
    return (
      <Container>
        <div className="pt-24">
          <EmptyState
            title="No subjects found"
            subtitle="Click the button below to add your first subject"
          />
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleAddNew}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
            >
              Add New Subject
            </button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <ClientOnly>
      <Container>
        <div className="pt-24">
          <div className="flex justify-between items-center mb-6">
            <Heading title="Subjects" subtitle="Manage your subjects" />
            <button
              onClick={handleAddNew}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
            >
              Add New Subject
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="border rounded-lg p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {subject.name} ({subject.code})
                    </h2>
                    <p className="text-sm text-gray-500">
                      Student List:{" "}
                      {subject.studentList?.name ||
                        (subject.studentListId
                          ? studentLists[subject.studentListId]
                          : "Unknown")}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(subject.id)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleUploadPaper(subject.id)}
                      className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-md text-sm transition"
                    >
                      Upload Paper
                    </button>
                    <button
                      onClick={() => handleCreateProject(subject.id)}
                      className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-md text-sm transition"
                    >
                      Create Project
                    </button>
                    <button
                      onClick={() => handleEdit(subject.id)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md text-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(subject.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md text-sm transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {subject.description && (
                  <p className="mt-2 text-gray-600">{subject.description}</p>
                )}

                <div className="mt-4">
                  <h3 className="text-md font-medium">Course Outcomes:</h3>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {subject.courseOutcomes.map((co, index) => (
                      <div
                        key={co.id || index}
                        className="bg-gray-800 p-3 rounded-md"
                      >
                        <span className="font-medium">{co.code}:</span>{" "}
                        {co.description}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects for this subject */}
                <div className="mt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium">Projects:</h3>
                    <button
                      onClick={() => handleCreateProject(subject.id)}
                      className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-md text-sm transition"
                    >
                      Create Project
                    </button>
                  </div>
                  {!subjectProjects[subject.id] ||
                  subjectProjects[subject.id].length === 0 ? (
                    <p className="text-gray-500 mt-2">
                      No projects found for this subject.
                    </p>
                  ) : (
                    <div className="mt-2 space-y-3">
                      {subjectProjects[subject.id].map((project) => (
                        <div
                          key={project.id}
                          className="border rounded-md p-3 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-800">
                                {project.name}
                              </h4>
                              <div className="text-sm text-gray-500">
                                <span
                                  className={`inline-block px-2 py-1 mr-2 rounded-full text-xs font-medium 
                                  ${
                                    project.projectType === "SESSIONAL"
                                      ? "bg-blue-100 text-blue-800"
                                      : project.projectType === "FINAL"
                                      ? "bg-purple-100 text-purple-800"
                                      : project.projectType === "QUIZ"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {getProjectTypeLabel(project.projectType)}
                                </span>
                                <span>{project.totalMarks} marks</span>
                              </div>
                              {project.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {project.description.substring(0, 100)}
                                  {project.description.length > 100
                                    ? "..."
                                    : ""}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewProject(project.id)}
                                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-2 py-1 rounded-md text-xs transition"
                              >
                                View
                              </button>
                              <button
                                onClick={() =>
                                  handleEditProject(project.id, subject.id)
                                }
                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-md text-xs transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project.id)}
                                className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-md text-xs transition"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
      <UploadPaperModal />
      <ProjectModal />
    </ClientOnly>
  );
};

export default SubjectsPage;
