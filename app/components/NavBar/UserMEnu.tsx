import { useState } from "react";
import { signOut } from "next-auth/react";
import { SafeUser } from "@/app/types";
import MenuItem from "./MenuItem";
import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useStudentListModal from "@/app/hooks/useStudentListModal";
import { TiUser } from "react-icons/ti";
import { AiOutlineLogout } from "react-icons/ai";
import { MdOutlineFavoriteBorder, MdHistory } from "react-icons/md";
import { IoIosLogIn } from "react-icons/io";
import { GrUserNew } from "react-icons/gr";
import { PiSignInLight } from "react-icons/pi";
import { IoFitnessSharp } from "react-icons/io5";
import { BsPlus } from "react-icons/bs";
import { PiMoneyBold } from "react-icons/pi";
import useAddModal from "@/app/hooks/useAddModal";
import { useRouter } from "next/navigation";
import { BiHome, BiBox } from "react-icons/bi";
import useSubjectModal, { SubjectModalMode } from "@/app/hooks/useSubjectModal";

interface UserMenuProps {
  currentUser?: SafeUser | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const studentListModal = useStudentListModal();
  const router = useRouter();
  const AddSubjectModal = useSubjectModal();
  const addModal = useAddModal();
  const toggleOpen = () => setIsOpen(!isOpen);

  // Get the first letter of the username
  const userInitial = currentUser?.name?.charAt(0).toUpperCase() || "";

  if (currentUser?.email === "guri2022@hotmail.com") {
    return (
      <div className="dropdown dropdown-end">
        <button
          onClick={toggleOpen}
          className="btn btn-ghost btn-circle avatar"
        >
          <div className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full">
            <span className="text-lg font-semibold flex items-center justify-center w-full h-full">
              {userInitial}
            </span>
          </div>
        </button>
        {isOpen && (
          <>
            {currentUser.email === "guri2022@hotmail.com" ? (
              <ul
                tabIndex={0}
                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
              >
                <li className="text-center text-primary text-xl">
                  Welcome To Admin Portal
                </li>
                <MenuItem
                  label="Add New"
                  onClick={addModal.onOpen}
                  icon={<BsPlus />}
                />
                <MenuItem
                  label="Logout"
                  onClick={() => {
                    signOut({
                      redirect: false,
                      callbackUrl:
                        '"https://main.d1emtjc4kvp6hm.amplifyapp.com/"',
                    });
                  }}
                  icon={<AiOutlineLogout />}
                />
              </ul>
            ) : (
              <div>You need to be admin to see this</div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-row ml-2">
      <div className="dropdown dropdown-end">
        <button
          onClick={toggleOpen}
          className="btn btn-ghost btn-circle avatar"
        >
          <div className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full">
            <span className="text-lg font-semibold flex items-center justify-center w-full h-full">
              {userInitial}
            </span>
          </div>
        </button>
        {isOpen && (
          <>
            {currentUser ? (
              <ul
                tabIndex={0}
                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
              >
                <li className="text-center text-red-300 text-xl">
                  Hi, {currentUser.name}
                </li>
                <MenuItem
                  label="Home"
                  onClick={() => router.push("/")}
                  icon={<BiHome />}
                />
                <MenuItem
                  label="Student Lists"
                  onClick={() => {
                    router.push("/student-lists");
                  }}
                  icon={<BiBox />}
                />
                <MenuItem
                  label="Subjects List"
                  onClick={() => {
                    router.push("/subjects");
                  }}
                  icon={<MdOutlineFavoriteBorder />}
                />{" "}
                <MenuItem
                  label="Create Project"
                  onClick={() => {
                    router.push("/projects");
                  }}
                  icon={<BsPlus />}
                />
                <MenuItem
                  label="Students Marks"
                  onClick={() => {
                    router.push("/students/marks");
                  }}
                  icon={<MdHistory />}
                />
                <MenuItem
                  label="Students "
                  onClick={() => {
                    router.push("/students/");
                  }}
                  icon={<MdHistory />}
                />
                <MenuItem
                  label="Logout"
                  onClick={signOut}
                  icon={<AiOutlineLogout />}
                />
              </ul>
            ) : (
              <ul
                tabIndex={0}
                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
              >
                <MenuItem
                  label="Login"
                  onClick={loginModal.onOpen}
                  icon={<PiSignInLight />}
                />
                <MenuItem
                  label="Sign Up"
                  onClick={registerModal.onOpen}
                  icon={<GrUserNew />}
                />
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserMenu;
