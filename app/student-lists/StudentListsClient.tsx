"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { SafeUser } from "@/app/types";
import Heading from "@/app/components/Heading";
import useStudentListModal, {
  StudentListModalMode,
} from "@/app/hooks/useStudentListModal";
import Button from "@/app/components/Button";
import EmptyState from "@/app/components/EmptyState";

interface StudentListsClientProps {
  currentUser?: SafeUser | null;
}

interface Student {
  id: string;
  rollNo: string;
  name: string;
  email?: string | null;
}

interface StudentList {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  students: Student[];
}

const StudentListsClient: React.FC<StudentListsClientProps> = ({
  currentUser,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [studentLists, setStudentLists] = useState<StudentList[]>([]);
  const studentListModal = useStudentListModal();

  // Fetch student lists on component mount
  useEffect(() => {
    const fetchStudentLists = async () => {
      try {
        const response = await axios.get("/api/student-lists");
        setStudentLists(response.data);
      } catch (error) {
        toast.error("Failed to fetch student lists");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentLists();
  }, []);

  // Open modal to create a new student list
  const handleCreateList = () => {
    studentListModal.onOpen(StudentListModalMode.CREATE);
  };

  // Open modal to view a student 
  const handleViewList = (listId: string) => {
    studentListModal.onOpen(StudentListModalMode.VIEW, listId);
  };

  // Open modal to edit a student list
  const handleEditList = (listId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the view action
    studentListModal.onOpen(StudentListModalMode.EDIT, listId);
  };

  // Delete a student list
  const handleDeleteList = async (listId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the view action

    if (!confirm("Are you sure you want to delete this student list?")) {
      return;
    }

    setIsLoading(true);
    try {
      await axios.delete(`/api/student-lists/${listId}`);
      setStudentLists((prev) => prev.filter((list) => list.id !== listId));
      toast.success("Student list deleted successfully");
    } catch (error) {
      toast.error("Failed to delete student list");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (studentLists.length === 0) {
    return (
      <div className="pt-6">
        <EmptyState
          title="No Student Lists Found"
          subtitle="You haven't created any student lists yet."
          actionLabelText="Create a Student List"
          onAction={handleCreateList}
        />
      </div>
    );
  }

  return (
    <div className="pt-6">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          title="Your Student Lists"
          subtitle="Manage and view your student lists"
        />
        <div >
          <Button label="Create New List" onClick={handleCreateList}  />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {studentLists.map((studentList) => (
          <div
            key={studentList.id}
            onClick={() => handleViewList(studentList.id)}
            className="col-span-1 cursor-pointer group border border-gray-200 rounded-md p-4 hover:shadow-md transition"
          >
            <div className="flex flex-col gap-2">
              <div className="text-lg font-semibold">{studentList.name}</div>

              {studentList.description && (
                <div className="text-sm text-gray-600 line-clamp-2">
                  {studentList.description}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {studentList.students.length} students
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(studentList.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-end space-x-2">
                <button
                  onClick={(e) => handleEditList(studentList.id, e)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => handleDeleteList(studentList.id, e)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentListsClient;
