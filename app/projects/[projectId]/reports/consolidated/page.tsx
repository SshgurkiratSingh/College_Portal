"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Button from "@/app/components/Button";
import Heading from "@/app/components/Heading";

interface ConsolidatedReport {
  subject: {
    name: string;
    code: string | null;
  };
  assessmentComponents: Array<{
    name: string;
    type: string;
    totalMarks: number;
  }>;
  studentPerformance: Array<{
    studentId: string;
    rollNo: string;
    name: string;
    assessments: Array<{
      projectName: string;
      projectType: string;
      scores: Array<{
        questionNum: string;
        coCode: string;
        score: number;
        maxMarks: number;
      }>;
    }>;
  }>;
  courseOutcomes: any;
}

const ConsolidatedReportPage = ({
  params,
}: {
  params: { projectId: string };
}) => {
  const router = useRouter();
  const [reportData, setReportData] = useState<ConsolidatedReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await axios.get(
          `/api/projects/${params.projectId}/reports/consolidated`
        );
        setReportData(response.data);
      } catch (error) {
        console.error("Error fetching consolidated report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [params.projectId]);

  if (loading) {
    return <div>Loading consolidated report data...</div>;
  }

  if (!reportData) {
    return <div>No consolidated report data available</div>;
  }

  return (
    <div className="max-w-7xl  text-gray-800 mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push(`/projects/${params.projectId}/reports`)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md mr-4"
        >
          &larr; Back to Reports
        </button>
        <div className="text-white">
          <Heading
            title="Consolidated Course Report"
            subtitle={`${reportData.subject.name} ${
              reportData.subject.code ? `(${reportData.subject.code})` : ""
            }`}
          />
        </div>
      </div>

      {/* Assessment Components Summary */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium mb-4">Assessment Components</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Marks
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.assessmentComponents.map((component, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {component.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {component.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {component.totalMarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Performance Matrix */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Student Performance Matrix</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Roll No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                {reportData.assessmentComponents.map((component, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {component.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.studentPerformance.map((student) => (
                <tr key={student.studentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.rollNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.name}
                  </td>
                  {student.assessments.map((assessment, index) => {
                    const totalScore = assessment.scores.reduce(
                      (sum, score) => sum + score.score,
                      0
                    );
                    const maxScore = assessment.scores.reduce(
                      (sum, score) => sum + score.maxMarks,
                      0
                    );
                    return (
                      <td
                        key={index}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {totalScore}/{maxScore}
                        <br />
                        <span className="text-xs text-gray-400">
                          ({((totalScore / maxScore) * 100).toFixed(1)}%)
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div className="mt-8 flex justify-end space-x-4">
        <Button
          label="Export to Excel"
          onClick={() => {
            // TODO: Implement Excel export
            alert("Excel export coming soon!");
          }}
          outline
        />
        <Button
          label="Export to PDF"
          onClick={() => {
            // TODO: Implement PDF export
            alert("PDF export coming soon!");
          }}
          outline
        />
      </div>
    </div>
  );
};

export default ConsolidatedReportPage;
