import qs from "query-string";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, ReactNode } from "react";

interface CategoryBoxProps {
  label: string;
  selected?: boolean;
  icon: ReactNode;
  description?: String;
}

const CategoryBox: React.FC<CategoryBoxProps> = ({
  label,
  selected,
  icon,
  description,
}) => {
  const router = useRouter();
  const params = useSearchParams();

  const handleClick = useCallback(() => {
    let currentQuery = {};

    if (params) {
      currentQuery = qs.parse(params.toString());
    }

    const updatedQuery: any = {
      ...currentQuery,
      category: label,
    };

    if (params?.get("category") === label) {
      delete updatedQuery.category;
    }

    const url = qs.stringifyUrl(
      {
        url: "/",
        query: updatedQuery,
      },
      { skipNull: true }
    );

    router.push(url);
  }, [label, router, params]);

  return (
    <div
      onClick={handleClick}
      className={`
        flex 
        flex-col 
        items-center 
        group
        justify-center 
        gap-2
        p-3
        border-b-2
        hover:text-green-600
        transition
        cursor-pointer
        ${selected ? "border-b-neutral-800" : "border-transparent"}
        ${selected ? "text-blue-800" : "text-neutral-500"}
      `}
    >
      {icon}
      <div className="font-medium text-sm">{label}</div>
      <div className="hidden group-hover:solid ">Hi</div>
    </div>
  );
};

export default CategoryBox;
