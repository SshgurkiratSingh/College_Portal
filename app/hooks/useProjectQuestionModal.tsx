import { create } from "zustand";

interface ProjectQuestionModalStore {
  isOpen: boolean;
  projectId: string | null;
  questionId: string | null;
  editMode: boolean;
  dataChanged: boolean;
  onOpen: (projectId: string) => void;
  onEdit: (projectId: string, questionId: string) => void;
  onClose: () => void;
  setDataChanged: () => void;
  resetDataChanged: () => void;
}

const useProjectQuestionModal = create<ProjectQuestionModalStore>((set) => ({
  isOpen: false,
  projectId: null,
  questionId: null,
  editMode: false,
  dataChanged: false,
  onOpen: (projectId: string) => 
    set({ isOpen: true, projectId, questionId: null, editMode: false }),
  onEdit: (projectId: string, questionId: string) => 
    set({ isOpen: true, projectId, questionId, editMode: true }),
  onClose: () => 
    set({ isOpen: false, projectId: null, questionId: null, editMode: false }),
  setDataChanged: () => set({ dataChanged: true }),
  resetDataChanged: () => set({ dataChanged: false }),
}));

export default useProjectQuestionModal;