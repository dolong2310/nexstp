"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/use-debounce";
import useSession from "@/hooks/use-session";
import { Link } from "@/i18n/navigation";
import { BookmarkCheckIcon, ListFilterIcon, SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChangeEvent, useEffect, useState } from "react";
import CategoriesSidebar from "./categories-sidebar";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const SearchInput = ({ value, onChange, disabled }: Props) => {
  const t = useTranslations();
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
          className="pl-8 shadow-shadow"
          placeholder={t("Search products")}
          disabled={disabled}
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Categories view all button in mobile */}
      <Button
        variant="default"
        size="icon"
        className="shrink-0 flex lg:hidden"
        onClick={() => setIsSidebarOpen(true)}
      >
        <ListFilterIcon />
      </Button>

      {/* Library button */}
      {user && (
        <Button
          asChild
          variant="default"
          className="size-10 md:size-auto md:self-stretch shrink-0"
        >
          <Link prefetch href="/library">
            <BookmarkCheckIcon />
            <span className="hidden md:block">{t("Library")}</span>
          </Link>
        </Button>
      )}
    </div>
  );
};

export default SearchInput;
