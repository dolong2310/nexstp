"use client";

import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import { SearchIcon } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import useLaunchpadFilter from "../../hooks/use-launchpad-filter";

interface Props {
  disabled?: boolean;
}

const SearchInput = ({ disabled }: Props) => {
  const [filters, setFilters] = useLaunchpadFilter();

  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    setFilters({ ...filters, search: debouncedSearchTerm });
  }, [debouncedSearchTerm]);

  return (
    <div className="relative w-full">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
      <Input
        className="pl-8"
        placeholder="Search launchpads"
        disabled={disabled}
        value={searchTerm}
        onChange={handleSearchChange}
      />
    </div>
  );
};

export default SearchInput;
