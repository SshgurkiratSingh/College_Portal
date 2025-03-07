"use client";
import useNotificationModal from "@/app/hooks/useNotificationModal";
import { useRouter } from "next/navigation";
import ModalForNotification from "./ModalForNotification";
import { SafeUser } from "@/app/types";
import useLoginModal from "@/app/hooks/useLoginModal";
import { toast } from "react-hot-toast";
import { useEffect } from "react";
interface NotificationModalProps {
  currentUser?: SafeUser | null;
}
const NotificationModal: React.FC<NotificationModalProps> = ({
  currentUser,
}) => {
  const NotificationModal = useNotificationModal();
  const loginModal = useLoginModal();
  const router = useRouter();
  // useEffect(() => {
  //   if (!currentUser) {
  //     NotificationModal.incrementTotalAlert();
  //   } else {
  //     if (!currentUser?.image) {
  //       NotificationModal.incrementTotalAlert();
  //     }
  //     if (
  //       !currentUser?.DateOfBirth ||
  //       !currentUser?.Height ||
  //       !currentUser?.gender ||
  //       !currentUser?.weight
  //     ) {
  //       NotificationModal.incrementTotalAlert();
  //     }
  //     if (currentUser?.balance < 20) {
  //       NotificationModal.incrementTotalAlert();
  //     }
  //   }
  // }, [currentUser]);

  let bodyContent = (
    <div className="flex flex-col justify-center items-center m-3">
      {!currentUser && (
        <div className="alert">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-info shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>Please Login to get the best of our site</span>
          <div>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                NotificationModal.onClose();
                loginModal.onOpen();
              }}
            >
              Login
            </button>
          </div>
        </div>
      )}
      {currentUser && !currentUser?.image && (
        <div className="alert">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-info shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>You don&#39;t have a profile photo. Please update it now.</span>

          <div>
            <button
              className="btn btn-sm"
              onClick={() => {
                toast.error("No,you cannot dismiss this notification");
              }}
            >
              Dismiss
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                router.push("/Profile");
              }}
            >
              Update it now
            </button>
          </div>
        </div>
      )}
      {currentUser &&
        (!currentUser?.DateOfBirth ||
          !currentUser.Height ||
          !currentUser.gender ||
          !currentUser.weight) && (
          <div className="alert">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-info shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>
              You have some pending profile details. Please update them now.
            </span>
            <div>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  router.push("/Profile");
                }}
              >
                Go to Profile
              </button>
            </div>
          </div>
        )}
    </div>
  );
  const footerContent = (
    <div className="flex flex-row justify-center items-center">
      {currentUser && currentUser.balance < 20 && (
        <>
          <div className="alert">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-info shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Your account balance is running low.</span>
          </div>
        </>
      )}
    </div>
  );
  return (
    <ModalForNotification
      title="Notification"
      body={bodyContent}
      onClose={NotificationModal.onClose}
      isOpen={NotificationModal.isOpen}
      footer={footerContent}
    />
  );
};
export default NotificationModal;
