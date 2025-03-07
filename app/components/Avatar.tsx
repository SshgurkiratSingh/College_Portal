"use client";
import Image from "next/image";
interface ImageProps {
  src?: string | null | undefined;
  alt?: string;
}
const Avatar: React.FC<ImageProps> = ({ src, alt }) => {
  return (
    <div className="experimentalBor">
      <Image
        className="rounded-full"
        height="30"
        width="30"
        src={src || "/images/placeholder.png"}
        alt={alt || "Avatar"}
      />
    </div>
  );
};

export default Avatar;
