"use client";

import { useCallback, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

import Modal from "./Modals";
import useStudentListModal, {
  StudentListModalMode,
} from "@/app/hooks/useStudentListModal";
import Heading from "../Heading";
import Input from "../inputs/Input";

enum STEPS {
  DETAILS = 0,
  UPLOAD = 1,
  VIEW_EDIT = 2,
}

interface Student {
  id: string;
  rollNo: string;
  name: string;
  email?: string;
  section?: string;
  batch?: string;
}

interface StudentList {
  id: string;
  name: string;
  description: string;
  students: Student[];
}

interface StudentListModalProps {}

const StudentListModal: React.FC<StudentListModalProps> = () => {
  const router = useRouter();
  const studentListModal = useStudentListModal();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(STEPS.DETAILS);
  const [csvData, setCsvData] = useState<string>("");
  const [manualEntry, setManualEntry] = useState<boolean>(false);
  const [studentList, setStudentList] = useState<StudentList | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [fileType, setFileType] = useState<"csv" | "xlsx">("csv");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      description: "",
      csvText: "",
      // For student editing
      studentRollNo: "",
      studentName: "",
      studentEmail: "",
      studentSection: "",
      studentBatch: "",
    },
  });

  const name = watch("name");
  const description = watch("description");
  const csvText = watch("csvText");

  // Set initial state based on modal mode
  useEffect(() => {
    // Reset state when modal is closed
    if (!studentListModal.isOpen) {
      return;
    }

    if (studentListModal.mode === StudentListModalMode.CREATE) {
      setStep(STEPS.DETAILS);
      reset();
      setStudentList(null);
      setEditingStudent(null);
    } else {
      // VIEW or EDIT mode
      if (studentListModal.listId) {
        fetchStudentList(studentListModal.listId);
        setStep(STEPS.VIEW_EDIT);
      }
    }
  }, [studentListModal.isOpen, studentListModal.mode, studentListModal.listId]);

  // Fetch student list data
  const fetchStudentList = async (listId: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/student-lists");
      const lists = response.data;
      const list = lists.find((l: StudentList) => l.id === listId);

      if (list) {
        setStudentList(list);
        setStudents(list.students);

        // Set form values
        setValue("name", list.name);
        setValue("description", list.description || "");
      } else {
        toast.error("Student list not found");
      }
    } catch (error) {
      toast.error("Failed to fetch student list data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const onBack = () => {
    if (editingStudent) {
      setEditingStudent(null);
      return;
    }

    if (
      studentListModal.mode !== StudentListModalMode.CREATE &&
      step === STEPS.VIEW_EDIT
    ) {
      studentListModal.onClose();
      return;
    }

    setStep((v) => v - 1);
  };

  const onNext = () => {
    setStep((v) => v + 1);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set file type based on extension
    const extension = file.name.split(".").pop()?.toLowerCase();
    setFileType(extension === "xlsx" || extension === "xls" ? "xlsx" : "csv");

    if (extension === "xlsx" || extension === "xls") {
      // Handle Excel file
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert Excel to CSV
          const csvContent = XLSX.utils.sheet_to_csv(worksheet);
          setCsvData(csvContent);
          setCustomValue("csvText", csvContent);
        } catch (error) {
          toast.error("Failed to process Excel file");
          console.error(error);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      // Handle CSV file (existing functionality)
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCsvData(content);
        setCustomValue("csvText", content);
      };
      reader.readAsText(file);
    }
  };

  const startEditStudent = (student: Student) => {
    setEditingStudent(student);
    setValue("studentRollNo", student.rollNo);
    setValue("studentName", student.name);
    setValue("studentEmail", student.email || "");
    setValue("studentSection", student.section || "");
    setValue("studentBatch", student.batch || "");
  };

  const saveStudentChanges = async () => {
    if (!editingStudent || !studentList) return;

    const updatedStudent = {
      id: editingStudent.id,
      rollNo: watch("studentRollNo"),
      name: watch("studentName"),
      email: watch("studentEmail"),
      section: watch("studentSection"),
      batch: watch("studentBatch"),
    };

    setIsLoading(true);
    try {
      // Update student in the database
      await axios.put(
        `/api/student-lists/${studentList.id}/students/${editingStudent.id}`,
        updatedStudent
      );

      // Update local state
      const updatedStudents = students.map((s) =>
        s.id === editingStudent.id ? updatedStudent : s
      );
      setStudents(updatedStudents);

      toast.success("Student updated successfully!");
      setEditingStudent(null);
    } catch (error) {
      toast.error("Failed to update student");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStudent = async (student: Student) => {
    if (!studentList) return;

    if (!confirm(`Are you sure you want to delete ${student.name}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      // Delete student from database
      await axios.delete(
        `/api/student-lists/${studentList.id}/students/${student.id}`
      );

      // Update local state
      const updatedStudents = students.filter((s) => s.id !== student.id);
      setStudents(updatedStudents);

      toast.success("Student deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete student");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    // For create mode - handle next step navigation
    if (studentListModal.mode === StudentListModalMode.CREATE) {
      if (step !== STEPS.UPLOAD) {
        return onNext();
      }

      setIsLoading(true);

      // Prepare the data to send for creating new list
      const formData = {
        name: data.name,
        description: data.description,
        csvText: data.csvText || csvData,
      };

      axios
        .post("/api/student-lists", formData)
        .then(() => {
          toast.success("Student list created successfully!");
          router.refresh();
          reset();
          setStep(STEPS.DETAILS);
          studentListModal.onClose();
        })
        .catch((error) => {
          toast.error(error?.response?.data?.error || "Something went wrong.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    // For edit mode - handle student editing
    else if (
      studentListModal.mode === StudentListModalMode.EDIT &&
      editingStudent
    ) {
      saveStudentChanges();
    }
  };

  let bodyContent;
  let actionLabel = "Next";
  let secondaryActionLabel;

  // DETAILS STEP (for Create mode only)
  if (step === STEPS.DETAILS) {
    bodyContent = (
      <div className="flex flex-col gap-4">
        <Heading
          title="Create a Student List"
          subtitle="Enter details about your student list"
        />

        <div className="flex flex-col gap-4">
          <Input
            id="name"
            label="List Name"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            placeholderText="ex: 2021-ECE"
          />

          <Input
            id="description"
            label="Description"
            disabled={isLoading}
            register={register}
            errors={errors}
          />
        </div>
      </div>
    );
    actionLabel = "Next";
    secondaryActionLabel = undefined;
  }
  // UPLOAD STEP (for Create mode only)
  else if (step === STEPS.UPLOAD) {
    bodyContent = (
      <div className="flex flex-col gap-4">
        <Heading
          title="Upload Student Data"
          subtitle="Upload a CSV/Excel file or manually enter student details"
        />

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setManualEntry(false)}
            className={`px-4 py-2 rounded ${
              !manualEntry ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => setManualEntry(true)}
            className={`px-4 py-2 rounded ${
              manualEntry ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Manual Entry
          </button>
        </div>

        {!manualEntry ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Upload CSV or Excel file
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your file should have columns: rollNo, name, email (optional)
              </p>
            </div>

            {csvData && (
              <div className="mt-2">
                <p className="text-sm font-medium">
                  {fileType === "xlsx" ? "Excel Preview:" : "CSV Preview:"}
                </p>
                <pre className="p-2 bg-gray-100 rounded-md text-xs mt-1 max-h-40 overflow-y-auto">
                  {csvData.substring(0, 300)}
                  {csvData.length > 300 ? "..." : ""}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Enter student data (one per line)
              </label>
              <textarea
                {...register("csvText")}
                disabled={isLoading}
                className="w-full h-40 p-2 border border-gray-300 rounded-md focus:outline-none"
                placeholder="rollNo,name,email
101,John Doe,john@example.com
102,Jane Smith,jane@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: rollNo,name,email (email is optional)
              </p>
            </div>
          </div>
        )}
      </div>
    );
    actionLabel = "Create Student List";
    secondaryActionLabel = "Back";
  }
  // VIEW/EDIT STEP
  else if (step === STEPS.VIEW_EDIT) {
    if (editingStudent) {
      // Editing an individual student
      bodyContent = (
        <div className="flex flex-col gap-4">
          <Heading
            title={`Edit Student: ${editingStudent.name}`}
            subtitle="Update student information"
          />

          <div className="flex flex-col gap-4">
            <Input
              id="studentRollNo"
              label="Roll Number"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
            />
            <Input
              id="studentName"
              label="Student Name"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
            />
            <Input
              id="studentEmail"
              label="Email"
              disabled={isLoading}
              register={register}
              errors={errors}
            />
            <Input
              id="studentSection"
              label="Section"
              disabled={isLoading}
              register={register}
              errors={errors}
            />
            <Input
              id="studentBatch"
              label="Batch"
              disabled={isLoading}
              register={register}
              errors={errors}
            />
          </div>
        </div>
      );
      actionLabel = "Save Changes";
      secondaryActionLabel = "Cancel";
    } else {
      // Viewing student list
      bodyContent = (
        <div className="flex flex-col gap-4">
          <Heading
            title={studentList?.name || "Student List"}
            subtitle={
              studentList?.description || "View and manage student entries"
            }
          />

          {studentListModal.mode === StudentListModalMode.EDIT && (
            <div className="text-sm text-blue-500 mb-2">
              You can edit student entries below. Click on a student to edit
              their details.
            </div>
          )}

          <div className="overflow-y-auto max-h-[60vh]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Roll No.
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Section
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Batch
                  </th>
                  {studentListModal.mode === StudentListModalMode.EDIT && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No students found in this list
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr
                      key={student.id}
                      className={`${
                        studentListModal.mode === StudentListModalMode.EDIT
                          ? "cursor-pointer hover:bg-gray-50"
                          : ""
                      }`}
                      onClick={() =>
                        studentListModal.mode === StudentListModalMode.EDIT &&
                        startEditStudent(student)
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.rollNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.email || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.section || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.batch || "-"}
                      </td>
                      {studentListModal.mode === StudentListModalMode.EDIT && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteStudent(student);
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
      actionLabel = "Close";
      secondaryActionLabel = undefined;
    }
  }

  return (
    <Modal
      disabled={isLoading}
      isOpen={studentListModal.isOpen}
      title={
        studentListModal.mode === StudentListModalMode.CREATE
          ? "Create Student List"
          : studentListModal.mode === StudentListModalMode.VIEW
          ? "Student List Details"
          : "Edit Student List"
      }
      actionLabel={actionLabel}
      onClose={studentListModal.onClose}
      secondaryAction={secondaryActionLabel ? onBack : undefined}
      secondaryActionLabel={secondaryActionLabel}
      onSubmit={
        actionLabel === "Close"
          ? studentListModal.onClose
          : handleSubmit(onSubmit)
      }
      body={bodyContent}
    />
  );
};

export default StudentListModal;
