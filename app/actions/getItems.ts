import prismadb from "../libs/prismadb"
export interface ItemParams{
    category?: string,
}
export default async function getItems(params: ItemParams) {
  let query:any = {}
  const category = params?.category;
  try {
    if (category) {
        query.category = category;
    }
    const items = await prismadb.item.findMany({where:query,
        orderBy:{createdAt:'desc'}})
    return items
  }
  catch (e: any) {
    throw new Error(e)
  }
}