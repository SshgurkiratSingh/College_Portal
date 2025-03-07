import getCurrentUser from "@/app/actions/getCurrentUser";
import getItemById from "@/app/actions/getIembyId";
import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";

import ImageMenu from "@/app/components/ImageMenu";
import TitleForList from "@/app/components/TitleForItem";
import DescriptionLi from "../DescriptionLi";
import HistoryPageById from "./HistoryPageC";
import getHistoryById from "@/app/actions/getHistoryByUserAndItem";
import { useState } from "react";
import NutritionData from "./nutrientChart";

interface IParams {
  itemId: string;
}
const ItemPage = async ({ params }: { params: IParams }) => {
  if (!params)
    return (
      <EmptyState
        showReset
        title="There is no item such that"
        subtitle="You can still go home if you want "
      />
    );
  const currentUser = await getCurrentUser();
  const itemDetail = await getItemById(params);
  let history = null;
  if (currentUser && itemDetail) {
    history = await getHistoryById({
      userId: currentUser?.id,
      itemId: itemDetail?.id,
    });
  }

  return (
    <ClientOnly>
      <div className="flex flex-col justify-center items-center  backGrad">
        <TitleForList
          title={itemDetail?.title}
          listingId={itemDetail?.id}
          currentUser={currentUser}
        />
        <div style={{ maxWidth: "400px", maxHeight: "400px" }}>
          <ImageMenu
            image1={itemDetail?.imageSrc1}
            image2={itemDetail?.imageSrc2}
          />
        </div>
        <br />
        <DescriptionLi description={itemDetail?.description} />

        <NutritionData title={itemDetail?.title} />
        {history && <HistoryPageById data={history[history.length - 1]} />}
      </div>
    </ClientOnly>
  );
};
export default ItemPage;
export const dynamic = 'force-dynamic'