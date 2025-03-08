import { create } from "zustand";

interface ProjectQuestionModalStore {
  isOpen: boolean;
  projectId: string | null;
  questionId: string | null;
  editMode: boolean;
  onOpen: (projectId: string) => void;
  onEdit: (projectId: string, questionId: string) => void;
  onClose: () => void;
}

const useProjectQuestionModal = create<ProjectQuestionModalStore>((set) => ({
  isOpen: false,
  projectId: null,
  questionId: null,
  editMode: false,
  onOpen: (projectId: string) => 
    set({ isOpen: true, projectId, questionId: null, editMode: false }),
  onEdit: (projectId: string, questionId: string) => 
    set({ isOpen: true, projectId, questionId, editMode: true }),
  onClose: () => 
    set({ isOpen: false, projectId: null, questionId: null, editMode: false }),
}));

export default useProjectQuestionModal;