"use client";

import { useState, useEffect } from "react";
import apiClient from "../utils/apiClient";
import { useNetworkStatus } from "../utils/networkStatus";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Heading from "../components/Heading";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import useProjectModal from "../hooks/useProjectModal";
import { ProjectType } from "../hooks/useProjectModal";

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

interface Subject {
  id: string;
  name: string;
  code?: string;
}

const ProjectsPage = () => {
  const router = useRouter();
  const projectModal = useProjectModal();
  const [projects, setProjects] = useState<Project[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const isOnline = useNetworkStatus();

  useEffect(() => {
    fetchSubjects();
    fetchProjects();

    // Reset dataChanged flag after fetching
    if (projectModal.dataChanged) {
      projectModal.resetDataChanged();
    }
  }, [projectModal.dataChanged]);

  const fetchSubjects = async () => {
    try {
      // Use cached apiClient
      const data = await apiClient.get<Subject[]>("/api/subjects");
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to load subjects");
    }
  };

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const url = selectedSubject
        ? `/api/projects?subjectId=${selectedSubject}`
        : "/api/projects";

      // Use cached apiClient
      const data = await apiClient.get<Project[]>(url);
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error(isOnline ? "Failed to load projects" : "You're offline. Using cached data if available.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
    // Trigger projects fetch when selection changes
    setTimeout(fetchProjects, 0);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      // Use apiClient with offline support
      await apiClient.delete(`/api/projects/${projectId}`, { offlineEnabled: true });
      
      if (!isOnline) {
        toast.success("Delete operation queued. Will be processed when back online.");
      } else {
        toast.success("Project deleted successfully");
      }
      
      // Optimistically update the UI
      setProjects(prev => prev.filter(project => project.id !== projectId));
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <Heading title="Projects" subtitle="Manage your projects" />
        <Button
          label="Create Project"
          onClick={() => {
            if (subjects.length > 0) {
              projectModal.onOpen(selectedSubject || subjects[0].id);
            } else {
              toast.error("Please create a subject first");
            }
          }}
        />
      </div>

      <div className="bg-black shadow-md rounded-md p-4 mb-6">
        <div className="flex items-center mb-4">
          <span className="mr-2 font-medium">Filter by Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="p-2 border rounded-md"
            disabled={isLoading}
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} {subject.code ? `(${subject.code})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading projects...</div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          subtitle="Create a new project to get started"
        />
      ) : (
        <div className="bg-white shadow-md rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {project.name}
                    </div>
                    {project.description && (
                      <div className="text-sm text-gray-500">
                        {project.description.substring(0, 50)}...
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {project.subject?.name || "Unknown Subject"}
                      {project.subject?.code
                        ? ` (${project.subject.code})`
                        : ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.totalMarks} marks
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(project.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => router.push(`/projects/${project.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      View
                    </button>
                    <button
                      onClick={() =>
                        projectModal.onEdit(project.id, project.subjectId)
                      }
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
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
  );
};

export default ProjectsPage;
