import { create } from "zustand";

export enum PaperType {
  SESSIONAL = "SESSIONAL",
  FINAL = "FINAL",
  QUIZ = "QUIZ",
  ASSIGNMENT = "ASSIGNMENT",
}

interface UploadPaperModalStore {
  isOpen: boolean;
  subjectId: string | null;
  onOpen: (subjectId: string) => void;
  onClose: () => void;
}

const useUploadPaperModal = create<UploadPaperModalStore>((set) => ({
  isOpen: false,
  subjectId: null,
  onOpen: (subjectId: string) => set({ isOpen: true, subjectId }),
  onClose: () => set({ isOpen: false, subjectId: null }),
}));

export default useUploadPaperModal;