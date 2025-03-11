import { create } from "zustand";

export enum AttendanceInternalModalMode {
  CREATE = "create",
  VIEW = "view",
  EDIT = "edit",
}

interface AttendanceInternalModalStore {
  isOpen: boolean;
  mode: AttendanceInternalModalMode;
  subjectId?: string;
  attendanceId?: string;
  dataChanged: boolean;
  onOpen: (mode: AttendanceInternalModalMode, subjectId: string, attendanceId?: string) => void;
  onClose: () => void;
  setDataChanged: () => void;
  resetDataChanged: () => void;
}

const useAttendanceInternalModal = create<AttendanceInternalModalStore>((set) => ({
  isOpen: false,
  mode: AttendanceInternalModalMode.CREATE,
  subjectId: undefined,
  attendanceId: undefined,
  dataChanged: false,
  onOpen: (mode, subjectId, attendanceId) => set({ isOpen: true, mode, subjectId, attendanceId }),
  onClose: () => set({ isOpen: false }),
  setDataChanged: () => set({ dataChanged: true }),
  resetDataChanged: () => set({ dataChanged: false }),
}));

export default useAttendanceInternalModal;