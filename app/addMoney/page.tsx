import getCurrentUser from "../actions/getCurrentUser";
import ClientOnly from "../components/ClientOnly";
import EmptyState from "../components/EmptyState";
import AddMoney from "./addMoneyPage";

const AddMoneyPage = async () => {
  const currentUser = await getCurrentUser();
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
  return (
    <div className="flex flex-col justify-center align-middle items-center">
      <h1
        className="text-xl
       font-bold
       text-center
       text-violet-500
       mb-4
       mt-4
       sm:text-2xl
       lg:text-3xl
       xl:text-4xl
       2xl:text-5xl
       "
      >
        Please enter the code you got or buy it from administration
      </h1>
      <AddMoney />
    </div>
  );
};

export default AddMoneyPage;
export const dynamic = "force-dynamic";
