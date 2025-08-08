"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NewspaperIcon, TimerIcon, TrendingUpIcon } from "lucide-react";
import useLaunchpadFilter, {
  SortValue,
} from "../../hooks/use-launchpad-filter";

interface Props {
  disabled?: boolean;
}

const sortOptions = [
  {
    label: "Featured",
    value: "priority",
    icon: <TrendingUpIcon className="size-4 mr-1" />,
  },
  {
    label: "Newest",
    value: "newest",
    icon: <NewspaperIcon className="size-4 mr-1" />,
  },
  {
    label: "Ending Soon",
    value: "ending-soon",
    icon: <TimerIcon className="size-4 mr-1" />,
  },
];

const SortDropdown = ({ disabled }: Props) => {
  const [filters, setFilters] = useLaunchpadFilter();

  const handleSortChange = (value: SortValue) => () => {
    setFilters({ ...filters, sort: value });
  };

  return (
    <div className="flex items-center gap-2 h-full">
      {sortOptions.map((option) => (
        <Button
          key={option.value}
          variant="default"
          className={cn(
            "hover:bg-main",
            filters.sort === option.value ? "bg-main" : "bg-background"
          )}
          disabled={disabled}
          onClick={handleSortChange(option.value as SortValue)}
        >
          {option.icon}
          <span className="hidden md:block">{option.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default SortDropdown;
