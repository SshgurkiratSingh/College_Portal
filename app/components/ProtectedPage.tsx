"use client";

import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import AuthButtons from "./AuthButtons";

interface ProtectedPageProps {
  children: ReactNode;
}

const ProtectedPage: React.FC<ProtectedPageProps> = ({ children }) => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">
          You need to be logged in to access this page. Please login or register.
        </p>
        <AuthButtons />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedPage;