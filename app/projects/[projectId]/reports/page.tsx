"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Button from "@/app/components/Button";
import Heading from "@/app/components/Heading";

interface ReportData {
  projectDetails: {
    name: string;
    type: string;
    totalMarks: number;
  };
  studentScores: Array<{
    studentId: string;
    rollNo: string;
    name: string;
    coScores: {
      [key: string]: {
        earned: number;
        total: number;
      };
    };
    attainmentLevels: {
      [key: string]: number;
    };
  }>;
  courseOutcomes: any;
}

const ReportsPage = ({ params }: { params: { projectId: string } }) => {
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await axios.get(
          `/api/projects/${params.projectId}/reports`
        );
        setReportData(response.data);
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [params.projectId]);

  if (loading) {
    return <div>Loading report data...</div>;
  }

  if (!reportData) {
    return <div>No report data available</div>;
  }

  return (
    <div className="max-w-7xl  mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-800">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push(`/projects/${params.projectId}`)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md mr-4"
        >
          &larr; Back to Project
        </button>
        <Heading
          title="Project Reports"
          subtitle={reportData.projectDetails.name}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Project Details Card */}
        <div className="bg-gray-100 text-gray-900 shadow-md rounded-lg p-6 ">
          <h3 className="text-lg font-medium mb-4">Project Details</h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Type:</span>{" "}
              {reportData.projectDetails.type}
            </p>
            <p>
              <span className="font-medium">Total Marks:</span>{" "}
              {reportData.projectDetails.totalMarks}
            </p>
          </div>
        </div>

        {/* Report Options Card */}
        <div className="bg-gray-100 text-gray-900 shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Available Reports</h3>
          <div className="space-y-3">
            <Button
              label="View Consolidated Report"
              onClick={() =>
                router.push(
                  `/projects/${params.projectId}/reports/consolidated`
                )
              }
            />
            <Button
              label="View CO Attainment Report"
              onClick={() =>
                router.push(`/projects/${params.projectId}/reports/attainment`)
              }
              outline
            />
          </div>
        </div>
      </div>

      {/* Student Performance Summary */}
      <div className="bg-white text-gray-800 shadow-md rounded-lg p-6">
        <h3 className="text-lg text-gray-800 font-medium mb-4">
          Student Performance Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase">
                  Roll No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase">
                  Name
                </th>
                {Object.keys(reportData.studentScores[0]?.coScores || {}).map(
                  (coCode) => (
                    <th
                      key={coCode}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase"
                    >
                      {coCode}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white  text-gray-800 divide-y divide-gray-200">
              {reportData.studentScores.map((student) => (
                <tr key={student.studentId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.rollNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {student.name}
                  </td>
                  {Object.entries(student.coScores).map(([coCode, scores]) => (
                    <td
                      key={coCode}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                    >
                      {((scores.earned / scores.total) * 100).toFixed(1)}%
                      <br />
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          student.attainmentLevels[coCode] >= 2
                            ? "bg-green-100 text-green-800"
                            : student.attainmentLevels[coCode] === 1
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        L{student.attainmentLevels[coCode]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
