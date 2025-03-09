"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import useProjectModal, { ProjectType } from "../../hooks/useProjectModal";
import Modal from "./Modals";

interface Subject {
  id: string;
  name: string;
  code?: string;
}

interface Project {
  id: string;
  name: string;
  projectType: ProjectType;
  subjectId: string;
}

const ProjectModal = () => {
  const projectModal = useProjectModal();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [totalMarks, setTotalMarks] = useState<number>(0);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [markError, setMarkError] = useState<string | null>(null);
  const [sessionalError, setSessionalError] = useState<string | null>(null);
  const [subjectProjects, setSubjectProjects] = useState<Project[]>([]);

  // Fetch subjects when the modal opens
  useEffect(() => {
    if (projectModal.isOpen && !projectModal.editMode) {
      setSelectedSubjectId(projectModal.subjectId);
      fetchSubjects();
    }
  }, [projectModal.isOpen, projectModal.subjectId]);

  // Fetch project data when editing
  useEffect(() => {
    if (projectModal.isOpen && projectModal.editMode && projectModal.projectId) {
      fetchProjectData();
    }
  }, [projectModal.isOpen, projectModal.editMode, projectModal.projectId]);

  // Fetch existing projects for the selected subject
  useEffect(() => {
    if (selectedSubjectId) {
      fetchSubjectProjects(selectedSubjectId);
    } else {
      setSubjectProjects([]);
      setSessionalError(null);
    }
  }, [selectedSubjectId]);

  // Check sessional limit when project type changes
  useEffect(() => {
    validateSessionalLimit();
  }, [projectType, subjectProjects]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/api/subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to load subjects");
    }
  };

  const fetchSubjectProjects = async (subjectId: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/projects?subjectId=${subjectId}`);
      setSubjectProjects(response.data);
    } catch (error) {
      console.error("Error fetching subject projects:", error);
      toast.error("Failed to load subject projects");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjectData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/projects/${projectModal.projectId}`);
      const projectData = response.data;
      
      setName(projectData.name);
      setDescription(projectData.description || "");
      setProjectType(projectData.projectType);
      setTotalMarks(projectData.totalMarks);
      setSelectedSubjectId(projectData.subjectId);
      
      // Fetch other projects for this subject to validate sessional limit
      if (projectData.subjectId) {
        await fetchSubjectProjects(projectData.subjectId);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
      toast.error("Failed to load project data");
    } finally {
      setIsLoading(false);
    }
  };

  const validateSessionalLimit = () => {
    if (projectType !== ProjectType.SESSIONAL || !selectedSubjectId) {
      setSessionalError(null);
      return true;
    }

    // Count existing sessional projects (excluding current one if in edit mode)
    const existingSessionals = subjectProjects.filter(
      project => 
        project.projectType === ProjectType.SESSIONAL && 
        (!projectModal.editMode || project.id !== projectModal.projectId)
    ).length;

    if (existingSessionals >= 2) {
      setSessionalError("This subject already has 2 sessional projects. Maximum limit reached.");
      return false;
    }

    setSessionalError(null);
    return true;
  };

  const validateMarks = () => {
    if (!projectType) return true;

    if (projectType === ProjectType.SESSIONAL && totalMarks > 30) {
      setMarkError("Sessional projects cannot exceed 30 marks");
      return false;
    }
    
    if (projectType === ProjectType.FINAL && totalMarks > 50) {
      setMarkError("Final projects cannot exceed 50 marks");
      return false;
    }
    
    setMarkError(null);
    return true;
  };

  const handleTotalMarksChange = (value: number) => {
    setTotalMarks(value);
    
    if (projectType === ProjectType.SESSIONAL && value > 30) {
      setMarkError("Sessional projects cannot exceed 30 marks");
    } else if (projectType === ProjectType.FINAL && value > 50) {
      setMarkError("Final projects cannot exceed 50 marks");
    } else {
      setMarkError(null);
    }
  };

  const onSubmit = async () => {
    if (!name || !projectType || !selectedSubjectId || totalMarks <= 0) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!validateMarks()) {
      return;
    }

    if (!validateSessionalLimit()) {
      return;
    }

    try {
      setIsLoading(true);

      const projectData = {
        name,
        description,
        projectType,
        totalMarks,
        subjectId: selectedSubjectId,
      };

      if (projectModal.editMode && projectModal.projectId) {
        await axios.put(`/api/projects/${projectModal.projectId}`, projectData);
        toast.success("Project updated successfully");
      } else {
        await axios.post("/api/projects", projectData);
        toast.success("Project created successfully");
      }

      resetForm();
      projectModal.setDataChanged(); // Signal that data has changed
      projectModal.onClose();
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setProjectType(null);
    setTotalMarks(0);
    setSelectedSubjectId(null);
    setMarkError(null);
    setSessionalError(null);
    setSubjectProjects([]);
  };

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="font-medium">Project Name*</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border rounded-md"
          placeholder="Enter project name"
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-medium">Description (Optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-2 border rounded-md h-24"
          placeholder="Enter project description"
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-medium">Project Type*</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(ProjectType).map((type) => (
            <button
              key={type}
              onClick={() => {
                setProjectType(type);
                // Re-validate marks when project type changes
                if (type === ProjectType.SESSIONAL && totalMarks > 30) {
                  setMarkError("Sessional projects cannot exceed 30 marks");
                } else if (type === ProjectType.FINAL && totalMarks > 50) {
                  setMarkError("Final projects cannot exceed 50 marks");
                } else {
                  setMarkError(null);
                }
                // Reset sessional error - will be re-validated by the useEffect
                setSessionalError(null);
              }}
              className={`p-2 rounded-md border transition ${
                projectType === type
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              disabled={isLoading}
            >
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        {sessionalError && (
          <p className="text-red-500 text-sm">{sessionalError}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-medium">Total Marks*</label>
        <input
          type="number"
          value={totalMarks}
          onChange={(e) => handleTotalMarksChange(parseInt(e.target.value) || 0)}
          className={`p-2 border rounded-md ${markError ? 'border-red-500' : ''}`}
          placeholder="Enter total marks"
          disabled={isLoading}
          min="0"
        />
        {markError && (
          <p className="text-red-500 text-sm">{markError}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-medium">Subject*</label>
        <select
          value={selectedSubjectId || ""}
          onChange={(e) => setSelectedSubjectId(e.target.value || null)}
          className="p-2 border rounded-md"
          disabled={isLoading || projectModal.editMode}
        >
          <option value="">Select a subject</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name} {subject.code ? `(${subject.code})` : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={projectModal.isOpen}
      onClose={projectModal.onClose}
      onSubmit={onSubmit}
      title={projectModal.editMode ? "Edit Project" : "Create Project"}
      actionLabel={projectModal.editMode ? "Update" : "Create"}
      body={bodyContent}
      disabled={isLoading}
    />
  );
};

export default ProjectModal;