"use client";

import ReactSelect from "react-select";

type Props = {
  label: string;
  value: Record<string, any>;
  options: Record<string, any>[];
  onChange: (value: Record<string, any>) => void;
  disabled?: boolean;
};

const SelectForm = ({ label, options, onChange, value, disabled }: Props) => {
  return (
    <div>
      <label
        htmlFor=""
        className="block text-sm font-medium leading-6 text-foreground"
      >
        {label}
      </label>
      <div className="mt-2">
        <ReactSelect
          isMulti
          options={options}
          value={value}
          isDisabled={disabled}
          onChange={onChange}
          className="bg-background"
          styles={{
            control: (base) => ({
              ...base,
              fontSize: "0.875rem", // text-sm
            }),
          }}
        />
      </div>
    </div>
  );
};

export default SelectForm;
