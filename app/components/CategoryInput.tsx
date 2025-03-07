import { ReactElement } from "react";

interface CategoryInputProps {
  label: string;
  icon: ReactElement;
  selected?: boolean;
  description?: string;
  onClick: (value: string) => void;
}

const CategoryInput: React.FC<CategoryInputProps> = ({
  label,
  icon,
  onClick,
  selected,
}) => {
  return (
    <div
      onClick={() => onClick(label)}
      className={`
        rounded-xl
        border-2
        p-4
        flex
        flex-col
        gap-3
       
        transition
        cursor-pointer s3
       
      `}
    >
      {icon}
      <div className={`${selected ? "text-purple-700 " : ""}`}>{label}</div>
    </div>
  );
};

export default CategoryInput;
