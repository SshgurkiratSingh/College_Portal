"use client";
import React from "react";
import Button from "../components/Button";
import { SafeUser } from "../types";
import Collapse from "../components/Collapse";
import useProfilePicModal from "../hooks/useProfilePicModal";
import ProfilePicModal from "../components/modals/ProfilePicModal";
import useUpdateBody from "../hooks/useBodyModal";
import BodyUpdateModal from "../components/modals/UpdateBodyDetail";
import BodyInfo from "./bodyInfo";
import { MdAccountBalanceWallet } from "react-icons/md";
import Image from "next/image";
interface ProfileBoxProps {
  currentUser: SafeUser;
}

const ProfileBox: React.FC<ProfileBoxProps> = ({ currentUser }) => {
  const profilePicModal = useProfilePicModal();
  const updateBodyModal = useUpdateBody();
  return (
    <>
      <div className="flex justify-center items-center m-2">
        <ProfilePicModal />
        <BodyUpdateModal currentUser={currentUser} />
        <div>
          <div className="flex  items-center flex-col bg-violet-600/10 rounded-lg w-auto h-auto min-h-16   p-2">
            <div
              className="flex  items-center flex-col bg-violet-700/20 rounded-lg w-auto h-auto min-h-16   p-2"
              style={{ backdropFilter: "10px" }}
            >
              <div className="text-2xl font-extrabold ">
                {" "}
                {currentUser.name}
              </div>
              <div className="  font-semibold text-lg">
                {" "}
                {currentUser.email}
              </div>
              <div className="  font-semibold text-lg">
                Balance: ₹{currentUser.balance}
              </div>

              <div className="avatar">
                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 m-4">
                  <img src={currentUser.image || "/placeholder.png"} />
                </div>
              </div>
              <div className="flex flex-row items-center justify-center p-2 m-2">
                <Button
                  onClick={() => {
                    profilePicModal.onOpen();
                  }}
                  s4
                  label="Update Profile Picture"
                />
                <Button
                  onClick={() => {
                    updateBodyModal.onOpen();
                  }}
                  s4
                  label="Modify age, height, weight, and gender"
                />
              </div>
              <div className="flex flex-row items-center justify-center p-2 m-2">
                {currentUser.DateOfBirth && (
                  <BodyInfo
                    weight={currentUser.weight || 0}
                    height={currentUser.Height || 0}
                    dob={currentUser.DateOfBirth}
                    gender={currentUser.gender || "Not Set"}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileBox;
