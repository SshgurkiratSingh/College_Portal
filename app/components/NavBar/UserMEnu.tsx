import { useState } from "react";
import { signOut } from "next-auth/react";
import { SafeUser } from "@/app/types";
import MenuItem from "./MenuItem";
import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import Avatar from "../Avatar";
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
import { BiHome } from "react-icons/bi";
interface UserMenuProps {
  currentUser?: SafeUser | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const router = useRouter();
  const addModal = useAddModal();
  const toggleOpen = () => setIsOpen(!isOpen);
  if (currentUser?.email === "guri2022@hotmail.com") {
    return (
      <div className="dropdown dropdown-end">
        <button
          onClick={toggleOpen}
          className="btn btn-ghost btn-circle avatar"
        >
          <div className="w-10 rounded-full">
            <Avatar
              src={currentUser?.image}
              alt={currentUser?.name || "User avatar"}
            />
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
        <div className="indicator">
          <span className="indicator-item badge badge-secondary">
            Rs. {currentUser?.balance}
          </span>
        </div>
        <button
          onClick={toggleOpen}
          className="btn btn-ghost btn-circle avatar"
        >
          {" "}
          <div className="w-10 rounded-full">
            <Avatar
              src={currentUser?.image}
              alt={currentUser?.name || "User avatar"}
            />
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
                  Hi,{currentUser.name}
                </li>
                <MenuItem
                  label="Home"
                  onClick={() => router.push("/")}
                  icon={<BiHome />}
                />
                <MenuItem
                  label="Profile "
                  onClick={() => {
                    router.push("/Profile");
                  }}
                  icon={<TiUser />}
                />
                <MenuItem
                  label="Purchase History"
                  onClick={() => {
                    router.push("/purchase-history");
                  }}
                  icon={<MdHistory />}
                />
                <MenuItem
                  label="Favourite"
                  onClick={() => {
                    router.push("/favourite");
                  }}
                  icon={<MdOutlineFavoriteBorder />}
                />
                <MenuItem
                  label="Fitness Record"
                  onClick={() => {
                    router.push("/Fitness-detail");
                  }}
                  icon={<IoFitnessSharp />}
                />
                <MenuItem
                  label="Add Money"
                  onClick={() => {
                    router.push("/addMoney");
                  }}
                  icon={<PiMoneyBold />}
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
