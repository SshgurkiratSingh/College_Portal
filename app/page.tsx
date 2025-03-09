import ClientOnly from "./components/ClientOnly";
import Container from "./components/container";
import getCurrentUser from "./actions/getCurrentUser";
import EmptyState from "./components/EmptyState";
import Heading from "./components/Heading";
import ButtonToPage from "./components/ButtonToPage";
import AuthButtons from "./components/AuthButtons";
import { redirect } from "next/navigation";

export default async function Home({ searchParams }: { searchParams: { auth: string } }) {
  const currentUser = await getCurrentUser();
  const authRequired = searchParams.auth === "required";

  return (
    <div className="min-h-screen bg-black-50">
      <ClientOnly>
        <Container>
          {/* Hero Section */}
          <div className="py-16 md:py-24">
            <div className="mx-auto text-center mb-16 max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Curriculum Management Reimagined
              </h1>
              <p className="text-xl text-gray-600 mt-4">
                Streamline academic planning with our integrated education management platform
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 mt-12">
              {/* Main Content */}
              <div className="flex-1 space-y-8">
                {/* Auth Status Card */}
                {authRequired && (
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-blue-800 font-medium">
                        Authentication required to access this feature
                      </p>
                    </div>
                  </div>
                )}

                {/* Dashboard Cards */}
                {currentUser ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Student Management Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                      <div className="flex items-center mb-4">
                        <div className="bg-blue-100 p-3 rounded-lg mr-4">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Student Management</h3>
                      </div>
                      <p className="text-gray-600 mb-6">Manage student records and track academic progress</p>
                      <ButtonToPage 
                        label="View Student Lists"
                        loc="/student-lists"
                      />
                    </div>

                    {/* Subject Management Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                      <div className="flex items-center mb-4">
                        <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Subject Management</h3>
                      </div>
                      <p className="text-gray-600 mb-6">Organize and structure your academic curriculum</p>
                      <ButtonToPage 
                        label="Manage Subjects" 
                        loc="/subjects"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Started Today</h2>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Join educational institutions worldwide using CurriculumSync to transform their academic management
                    </p>
                    <AuthButtons />
                  </div>
                )}

                {/* Features Grid */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Core Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { 
                        title: "Curriculum Planning", 
                        description: "Create structured academic programs with clear learning objectives",
                        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      },
                      { 
                        title: "Progress Analytics", 
                        description: "Track student performance with real-time dashboards",
                        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      },
                      { 
                        title: "Outcome Mapping", 
                        description: "Align course outcomes with program objectives",
                        icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      },
                      { 
                        title: "Collaboration Tools", 
                        description: "Work seamlessly with faculty and staff",
                        icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      }
                    ].map((feature, index) => (
                      <div key={index} className="flex items-start p-4 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="bg-blue-100 p-2 rounded-lg mr-4 flex-shrink-0">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon} />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h3>
                          <p className="text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:w-96 space-y-8">
                {!currentUser && (
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
                    <div className="space-y-4">
                      {[
                        "Secure cloud-based platform",
                        "Real-time collaboration tools",
                        "Compliance with education standards",
                        "Dedicated support team",
                        "Regular feature updates",
                        "Data-driven insights"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start">
                          <svg className="flex-shrink-0 w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Updates Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">System Updates</h2>
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex items-start">
                        <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full mr-3">
                          New
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Enhanced Reporting</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            New analytics dashboard with export capabilities
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3">
                          Improved
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Security Updates</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Latest security patches and encryption improvements
                          </p>
                        </div>
                      </div>
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