"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import Container from "../components/container";
import Heading from "../components/Heading";
import EmptyState from "../components/EmptyState";
import useSubjectModal, { SubjectModalMode } from "../hooks/useSubjectModal";
import useUploadPaperModal from "../hooks/useUploadPaperModal";
import ClientOnly from "../components/ClientOnly";
import UploadPaperModal from "../components/modals/UploadPaperModal";

interface CourseOutcome {
  id?: string;
  code: string;
  description: string;
}

interface OutcomeMapping {
  outcomeId: string;
  value: number;
}

interface COMapping {
  coId: string;
  mappings: OutcomeMapping[];
}

interface Subject {
  id: string;
  name: string;
  code: string;
  studentListId: string | null;
  description?: string;
  courseOutcomes: CourseOutcome[];
  mappings: COMapping[];
  studentList?: {
    name: string;
  };
}

interface StudentList {
  id: string;
  name: string;
}

const SubjectsPage = () => {
  const router = useRouter();
  const subjectModal = useSubjectModal();
  const uploadPaperModal = useUploadPaperModal();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studentLists, setStudentLists] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const subjectsResponse = await axios.get("/api/subjects");
        setSubjects(subjectsResponse.data);

        const studentListsResponse = await axios.get("/api/student-lists");
        const studentListsMap: Record<string, string> = {};
        studentListsResponse.data.forEach((list: StudentList) => {
          studentListsMap[list.id] = list.name;
        });
        setStudentLists(studentListsMap);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        toast.error("Failed to load subjects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (subjectId: string) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) {
      return;
    }
    try {
      await axios.delete(`/api/subjects/${subjectId}`);
      toast.success("Subject deleted successfully");
      setSubjects((current) =>
        current.filter((subject) => subject.id !== subjectId)
      );
      router.refresh();
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Failed to delete subject");
    }
  };

  const handleEdit = (subjectId: string) => {
    subjectModal.onOpen(SubjectModalMode.EDIT, subjectId);
  };

  const handleView = (subjectId: string) => {
    subjectModal.onOpen(SubjectModalMode.VIEW, subjectId);
  };

  const handleAddNew = () => {
    subjectModal.onOpen(SubjectModalMode.CREATE);
  };

  const handleUploadPaper = (subjectId: string) => {
    uploadPaperModal.onOpen(subjectId);
  };

  if (isLoading) {
    return (
      <Container>
        <div className="pt-24">
          <Heading
            title="Loading..."
            subtitle="Please wait while we fetch the subjects"
          />
        </div>
      </Container>
    );
  }

  if (subjects.length === 0) {
    return (
      <Container>
        <div className="pt-24">
          <EmptyState
            title="No subjects found"
            subtitle="Click the button below to add your first subject"
          />
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleAddNew}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
            >
              Add New Subject
            </button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <ClientOnly>
      <Container>
        <div className="pt-24">
          <div className="flex justify-between items-center mb-6">
            <Heading title="Subjects" subtitle="Manage your subjects" />
            <button
              onClick={handleAddNew}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
            >
              Add New Subject
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="border rounded-lg p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {subject.name} ({subject.code})
                    </h2>
                    <p className="text-sm text-gray-500">
                      Student List:{" "}
                      {subject.studentList?.name ||
                        (subject.studentListId
                          ? studentLists[subject.studentListId]
                          : "Unknown")}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(subject.id)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleUploadPaper(subject.id)}
                      className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-md text-sm transition"
                    >
                      Upload Paper
                    </button>
                    <button
                      onClick={() => handleEdit(subject.id)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md text-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(subject.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md text-sm transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {subject.description && (
                  <p className="mt-2 text-gray-600">{subject.description}</p>
                )}

                <div className="mt-4">
                  <h3 className="text-md font-medium">Course Outcomes:</h3>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {subject.courseOutcomes.map((co, index) => (
                      <div
                        key={co.id || index}
                        className="bg-gray-800 p-3 rounded-md"
                      >
                        <span className="font-medium">{co.code}:</span>{" "}
                        {co.description}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
      <UploadPaperModal />
    </ClientOnly>
  );
};

export default SubjectsPage;