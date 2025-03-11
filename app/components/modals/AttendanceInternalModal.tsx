"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";

import Modal from "./Modals";
import Heading from "../Heading";
import Input from "../inputs/Input";

interface Student {
  id: string;
  rollNo: string;
  name: string;
  marks: number;
}

interface AttendanceInternalModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  mode?: 'create' | 'edit' | 'view';
  attendanceId?: string;
}

const AttendanceInternalModal: React.FC<AttendanceInternalModalProps> = ({
  isOpen,
  onClose,
  subjectId,
  mode = 'create',
  attendanceId
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

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
      totalMarks: 100,
    },
  });

  const name = watch("name");
  const description = watch("description");
  const totalMarks = watch("totalMarks");

  useEffect(() => {
    const fetchData = async () => {
      if (!subjectId) return;
      
      try {
        setIsLoading(true);
        
        // Fetch subject details to get student list
        const subjectResponse = await axios.get(`/api/subjects/${subjectId}`);
        const studentListId = subjectResponse.data.studentListId;
        
        if (studentListId) {
          // Fetch students from the student list
          const studentListResponse = await axios.get(`/api/student-lists/${studentListId}/students`);
          setStudents(studentListResponse.data.students.map((student: any) => ({
            ...student,
            marks: 0 // Initialize marks as 0
          })));
        }

        if (mode !== 'create' && attendanceId) {
          // Fetch existing attendance data for edit/view mode
          const attendanceResponse = await axios.get(`/api/attendance/${attendanceId}`);
          const data = attendanceResponse.data;
          setValue("name", data.name);
          setValue("description", data.description);
          setValue("totalMarks", data.totalMarks);
          // TODO: Set student marks from stored data
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, subjectId, mode, attendanceId, setValue]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      setIsLoading(true);

      const attendanceData = {
        name: data.name,
        description: data.description,
        totalMarks: parseInt(data.totalMarks),
        subjectId,
        students: students.map(student => ({
          studentId: student.id,
          marks: student.marks
        }))
      };

      if (mode === 'edit' && attendanceId) {
        await axios.patch(`/api/attendance/${attendanceId}`, attendanceData);
        toast.success("Attendance/Internal marks updated successfully!");
      } else {
        await axios.post("/api/attendance", attendanceData);
        toast.success("Attendance/Internal marks created successfully!");
      }

      router.refresh();
      reset();
      onClose();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStudentMarks = (studentId: string, marks: number) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId
          ? { ...student, marks: Math.min(marks, totalMarks) }
          : student
      )
    );
  };

  // Handle filling same marks for all students
  const fillAllMarks = (marks: number) => {
    setStudents(prevStudents =>
      prevStudents.map(student => ({
        ...student,
        marks: Math.min(marks, totalMarks)
      }))
    );
  };

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading
        title={mode === 'create' ? "Create Attendance/Internal" : mode === 'edit' ? "Edit Attendance/Internal" : "View Attendance/Internal"}
        subtitle="Manage attendance and internal assessment marks"
      />
      <Input
        id="name"
        label="Name"
        disabled={isLoading || mode === 'view'}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="description"
        label="Description"
        disabled={isLoading || mode === 'view'}
        register={register}
        errors={errors}
      />
      <Input
        id="totalMarks"
        label="Total Marks"
        type="number"
        disabled={isLoading || mode === 'view'}
        register={register}
        errors={errors}
        required
      />
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Student Marks</h3>
          {mode !== 'view' && (
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Marks"
                className="w-24 p-2 border rounded"
                onChange={(e) => {
                  const marks = Math.min(parseInt(e.target.value) || 0, totalMarks);
                  fillAllMarks(marks);
                }}
              />
              <button
                type="button"
                onClick={() => fillAllMarks(totalMarks)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Fill All
              </button>
            </div>
          )}
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Roll No</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-right">Marks</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b">
                  <td className="px-4 py-2">{student.rollNo}</td>
                  <td className="px-4 py-2">{student.name}</td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={student.marks}
                      onChange={(e) => {
                        const marks = Math.min(parseInt(e.target.value) || 0, totalMarks);
                        updateStudentMarks(student.id, marks);
                      }}
                      disabled={mode === 'view'}
                      className="w-20 p-1 border rounded text-right"
                      min="0"
                      max={totalMarks}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={isOpen}
      title="Attendance/Internal"
      actionLabel={mode === 'view' ? "Close" : mode === 'edit' ? "Save Changes" : "Create"}
      onClose={onClose}
      onSubmit={mode === 'view' ? onClose : handleSubmit(onSubmit)}
      body={bodyContent}
    />
  );
};

export default AttendanceInternalModal;