"use client";
import React from "react";
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

/**
 * The navigation bar component. It will display the logo, the profile menu (if user is logged in) and the notification icon.
 *
 * @param {NavBarProps} props - The props for the component.
 * @param {SafeUser | undefined} props.currentUser - The current user. If not provided, the navbar will only show the logo.
 * @param {number | undefined} props.totalAlerts - The total number of alerts. If not provided, the notification icon will not be shown.
 * @returns {React.ReactElement} - The JSX element for the navbar.
 */
const Navbar: React.FC<NavBarProps> = ({ currentUser, totalAlerts }) => {
  const router = useRouter();

  // Get the first letter of the user's name
  const userInitial = currentUser?.name?.charAt(0).toUpperCase() || "";

  return (
    <>
      <Container>
        <div className="navbar bg-transparent w-full">
          <div className="flex-1">
            <div className="btn btn-ghost normal-case">
              <Lgog />
            </div>
          </div>
          <div className="flex flex-1 justify-between items-center m-2">
            <div className="flex-grow"></div>

            <div className="flex-grow flex justify-center gap-4">
              {/* Additional buttons or links can go here */}
            </div>

            <div className="flex items-center gap-4">
              {/* Refresh Button */}
              <button
                onClick={() => window.location.reload()}
                className="btn btn-ghost btn-circle"
                title="Refresh Page"
              >
                <BiRefresh size={24} />
              </button>

             

              {/* User Menu */}
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