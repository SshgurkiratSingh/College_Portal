"use client";
import React, { use } from "react";
import { Subject, User } from "@prisma/client";
import Container from "../container";
import Lgog from "./Logo";
import UserMenu from "./UserMEnu";
import { SafeUser } from "@/app/types";
import { useRouter } from "next/navigation";
import Collapse from "../Collapse";
import { BiBox, BiNotification } from "react-icons/bi";
import { IoAlert } from "react-icons/io5";
import useNotificationModal from "@/app/hooks/useNotificationModal";
import StudentListModal from "../modals/StudentListModal";
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
  const notifcationModal = useNotificationModal();
  const handleClick = () => {
    notifcationModal.onOpen();
  };
  return (
    <>
      <Container>
        <div className="navbar bg-transparent w-full ">
          {" "}
          <div className="flex-1">
            <div className="btn btn-ghost normal-case ">
              <Lgog />
            </div>
          </div>
          <div className="flex flex-1 justify-between items-center m-2">
            <div className="flex-grow"></div>

            <div className="flex-grow flex justify-center gap-4">
              {/* Student Lists button moved to UserMenu */}
            </div>
            <div></div>
            <UserMenu currentUser={currentUser} />
          </div>
        </div>
      </Container>
      <StudentListModal />
    </>
  );
};

export default Navbar;
