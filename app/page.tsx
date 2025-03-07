import Image from "next/image";
import ClientOnly from "./components/ClientOnly";
import Container from "./components/container";
import getCurrentUser from "./actions/getCurrentUser";
import EmptyState from "./components/EmptyState";

export default async function Home() {
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
              <div className="flex flex-col flex-1">
                <div className="flex w-52 flex-col gap-4">
                  <div className="skeleton h-32 w-full"></div>
                  <div className="skeleton h-4 w-28"></div>
                  <div className="skeleton h-4 w-full"></div>
                  <div className="skeleton h-4 w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </ClientOnly>
    </div>
  );
}
export const dynamic = "force-dynamic";
