import ClientOnly from "./components/ClientOnly";
import Container from "./components/container";
import getCurrentUser from "./actions/getCurrentUser";
import EmptyState from "./components/EmptyState";
import Heading from "./components/Heading";
import ButtonToPage from "./components/ButtonToPage";
import AuthButtons from "./components/AuthButtons"; // Import the new client component
import { redirect } from "next/navigation";

export default async function Home({ searchParams }: { searchParams: { auth: string } }) {
  const currentUser = await getCurrentUser();
  // Check for auth param to show appropriate messages
  const authRequired = searchParams.auth === "required";

  return (
    <div className="min-h-screen">
      <ClientOnly>
        <Container>
          {/* Hero Section */}
          <div className="py-12 md:py-20">
            <div className="mx-auto text-center mb-12">
              <Heading
                title="Welcome to CurriculumSync"
                subtitle="Your Comprehensive Curriculum Management Solution"
                center
              />
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-8 mt-8">
              {/* Main Content Area */}
              <div className="w-full md:w-7/12 space-y-6">
                <div className="bg-white shadow-md rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {currentUser
                      ? `Welcome back, ${currentUser.name}!`
                      : "Streamline Your Educational Management"}
                  </h2>

                  <p className="text-gray-600 mb-4">
                    CurriculumSync helps educational institutions efficiently
                    manage their curriculum, student records, and academic
                    progress in one centralized platform.
                  </p>

                  {currentUser ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-lg text-gray-800">
                          Student Lists
                        </h3>
                        <p className="text-gray-600 mb-3">
                          Manage your student records and track academic
                          progress
                        </p>
                        <ButtonToPage
                          label="View Student Lists"
                          loc="/student-lists"
                        />
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-lg text-gray-800">
                          Subject Management
                        </h3>
                        <p className="text-gray-600 mb-3">
                          Create and organize subjects within your curriculum
                        </p>
                        <ButtonToPage label="Manage Subjects" loc="/subjects" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-4">
                      {authRequired ? (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
                          <p className="text-yellow-700">
                            <strong>Authentication Required:</strong> You need to login to access that page.
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-600">
                          Sign in to access your curriculum management dashboard!
                        </p>
                      )}
                      <AuthButtons /> {/* Use the client component here */}
                    </div>
                  )}
                </div>

                <div className="bg-white shadow-md rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Features Overview
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border-l-4 border-rose-500 pl-4">
                      <h3 className="font-semibold text-lg">
                        Student Management
                      </h3>
                      <p className="text-gray-600">
                        Efficiently organize and track student information
                      </p>
                    </div>
                    <div className="border-l-4 border-rose-500 pl-4">
                      <h3 className="font-semibold text-lg">
                        Curriculum Planning
                      </h3>
                      <p className="text-gray-600">
                        Create and manage your educational curriculum
                      </p>
                    </div>
                    <div className="border-l-4 border-rose-500 pl-4">
                      <h3 className="font-semibold text-lg">
                        Subject Organization
                      </h3>
                      <p className="text-gray-600">
                        Structure subjects with clear learning objectives
                      </p>
                    </div>
                    <div className="border-l-4 border-rose-500 pl-4">
                      <h3 className="font-semibold text-lg">
                        Progress Tracking
                      </h3>
                      <p className="text-gray-600">
                        Monitor educational outcomes and performance
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="w-full md:w-4/12 space-y-6">
                {currentUser ? (
                  <>
                    <div className="bg-white shadow-md rounded-lg p-6">
                      <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Quick Actions
                      </h2>
                      <div className="space-y-3">
                        <ButtonToPage label="View Profile" loc="/Profile" />
                        <ButtonToPage
                          label="Student Lists"
                          loc="/student-lists"
                        />
                        <ButtonToPage label="Manage Subjects" loc="/subjects" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Why CurriculumSync?
                    </h2>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start">
                        <svg
                          className="h-5 w-5 text-rose-500 mr-2 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        Streamlined curriculum management
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="h-5 w-5 text-rose-500 mr-2 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        Efficient student record organization
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="h-5 w-5 text-rose-500 mr-2 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        Comprehensive progress tracking tools
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="h-5 w-5 text-rose-500 mr-2 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        Intuitive and user-friendly interface
                      </li>
                    </ul>
                  </div>
                )}

                <div className="bg-white shadow-md rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Latest Updates
                  </h2>
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-3">
                      <h3 className="font-medium text-gray-800">VHS Survey</h3>
                      <p className="text-sm text-gray-600">
                        VHS students are found to be 96% autism positive.
                      </p>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <h3 className="font-medium text-gray-800">Gay Survey</h3>
                      <p className="text-sm text-gray-600">
                        Gay likes tattoos on their body .
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        JAI is conirmed Autistic
                      </h3>
                      <p className="text-sm text-gray-600">
                        MCO23566 is found to be autistic{" "}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </ClientOnly>
    </div>
  );
}
export const dynamic = "force-dynamic";
