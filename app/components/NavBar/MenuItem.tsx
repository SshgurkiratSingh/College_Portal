"use client";
import { ReactNode } from "react";

interface MenuItemProps {
  onClick: () => void;
  label: string;
  icon?: ReactNode; // optional prop, can be any valid JSX/ReactNode
}

const MenuItem: React.FC<MenuItemProps> = ({ onClick, label, icon }) => {
  return (
    <li
      className="px-4 flex hover:text-accent group flex-row py-3 border border-neutral-200 hover:border-neutral-700 rounded cursor-pointer transition font-bold"
      onClick={onClick}
    >
      {icon && <span className="mr-2 group-hover:animate-ping">{icon}</span>}
      {label}
    </li>
  );
};

export default MenuItem;
