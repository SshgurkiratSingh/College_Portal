import prisma from "@/app/libs/prismadb";

interface IParams {
  userId: string;
}
export default async function getPurchase(params: IParams) {
    try {
      const { userId } = params;
      console.log(userId);
      const data = await prisma.purchaseHistory.findMany({
        where: {
            userId: userId,
        },
        include:{
            item:true
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
  