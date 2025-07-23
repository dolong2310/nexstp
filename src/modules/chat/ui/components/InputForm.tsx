"use client";

import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { twMerge } from "tailwind-merge";

type InputProps = {
  id: string;
  label: string;
  type?: string;
  errors: FieldErrors;
  disabled?: boolean;
  register: UseFormRegister<FieldValues>;
};

const InputForm = ({
  id,
  label,
  type,
  errors,
  disabled,
  register,
}: InputProps) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium leading-6"
      >
        {label}
      </label>

      <div className="mt-2">
        <input
          id={id}
          type={type}
          autoComplete={id}
          disabled={disabled}
          {...register(id, { required: true })}
          className={twMerge(
            "block w-full rounded-md border-none outline-none px-2 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300",
            "placeholder:text-gray-400",
            "sm:text-sm sm:leading-6",
            "focus:ring-2 focus:ring-inset focus:ring-sky-600",
            disabled && "opacity-50 cursor-not-allowed",
            errors[id] && "focus:ring-rose-500"
          )}
        />
      </div>
      {/* {errors[id] && <span>{errors[id].message}</span>} */}
    </div>
  );
};

export default InputForm;
