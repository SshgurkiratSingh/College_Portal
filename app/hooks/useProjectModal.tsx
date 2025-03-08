import { create } from "zustand";

export enum ProjectType {
  SESSIONAL = "SESSIONAL",
  FINAL = "FINAL",
  QUIZ = "QUIZ",
  ASSIGNMENT = "ASSIGNMENT",
}

interface ProjectModalStore {
  isOpen: boolean;
  subjectId: string | null;
  editMode: boolean;
  projectId: string | null;
  dataChanged: boolean;
  onOpen: (subjectId: string) => void;
  onEdit: (projectId: string, subjectId: string) => void;
  onClose: () => void;
  setDataChanged: () => void;
  resetDataChanged: () => void;
}

const useProjectModal = create<ProjectModalStore>((set) => ({
  isOpen: false,
  subjectId: null,
  editMode: false,
  projectId: null,
  dataChanged: false,
  onOpen: (subjectId: string) => set({ isOpen: true, subjectId, editMode: false, projectId: null }),
  onEdit: (projectId: string, subjectId: string) => 
    set({ isOpen: true, projectId, subjectId, editMode: true }),
  onClose: () => set({ isOpen: false, subjectId: null, editMode: false, projectId: null }),
  setDataChanged: () => set({ dataChanged: true }),
  resetDataChanged: () => set({ dataChanged: false }),
}));

export default useProjectModal;