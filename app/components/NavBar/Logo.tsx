"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use } from "react";
import ClientOnly from "../ClientOnly";
const Lgog = () => {
  const router = useRouter();
  const handleClick = () => {
    router.push("/");
  };
  return (
    <>
      <ClientOnly>
        <p onClick={handleClick} className="titBlock text-4xl">
          DrinkDes
        </p>
      </ClientOnly>
    </>
  );
};

export default Lgog;
