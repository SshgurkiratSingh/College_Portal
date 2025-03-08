"use client";
import { ReactNode } from "react";

interface MenuItemProps {
  onClick: () => void;
  label: string;
  icon?: ReactNode;
}

const MenuItem: React.FC<MenuItemProps> = ({ onClick, label, icon }) => {
  return (
    <li
      onClick={onClick}
      className="
        flex 
        items-center 
        gap-2 
        px-4 
        py-2 
        cursor-pointer 
        hover:bg-gray-500 
        transition-colors
      "
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span className="font-medium">{label}</span>
    </li>
  );
};

export default MenuItem;
