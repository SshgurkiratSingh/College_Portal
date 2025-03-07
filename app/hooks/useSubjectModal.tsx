import { create } from "zustand";

export enum SubjectModalMode {
  CREATE = "create",
  VIEW = "view",
  EDIT = "edit",
}

interface SubjectModalStore {
  isOpen: boolean;
  mode: SubjectModalMode;
  subjectId?: string;
  onOpen: (mode: SubjectModalMode, subjectId?: string) => void;
  onClose: () => void;
}

const useSubjectModal = create<SubjectModalStore>((set) => ({
  isOpen: false,
  mode: SubjectModalMode.CREATE,
  subjectId: undefined,
  onOpen: (mode, subjectId) => set({ isOpen: true, mode, subjectId }),
  onClose: () => set({ isOpen: false }),
}));

export default useSubjectModal;