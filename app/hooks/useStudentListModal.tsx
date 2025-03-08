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
  dataChanged: boolean;
  onOpen: (mode?: StudentListModalMode, listId?: string | null) => void;
  onClose: () => void;
  setDataChanged: () => void;
  resetDataChanged: () => void;
}

const useStudentListModal = create<StudentListModalStore>((set) => ({
  isOpen: false,
  mode: StudentListModalMode.CREATE,
  listId: null,
  dataChanged: false,
  onOpen: (mode = StudentListModalMode.CREATE, listId = null) => 
    set({ isOpen: true, mode, listId }),
  onClose: () => set({ isOpen: false, listId: null }),
  setDataChanged: () => set({ dataChanged: true }),
  resetDataChanged: () => set({ dataChanged: false }),
}));

export default useStudentListModal;