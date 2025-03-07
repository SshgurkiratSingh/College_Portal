import Image from "next/image";
import ClientOnly from "../components/ClientOnly";
import Container from "../components/container";
import EmptyState from "../components/EmptyState";
import getCurrentUser from "../actions/getCurrentUser";
import getPurchase from "../actions/getPurchaseHistory";
import HistoryElement from "./historyelement";
import ButtonToPage from "../components/ButtonToPage";

export default async function Home() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return (
      <div className="text-rose-500 text-2xl">
        <ClientOnly>
          <Container>
            <EmptyState
              title="Please Login"
              subtitle="Login to continue"
              showReset
            />
          </Container>
        </ClientOnly>
      </div>
    );
  }
  const history = await getPurchase({ userId: currentUser?.id });
  console.log(history);
  if (history?.length == 0) {
    return (
      <div className="text-rose-500 text-2xl">
        <ClientOnly>
          <Container>
            {" "}
            <div className="flex flex-col items-center align-middle justify-center">
              <EmptyState
                title="Nothing Found😔"
                subtitle="Try Purchasing Something until then see the available products"
              />
              <ButtonToPage label="Go to Home" loc="/" />
            </div>
          </Container>
        </ClientOnly>
      </div>
    );
  }
  return (
    <div className=" text-2xl">
      <ClientOnly>
        <Container>
          <div className="overflow-x-auto">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th></th>
                  <th>Item</th>
                  <th>Item Name</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Total Price Charged</th>
                </tr>
              </thead>
              <tbody>
                {history?.reverse().map((item, sno) => (
                  <HistoryElement history={item} sno={sno + 1} key={sno} />
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </ClientOnly>
    </div>
  );
}
export const dynamic = "force-dynamic";
