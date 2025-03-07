import prisma from "@/app/libs/prismadb";

interface IParams {
  itemId: string;
}

export default async function getItemById(params: IParams) {
  try {
    const { itemId } = params;
    const data = await prisma.item.findUnique({
      where: {
        id: itemId,
      }
    });

    if (!data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getItemById:", error);
    throw new Error("An error occurred while fetching the item: " + error);
  }
}
