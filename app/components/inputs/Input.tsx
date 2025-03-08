"use client";

import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { BiRupee } from "react-icons/bi";

interface InputProps {
  id: string;
  label: string;
  type?: string;
  disabled?: boolean;
  formatPrice?: boolean;
  required?: boolean;
  placeholderText?: string;
  min?: number;
  max?: number;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  type = "text",
  disabled,
  formatPrice,
  register,
  required,
  placeholderText,
  min,
  max,
  errors,
}) => {
  return (
    <div className="w-full relative">
      {formatPrice && (
        <BiRupee
          size={24}
          className="
            text-slate-800
            absolute
            top-5
            left-2
          "
        />
      )}

     <div className="relative flex flex-col gap-1 w-full">
  <label
    className={`
      block
      text-sm
      font-medium
      ${errors[id] ? "text-rose-500" : "text-slate-300"}
      transition-colors
    `}
  >
    {label}
  </label>
  
  <input
    id={id}
    disabled={disabled}
    {...register(id, { required, min, max })}
    placeholder={placeholderText}
    type={type}
    className={`
      w-full
      py-2
      px-4
      text-sm
      font-light 
      bg-slate-800 
      border-2
      rounded-md
      outline-none
      transition
      disabled:opacity-70
      disabled:cursor-not-allowed
      ${formatPrice ? "pl-9" : "pl-4"}
      ${errors[id] ? "border-rose-500" : "border-slate-600"}
      ${errors[id] ? "focus:border-rose-500" : "focus:border-slate-400"}
      placeholder-slate-400
    `}
  />
</div>
    </div>
  );
};

export default Input;

