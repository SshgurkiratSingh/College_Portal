"use client";
import { useRouter } from "next/navigation";
import Button from "./Button";

// interface containing label and style
interface ButtonProps {
  label: string;
  loc: string;
}

// Button component
const ButtonToPage = ({ label, loc }: ButtonProps) => {
  const router = useRouter();

  return (
    <Button 
      label={label}
      s4
      onClick={() => {
        router.push(loc);
      }}
    />
  );
};
//exporting ButtonToPage
export default ButtonToPage;
