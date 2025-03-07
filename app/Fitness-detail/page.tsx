import getCurrentUser from "../actions/getCurrentUser";
import Button from "../components/Button";

import ButtonToPage from "../components/ButtonToPage";
import ClientOnly from "../components/ClientOnly";
import EmptyState from "../components/EmptyState";
import BodyUpdateModal from "../components/modals/UpdateBodyDetail";
import useUpdateBody from "../hooks/useBodyModal";
import LastUpdated from "./lastUpdated";

const FitnessDeatil = async () => {
  const currentUser = await getCurrentUser();

  // const router = useRouter();
  if (!currentUser) {
    return (
      <ClientOnly>
        <div>
          <EmptyState
            title="You are not logged in"
            subtitle="Please Login to continue"
          />
        </div>
      </ClientOnly>
    );
  }
  // if user doesnt have height weight age gender then redirect to profile page
  if (
    !currentUser.Height ||
    !currentUser.weight ||
    !currentUser.DateOfBirth ||
    !currentUser.gender
  ) {
    return (
      <ClientOnly>
        <div className="flex flex-col items-center align-middle justify-center scroll-auto">
          <EmptyState
            title="Please complete your profile"
            subtitle="Please complete your profile to continue"
          />
          <ButtonToPage label="Go to Profile" loc="/Profile" />
        </div>
      </ClientOnly>
    );
  }
  const UserBmi =
    (currentUser.weight * 10000) / (currentUser.Height * currentUser.Height);
  return (
    <ClientOnly>
      <div className="flex flex-col items-center align-middle justify-center">
        <div className="flex text-3xl font-bold text-center flex-col">
          <span className="animText">Hi, {currentUser.name}</span>
          <div className="animText">Welcome to Fitness Detail Page</div>
          {/* BMI of user */}
          <div className="">Your BMI:{UserBmi.toPrecision(3)}</div>
          {currentUser.lastUpdated && (
            <LastUpdated lastUpdated={currentUser.lastUpdated} />
          )}
          <center>
            <div className="flex items-center ">
              <ButtonToPage label="Update it" loc="/Profile" />
            </div>
          </center>
        </div>
      </div>
    </ClientOnly>
  );
};
export default FitnessDeatil;
export const dynamic = "force-dynamic";
