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
          <Image src="/images/ccetLogo.png" alt="Logo" width={40} height={40} />
         
        </p>
      </ClientOnly>
    </>
  );
};

export default Lgog;
