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
  dataChanged: boolean;
  onOpen: (mode: SubjectModalMode, subjectId?: string) => void;
  onClose: () => void;
  setDataChanged: () => void;
  resetDataChanged: () => void;
}

const useSubjectModal = create<SubjectModalStore>((set) => ({
  isOpen: false,
  mode: SubjectModalMode.CREATE,
  subjectId: undefined,
  dataChanged: false,
  onOpen: (mode, subjectId) => set({ isOpen: true, mode, subjectId }),
  onClose: () => set({ isOpen: false }),
  setDataChanged: () => set({ dataChanged: true }),
  resetDataChanged: () => set({ dataChanged: false }),
}));

export default useSubjectModal;