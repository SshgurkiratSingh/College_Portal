"use client";

import { useRouter } from "next/navigation";

import Heading from "./Heading";
import Button from "./NavBar/Button";

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  onAction?: () => void;
  actionLabelText?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Nothing Found",
  subtitle = "Retry or remove Some filters to get started.",
  onAction,
  actionLabelText
}) => {
  const router = useRouter();

  return (
    <div
      className="
        h-[60vh]
        flex 
        flex-col 
        gap-2 
        justify-center 
        items-center
        text-red-100 
      "
    >
      <Heading center title={title} subtitle={subtitle} />
      <div className="w-48 mt-4">
        {onAction && actionLabelText && (
          <Button
            outline
            label={actionLabelText}
            onClick={onAction}
          />
        )}
      </div>
    </div>
  );
};

export default EmptyState;
