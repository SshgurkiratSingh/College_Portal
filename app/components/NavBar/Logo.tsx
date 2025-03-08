"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ClientOnly from "../ClientOnly";

const Lgog = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/");
  };

  return (
    <>
      <ClientOnly>
        <div
          onClick={handleClick}
          className="flex items-center cursor-pointer"
        >
          <Image
            src="/images/ccetLogo.png"
            alt="Logo"
            
            width={100} // Adjusted width
            height={100} // Adjusted height
            className="object-contain" // Ensures the image scales properly
          />
          {/* Optional: Add text or other elements next to the logo */}
        </div>
      </ClientOnly>
    </>
  );
};

export default Lgog;