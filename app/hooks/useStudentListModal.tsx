import { create } from "zustand";

export enum StudentListModalMode {
  CREATE = "CREATE",
  VIEW = "VIEW",
  EDIT = "EDIT"
}

interface StudentListModalStore {
  isOpen: boolean;
  mode: StudentListModalMode;
  listId: string | null;
  onOpen: (mode?: StudentListModalMode, listId?: string) => void;
  onClose: () => void;
}

const useStudentListModal = create<StudentListModalStore>((set) => ({
  isOpen: false,
  mode: StudentListModalMode.CREATE,
  listId: null,
  onOpen: (mode = StudentListModalMode.CREATE, listId = null) => 
    set({ isOpen: true, mode, listId }),
  onClose: () => set({ isOpen: false, listId: null }),
}));

export default useStudentListModal;