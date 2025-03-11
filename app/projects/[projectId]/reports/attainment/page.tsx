"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Button from "@/app/components/Button";
import Heading from "@/app/components/Heading";
import AttainmentChart from "@/app/components/charts/AttainmentChart";
import DistributionChart from "@/app/components/charts/DistributionChart";
import PerformanceChart from "@/app/components/charts/PerformanceChart";

interface COAttainment {
  coCode: string;
  targetLevel: number;
  actualLevel: number;
  studentDistribution: {
    level0: number;
    level1: number;
    level2: number;
    level3: number;
  };
  assessmentComponents: {
    name: string;
    type: string;
    averageScore: number;
    maxScore: number;
  }[];
}

interface AttainmentReport {
  subjectCode: string;
  subjectName: string;
  attainmentData: COAttainment[];
}

const AttainmentReportPage = ({
  params,
}: {
  params: { projectId: string };
}) => {
  const router = useRouter();
  const [reportData, setReportData] = useState<AttainmentReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await axios.get(
          `/api/projects/${params.projectId}/reports/attainment`
        );
        setReportData(response.data);
      } catch (error) {
        console.error("Error fetching attainment report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [params.projectId]);

  if (loading) {
    return <div>Loading attainment report data...</div>;
  }

  if (!reportData) {
    return <div>No attainment report data available</div>;
  }

  return (
    <div className="max-w-7xl text-gray-800 mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push(`/projects/${params.projectId}/reports`)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md mr-4"
        >
          &larr; Back to Reports
        </button>
        <Heading
          title="CO Attainment Report"
          subtitle={`${reportData.subjectName} ${
            reportData.subjectCode ? `(${reportData.subjectCode})` : ""
          }`}
        />
      </div>

      {/* Attainment Overview Chart */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium mb-4">
          Course Outcome Attainment Overview
        </h3>
        <AttainmentChart data={reportData.attainmentData} />
      </div>

      {/* CO Attainment Summary */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium mb-4">
          Course Outcome Attainment Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  CO Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Target Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actual Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student Distribution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.attainmentData.map((co) => (
                <tr key={co.coCode} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {co.coCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    L{co.targetLevel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    L{co.actualLevel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">
                        L0: {co.studentDistribution.level0}
                      </span>
                      <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                        L1: {co.studentDistribution.level1}
                      </span>
                      <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                        L2: {co.studentDistribution.level2}
                      </span>
                      <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                        L3: {co.studentDistribution.level3}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        co.actualLevel >= co.targetLevel
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {co.actualLevel >= co.targetLevel
                        ? "Achieved"
                        : "Not Achieved"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {reportData.attainmentData.map((co) => (
          <div
            key={`dist-${co.coCode}`}
            className="bg-white shadow-md rounded-lg p-6"
          >
            <DistributionChart
              distribution={co.studentDistribution}
              coCode={co.coCode}
            />
          </div>
        ))}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {reportData.attainmentData.map((co) => (
          <div
            key={`perf-${co.coCode}`}
            className="bg-white shadow-md rounded-lg p-6"
          >
            <PerformanceChart
              assessments={co.assessmentComponents}
              coCode={co.coCode}
            />
          </div>
        ))}
      </div>

      {/* Assessment Components */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium mb-4">
          Assessment Component Details
        </h3>
        {reportData.attainmentData.map((co) => (
          <div key={co.coCode} className="mb-8 last:mb-0">
            <h4 className="text-md font-medium mb-3">
              {co.coCode} Assessment Components
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Assessment Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Average Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Max Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Achievement %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {co.assessmentComponents.map((component, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {component.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {component.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {component.averageScore.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {component.maxScore}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(
                          (component.averageScore / component.maxScore) *
                          100
                        ).toFixed(1)}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
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

export default AttainmentReportPage;
