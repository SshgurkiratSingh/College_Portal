
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";



export default async function getFavById() {
const user=await getCurrentUser();


  if (!user) {
    throw new Error('User not found');
  }

  // Now we have the user's favoriteIds, we can find all items with these IDs
  const favoriteItems = await prisma.item.findMany({
    where: {
      id: {
        in: user.favoriteIds,  // Use the 'in' operator to find items with an ID in the favoriteIds array
      },
    },
  });

return favoriteItems;
}