"use client";

import { ReactNode } from "react";
import useRequireAuth from "@/app/hooks/useRequireAuth";
import LoginModal from "./modals/LoginModal";

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">
          Please log in to access this page
        </h2>
        <p className="text-gray-600 mb-6">
          You need to be authenticated to view this content
        </p>
        <LoginModal />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
