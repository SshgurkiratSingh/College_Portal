"use client";

import { Item } from "@prisma/client";
import { SafeUser } from "../types";
import Image from "next/image";

import { useRouter } from "next/navigation";
import Button from "./Button";
import { toast } from "react-hot-toast";
import HeartButton from "./HeartButton";
import { categories } from "./Categories/Categories";
interface ItemCardProps {
  data: Item;
  currentUser?: SafeUser | null;
  disabled?: boolean;
}
const ItemCard: React.FC<ItemCardProps> = ({ data, currentUser, disabled }) => {
  const router = useRouter();
  const LastOrder = null;
  const handleItemClick = () => {
    router.push(`/item/${data.id}`);
  };
  // console.log(currentUser?.value);
  return (
    <div className=" ">
      <div
        onClick={handleItemClick}
        className="group cardContainerList flex justify-center  relative  align-middle "
      >
        <div className="cardList  group-hover:text-primary transition relative flex flex-col justify-between cursor-pointer rounded-lg py-10 px-5">
          <p className="titleList">{data.title}</p>
          <p className="DescriptionList">{data.description.slice(0, 35)}...</p>
          <div
            className="
            absolute
            top-3
            right-3
          "
          >
            <HeartButton listingId={data.id} currentUser={currentUser} />
          </div>
          <div
            className="
            absolute
            top-3
            left-3
          "
          >
            {
              categories.find((category) => category.label === data.category)
                ?.icon
            }
          </div>
          <div className="w-f flex  text-white text-center">
            {LastOrder ? <>{LastOrder}</> : <></>}
          </div>
          <Image
            className=" group-hover:scale-110 
              transition   mask mask-hexagon"
            src={data.imageSrc1}
            alt={data.title}
            height={100}
            width={100}
          />
          <p className="PriceList group">Rs. {data.price}</p>
          <div className="AvailmaxContainerList">
            <div className="AvailList">
              <p className="AvailHeadingList">Available</p>
              <p className="AvailTemList">{data.availability}</p>
            </div>
            <div className="maxList">
              <p className="maxHeadingList">Calories</p>
              <p className="maxTemList">{data.calories} cal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
