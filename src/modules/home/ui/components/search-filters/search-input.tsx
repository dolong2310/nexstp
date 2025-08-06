"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/use-debounce";
import useSession from "@/hooks/use-session";
import { BookmarkCheckIcon, ListFilterIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import CategoriesSidebar from "./categories-sidebar";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const SearchInput = ({ value, onChange, disabled }: Props) => {
  const { user } = useSession();

  const [searchTerm, setSearchTerm] = useState(value || "");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    onChange?.(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  return (
    <div className="flex items-center gap-2 w-full">
      <CategoriesSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />

      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
        <Input
          className="pl-8"
          placeholder="Search products"
          disabled={disabled}
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Categories view all button in mobile */}
      <Button
        variant="elevated"
        className="size-12 shrink-0 flex lg:hidden"
        onClick={() => setIsSidebarOpen(true)}
      >
        <ListFilterIcon />
      </Button>

      {/* Library button */}
      {user && (
        <Button
          asChild
          variant="elevated"
          className="size-12 md:size-auto md:self-stretch shrink-0"
        >
          <Link prefetch href="/library">
            <BookmarkCheckIcon />
            <span className="hidden md:block">Library</span>
          </Link>
        </Button>
      )}
    </div>
  );
};

export default SearchInput;
