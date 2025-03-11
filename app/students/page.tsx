"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Container from "../components/container";
import Heading from "../components/Heading";
import EmptyState from "../components/EmptyState";
import apiClient from "../utils/apiClient";
import { useNetworkStatus } from "../utils/networkStatus";

interface Student {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  section?: string;
  batchYear?: string;
  createdAt: string;
}

const StudentsPage = () => {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const isOnline = useNetworkStatus();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (student.section && student.section.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<Student[]>('/api/student-lists');
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Network status indicator 
  const NetworkIndicator = () => (
    <div className={`mb-4 p-2 rounded-md ${isOnline ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className={`text-sm ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
          {isOnline ? 'Online' : 'Offline - Using cached data'}
        </span>
      </div>
    </div>
  );

  return (
    <Container>
      <div className="pt-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <Heading title="Students" subtitle="View all students" />
          <div className="mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Search by name, roll number, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-300 rounded-md w-full md:w-64"
            />
          </div>
        </div>

        <NetworkIndicator />

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            title="No students found"
            subtitle={
              searchTerm
                ? "Try adjusting your search criteria"
                : "Import or add students to get started"
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-black rounded-md overflow-hidden">
              <thead>
                <tr className="bg-gray-600 text-white">
                  <th className="py-2 px-4 text-left">Roll No</th>
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Email</th>
                  <th className="py-2 px-4 text-left">Section</th>
                  <th className="py-2 px-4 text-left">Batch</th>
                  <th className="py-2 px-4 text-left">Added On</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer"
                    onClick={() => router.push(`/students/${student.id}`)}
                  >
                    <td className="py-2 px-4 text-white">{student.rollNo}</td>
                    <td className="py-2 px-4 text-white">{student.name}</td>
                    <td className="py-2 px-4 text-white">{student.email || "-"}</td>
                    <td className="py-2 px-4 text-white">{student.section || "-"}</td>
                    <td className="py-2 px-4 text-white">{student.batchYear || "-"}</td>
                    <td className="py-2 px-4 text-white">
                      {formatDate(student.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Container>
  );
};

export default StudentsPage;