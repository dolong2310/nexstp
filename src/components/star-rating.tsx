import { cn } from "@/lib/utils";
import { StarIcon } from "lucide-react";

interface Props {
  rating: number;
  className?: string;
  iconClassName?: string;
  text?: string;
}

const MAX_RATING = 5;
const MIN_RATING = 0;

const StarRating = ({ rating, className, iconClassName, text }: Props) => {
  /**
   * Cho biết MIN_RATING = 1 và MAX_RATING = 5:
   * rating = 3 → safeRating = 3 (trong khoảng hợp lệ)
   * rating = 7 → safeRating = 5 (bị giới hạn bởi MAX_RATING)
   * rating = -2 → safeRating = 1 (bị giới hạn bởi MIN_RATING)
   * rating = 0 → safeRating = 1 (bị giới hạn bởi MIN_RATING)
   */
  const safeRating = Math.max(MIN_RATING, Math.min(rating, MAX_RATING));

  return (
    <div className={cn("flex items-center gap-x-1", className)}>
      {Array.from({ length: MAX_RATING }).map((_, index) => {
        return (
          <StarIcon
            key={index}
            className={cn(
              "size-4",
              index < safeRating ? "fill-black dark:fill-white" : "",
              iconClassName
            )}
          />
        );
      })}
      {text && <p>{text}</p>}
    </div>
  );
};

export default StarRating;
