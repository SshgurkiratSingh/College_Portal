import prisma from "@/app/libs/prismadb";
import { PurchaseHistory } from "@prisma/client";

interface IParams {
  userId?: string;
  itemId?: string;
}
export default async function getHistoryById(params: IParams) {
    try {
      const { userId ,itemId} = params;
      if (!userId || !itemId) return null;
   
      const data = await prisma.purchaseHistory.findMany({
        where: {
            userId: userId
        }
      });
      const aaa = data.filter((item:PurchaseHistory) => item.itemId === itemId)
  console.log(data)
      if (!aaa) {
        return null;
      }
  
      return aaa;
    } catch (error) {
      console.error("Error in getItemById:", error);
      throw new Error("An error occurred while fetching the item: " + error);
    }
  }
  