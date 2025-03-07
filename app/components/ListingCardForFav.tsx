"use client";

import { Item } from "@prisma/client";
import { SafeUser } from "../types";
import Image from "next/image";

import { useRouter } from "next/navigation";
import Button from "./Button";
import { toast } from "react-hot-toast";
import HeartButton from "./HeartButton";
import { categories } from "./Categories/Categories";
import { ImageResponse } from "next/server";
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
      <div className="dbsf">
        {" "}
        <a
          href={`/item/${data.id}`}
          className="flex flex-col items-center justify-center"
        >
          <div className="dbsf-efubjmt">
            <p className="ufyu-ujumf">{data.title}</p>
            <p className="ufyu-cpez flex flex-col align-middle items-center">
              <Image
                src={data.imageSrc2}
                alt=""
                className="mask mask-hexagon"
              />
              <p>{data.availability > 0 ? "Available" : "Not Available"}</p>
            </p>
          </div>{" "}
        </a>
        <button className="dbsf-cvuumf flex flex-row justify-between">
          Remove <HeartButton listingId={data.id} currentUser={currentUser} />
        </button>
      </div>
    </div>
  );
};

export default ItemCard;
