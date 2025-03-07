"use client";
import { useCallback } from "react";
import Image from "next/image";
import { TbPhotoPlus } from "react-icons/tb";
import { useEffect } from "react";

declare global {
  interface Window {
    cloudinary: any;
  }
}

interface ImageUploadProps {
  onChange: (value: string) => void;
  value: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onChange, value }) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleUpload = useCallback(() => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dpfsqju0d",
        uploadPreset: "rlnmesd6",
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          onChange(result.info.secure_url);
        }
      }
    );
    widget.open();
  }, [onChange]);

  return (
    <div
      onClick={handleUpload}
      className="
      relative
      cursor-pointer
      hover:opacity-70
      transition
      border-dashed 
      border-2 
      p-20 
      border-neutral-300
      flex
      flex-col
      justify-center
      items-center
      gap-4
      text-neutral-600
    "
    >
      <TbPhotoPlus size={50} />
      <div className="font-semibold text-lg">Click to upload</div>
      {value && (
        <div className="absolute inset-0 w-full h-full">
          <Image fill style={{ objectFit: "cover" }} src={value} alt="House" />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
