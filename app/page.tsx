import Image from "next/image";
import ClientOnly from "./components/ClientOnly";
import Container from "./components/container";
import getItems, { ItemParams } from "@/app/actions/getItems";
import ItemCard from "./components/ListingCard";
import getCurrentUser from "./actions/getCurrentUser";
import { categories } from "./components/Categories/Categories";
import EmptyState from "./components/EmptyState";
interface HomeProps {
  searchParams: ItemParams;
}

export default async function Home({ searchParams }: HomeProps) {
  const Items = await getItems(searchParams);

  const currentUser = await getCurrentUser();
  return (
    <div className="text-rose-500 text-2xl">
      <ClientOnly>
        <Container>
          <div className="flex flex-col items-center justify-between">
            <div
              className="
         grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4  justify-evenly

          "
            >
              {/* if item is empty then render empty component */}
              {Items.length === 0 && <EmptyState showReset />}
              {Items.map((item) => {
                return (
                  <ItemCard
                    key={item.id}
                    data={item}
                    currentUser={currentUser}
                  />
                );
              })}
            </div>
          </div>
        </Container>
      </ClientOnly>
    </div>
  );
}
export const dynamic = "force-dynamic";
