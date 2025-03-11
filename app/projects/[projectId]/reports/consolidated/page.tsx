"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Button from "@/app/components/Button";
import Heading from "@/app/components/Heading";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

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

  // Helper function to identify sessional assessments
  const isSessional = (assessmentType: string): boolean => {
    return assessmentType.toLowerCase().includes("sessional");
  };

  // Helper function to calculate the best of sessional marks for a student
  const calculateBestOfSessional = (
    student: any
  ): { score: number; maxMarks: number } => {
    const sessionalAssessments = student.assessments.filter((assessment: any) =>
      isSessional(assessment.projectType)
    );

    if (sessionalAssessments.length === 0) {
      return { score: 0, maxMarks: 0 };
    }

    const sessionalScores = sessionalAssessments.map((assessment: any) => {
      const totalScore = assessment.scores.reduce(
        (sum: number, score: any) => sum + score.score,
        0
      );
      const maxScore = assessment.scores.reduce(
        (sum: number, score: any) => sum + score.maxMarks,
        0
      );

      return {
        score: totalScore,
        maxMarks: maxScore,
        percentage: maxScore > 0 ? totalScore / maxScore : 0,
      };
    });

    // Find the best score based on percentage
    const bestSessional = sessionalScores.reduce(
      (best: any, current: any) =>
        current.percentage > best.percentage ? current : best,
      sessionalScores[0]
    );

    return { score: bestSessional.score, maxMarks: bestSessional.maxMarks };
  };

  // Function to export data to Excel
  const exportToExcel = () => {
    if (!reportData) return;

    // Prepare the data
    const worksheetData = [];

    // Add headers
    const headers = [
      "Roll No",
      "Name",
      ...reportData.assessmentComponents.map((comp) => comp.name),
      "Best of Sessional",
    ];
    worksheetData.push(headers);

    // Add student data
    reportData.studentPerformance.forEach((student) => {
      const bestOfSessional = calculateBestOfSessional(student);
      const bestSessionalText =
        bestOfSessional.maxMarks > 0
          ? `${bestOfSessional.score}/${bestOfSessional.maxMarks} (${(
              (bestOfSessional.score / bestOfSessional.maxMarks) *
              100
            ).toFixed(1)}%)`
          : "N/A";

      const studentRow = [
        student.rollNo,
        student.name,
        ...student.assessments.map((assessment) => {
          const totalScore = assessment.scores.reduce(
            (sum, score) => sum + score.score,
            0
          );
          const maxScore = assessment.scores.reduce(
            (sum, score) => sum + score.maxMarks,
            0
          );
          return `${totalScore}/${maxScore} (${(
            (totalScore / maxScore) *
            100
          ).toFixed(1)}%)`;
        }),
        bestSessionalText,
      ];

      worksheetData.push(studentRow);
    });

    // Create a workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    const colWidths = headers.map(() => ({ wch: 20 }));
    ws["!cols"] = colWidths;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Consolidated Report");

    // Generate Excel file and trigger download
    const fileName = `${reportData.subject.name}_Consolidated_Report.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Function to export data to PDF
  const exportToPDF = () => {
    if (!reportData) return;

    // Create a new PDF document
    const doc = new jsPDF("landscape");

    // Add title
    doc.setFontSize(16);
    doc.text("Consolidated Course Report", 14, 15);

    // Add subject info
    doc.setFontSize(12);
    const subjectText = `${reportData.subject.name} ${
      reportData.subject.code ? `(${reportData.subject.code})` : ""
    }`;
    doc.text(subjectText, 14, 25);

    // Prepare data for the table
    const tableData = reportData.studentPerformance.map((student) => {
      const bestOfSessional = calculateBestOfSessional(student);
      const bestSessionalText =
        bestOfSessional.maxMarks > 0
          ? `${bestOfSessional.score}/${bestOfSessional.maxMarks}\n(${(
              (bestOfSessional.score / bestOfSessional.maxMarks) *
              100
            ).toFixed(1)}%)`
          : "N/A";

      return [
        student.rollNo,
        student.name,
        ...student.assessments.map((assessment) => {
          const totalScore = assessment.scores.reduce(
            (sum, score) => sum + score.score,
            0
          );
          const maxScore = assessment.scores.reduce(
            (sum, score) => sum + score.maxMarks,
            0
          );
          return `${totalScore}/${maxScore}\n(${(
            (totalScore / maxScore) *
            100
          ).toFixed(1)}%)`;
        }),
        bestSessionalText,
      ];
    });

    // Define table headers
    const tableHeaders = [
      "Roll No",
      "Name",
      ...reportData.assessmentComponents.map((comp) => comp.name),
      "Best of Sessional",
    ];

    // Create the table
    (doc as any).autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 30 },
      },
      headStyles: { fillColor: [66, 66, 66] },
      didDrawPage: (data: any) => {
        // Add page number at the bottom
        doc.setFontSize(8);
        doc.text(
          `Page ${data.pageNumber} of ${data.pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      },
    });

    // Generate PDF file and trigger download
    const fileName = `${reportData.subject.name}_Consolidated_Report.pdf`;
    doc.save(fileName);
  };

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-blue-50">
                  Best of Sessional
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.studentPerformance.map((student) => {
                const bestOfSessional = calculateBestOfSessional(student);

                return (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-blue-50">
                      {bestOfSessional.maxMarks > 0 ? (
                        <>
                          {bestOfSessional.score}/{bestOfSessional.maxMarks}
                          <br />
                          <span className="text-xs text-gray-600">
                            (
                            {(
                              (bestOfSessional.score /
                                bestOfSessional.maxMarks) *
                              100
                            ).toFixed(1)}
                            %)
                          </span>
                        </>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div className="mt-8 flex justify-end space-x-4">
        <Button
          label="Export to Excel"
          onClick={() => {
            exportToExcel();
          }}
          outline
        />
        <Button
          label="Export to PDF"
          onClick={() => {
            exportToPDF();
          }}
          outline
        />
      </div>
    </div>
  );
};

export default ConsolidatedReportPage;
