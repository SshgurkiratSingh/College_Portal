"use client";
import { IoBeerOutline, IoCafeOutline, IoWaterOutline } from "react-icons/io5";
import { LuCupSoda } from "react-icons/lu";
import { usePathname, useSearchParams } from "next/navigation";
import { LiaGlassMartiniAltSolid } from "react-icons/lia";
import Container from "../container";
import CategoryBox from "../CategoryBox";
import { BiFoodMenu } from "react-icons/bi";
export const categories = [
  {
    label: "Soda Symphony",
    icon: <LuCupSoda />,
    description: "Discover a world of fizzy delights with a variety of sodas!",
  },
  {
    label: "Juice Jubilee",
    icon: <LiaGlassMartiniAltSolid />,
    description: "Enjoy a feast of fruity freshness with a spectrum of juices!",
  },
  {
    label: "Coffee Carnival",
    icon: <IoCafeOutline />,
    description:
      "Experience the diverse universe of coffee - one cup at a time!",
  },
  {
    label: "Water Wonderland",
    icon: <IoWaterOutline />,
    description: "Stay refreshed and hydrated with pure, chilled water!",
  },
  {
    label: "Snacks",
    icon: <BiFoodMenu />,
    description: "Treat yourself to a range of snacks!",
  },
];

const Categories = () => {
  const params = useSearchParams();
  const cat = params?.get("category");
  const pathName = usePathname();
  if (pathName === "/") {
    return (
      <Container>
        <div className="pt-4 flex flex-row items-center justify-between overflow-x-auto">
          {categories.map((category) => (
            <CategoryBox
              key={category.label}
              label={category.label}
              description={category.description}
              icon={category.icon}
              selected={category.label === cat}
            />
          ))}
        </div>
      </Container>
    );
  } else {
    return null;
  }
};

export default Categories;
