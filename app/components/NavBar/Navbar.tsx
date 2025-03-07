"use client";
import React, { use } from "react";
import { User } from "@prisma/client";
import Container from "../container";
import Lgog from "./Logo";
import UserMenu from "./UserMEnu";
import { SafeUser } from "@/app/types";
import { useRouter } from "next/navigation";
import Categories from "../Categories/Categories";
import Collapse from "../Collapse";
import { BiBox, BiNotification } from "react-icons/bi";
import { IoAlert } from "react-icons/io5";
import useNotificationModal from "@/app/hooks/useNotificationModal";
interface NavBarProps {
  currentUser?: SafeUser | null;
  totalAlerts?: number;
}
const Navbar: React.FC<NavBarProps> = ({ currentUser, totalAlerts }) => {
  const router = useRouter();
  const notifcationModal = useNotificationModal();
  const handleClick = () => {
    notifcationModal.onOpen();
  };
  return (
    <>
      <Container>
        <div className="navbar bg-base-100 w-full">
          {" "}
          <div className="flex-1">
            <div className="btn btn-ghost normal-case ">
              <Lgog />
            </div>
          </div>
          <div className="flex flex-1 justify-between items-center m-2">
            <div className="flex-grow"></div>

            <div className="flex-grow"></div>
            <div>
              <div
                className="w-10 h-10 rounded-full border-2 flex align-middle justify-center items-center hover:border-blue-600 transition"
                onClick={handleClick}
              >
                <BiNotification />
                <div className="absolute top-14   bg-red-600 rounded-full w-4 h-4 text-xs text-white flex justify-center items-center">
                  1
                </div>
              </div>
            </div>
            <div className="w-8"></div>
            <UserMenu currentUser={currentUser} />
          </div>
        </div>
      </Container>

      <Categories />
    </>
  );
};

export default Navbar;
