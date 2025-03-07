import getCurrentUser from "../actions/getCurrentUser";
import getFavById from "../actions/getFavByUserid";
import ButtonToPage from "../components/ButtonToPage";
import ClientOnly from "../components/ClientOnly";
import EmptyState from "../components/EmptyState";
import Heading from "../components/Heading";
import ItemCardByFav from "../components/ListingCardForFav";

const favourite = async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState title="Please Login" subtitle="Login to see this page" />
      </ClientOnly>
    );
  }
  const fav = await getFavById();
  if (fav.length === 0) {
    return (
      <ClientOnly>
        <div className="flex flex-col items-center align-middle justify-center">
          {" "}
          <EmptyState title="No favorite yet" subtitle="Try adding some" />
          <ButtonToPage label="Go to Home" loc="/" />
        </div>
      </ClientOnly>
    );
  }
  return (
    <ClientOnly>
      <div>
        <div className="mt-4 flex flex-col items-center align-middle justify-center content-center center">
          <Heading
            center
            title="Favourite Page"
            subtitle="Find Your Favourite all in one place"
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 ">
            {fav.map((item) => (
              <ItemCardByFav
                key={item.id}
                data={item}
                currentUser={currentUser}
              />
            ))}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
};

export default favourite;
export const dynamic = 'force-dynamic'