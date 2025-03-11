"use client";
import React from "react";
import apiClient from "@/app/utils/apiClient"; // Correct import
import Container from "../container";
import Lgog from "./Logo";
import UserMenu from "./UserMEnu";
import { SafeUser } from "@/app/types";
import { useRouter } from "next/navigation";
import { BiRefresh } from "react-icons/bi";
import StudentListModal from "../modals/StudentListModal";
import AddSubjectModal from "../modals/AddSubjectModal";

interface NavBarProps {
  currentUser?: SafeUser | null;
  totalAlerts?: number;
}

const Navbar: React.FC<NavBarProps> = ({ currentUser, totalAlerts }) => {
  const router = useRouter();
  const userInitial = currentUser?.name?.charAt(0).toUpperCase() || "";

  return (
    <>
      <Container>
        <div className="navbar bg-transparent w-full pt-6">
          <div className="flex-1">
            <div className="btn btn-ghost normal-case">
              <Lgog />
            </div>
          </div>
          <div className="flex flex-1 justify-between items-center m-2">
            <div className="flex-grow"></div>
            <div className="flex-grow flex justify-center gap-4"></div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  window.location.reload();
                  apiClient.clearCache();
                }}
                className="btn btn-ghost btn-circle"
                title="Refresh Page"
              >
                <BiRefresh size={24} />
              </button>
              <UserMenu currentUser={currentUser} />
            </div>
          </div>
        </div>
      </Container>
      <StudentListModal />
      <AddSubjectModal />
    </>
  );
};

export default Navbar;
