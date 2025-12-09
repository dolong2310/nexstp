"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CategoriesGetManyOutput } from "@/modules/categories/types";
import { ListFilterIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import CategoryDropdown from "./category-dropdown";

const CategoriesSidebar = dynamic(() => import("./categories-sidebar"), {
  ssr: false,
});

interface Props {
  data: CategoriesGetManyOutput;
}

const Categories = ({ data }: Props) => {
  const t = useTranslations();
  const params = useParams();

  const containerRef = useRef<HTMLDivElement>(null); // Container chứa categories hiển thị
  const measureRef = useRef<HTMLDivElement>(null); // Div ẩn dùng để đo kích thước items
  const viewAllRef = useRef<HTMLDivElement>(null); // Button "View All"

  const [visibleCount, setVisibleCount] = useState(data.length); // Số lượng category hiển thị
  const [isAnyHovered, setIsAnyHovered] = useState(false); // Trạng thái hover navigation
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Trạng thái đóng/mở sidebar

  const categoryParam = params.category as string | undefined;
  const activeCategory = categoryParam || "all";
  const activeCategoryIndex = data.findIndex(
    (cate) => cate.slug === activeCategory
  ); // Tìm index của category đang active
  const isActiveCategoryHidden =
    activeCategoryIndex >= visibleCount && activeCategoryIndex !== -1; // Kiểm tra category active có bị ẩn không

  useLayoutEffect(() => {
    // Hàm tính toán số lượng category có thể hiển thị dựa trên kích thước container
    const calculateVisible = () => {
      // Kiểm tra các ref có tồn tại không
      if (!containerRef.current || !measureRef.current || !viewAllRef.current)
        return;

      // Tính toán kích thước
      const containerWidth = containerRef.current.offsetWidth; // Chiều rộng container
      const viewAllWidth = viewAllRef.current.offsetWidth; // Chiều rộng button "View All"
      const availableWidth = containerWidth - viewAllWidth; // Không gian còn lại cho categories

      // Lấy tất cả children từ div đo lường
      const items = Array.from(measureRef.current.children);
      let totalWidth = 0;
      let visible = 0;

      // Lặp qua từng item để tính tổng width
      for (const item of items) {
        const itemWidth = item.getBoundingClientRect().width;

        // Nếu tổng width vượt quá availableWidth thì dừng
        if (totalWidth + itemWidth + viewAllWidth > availableWidth) break;
        totalWidth += itemWidth;
        visible++;
      }

      // Cập nhật số lượng item có thể hiển thị
      setVisibleCount(visible);
    };

    // Sử dụng ResizeObserver để theo dõi thay đổi kích thước container
    const resizeObserver = new ResizeObserver(calculateVisible);
    resizeObserver.observe(containerRef.current!);

    // Cleanup observer khi component unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, [data.length]);

  return (
    <div className="relative w-full">
      <CategoriesSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />

      {/* Div ẩn để đo kích thước tất cả categories */}
      <div
        ref={measureRef}
        className="absolute opacity-0 pointer-events-none flex"
        style={{ position: "fixed", top: -9999, left: -9999 }} // Đặt ngoài viewport
      >
        {data.map((category) => (
          <div key={category.id}>
            <CategoryDropdown
              category={category}
              isActive={activeCategory === category.slug}
              isNavigationHovered={false}
            />
          </div>
        ))}
      </div>

      {/* Container hiển thị categories với responsive layout */}
      <div
        ref={containerRef}
        className="flex flex-nowrap items-center gap-2"
        onMouseEnter={() => setIsAnyHovered(true)}
        onMouseLeave={() => setIsAnyHovered(false)}
      >
        {/* Chỉ hiển thị số lượng category theo visibleCount */}
        {data.slice(0, visibleCount).map((category) => (
          <div key={category.id}>
            <CategoryDropdown
              category={category}
              isActive={activeCategory === category.slug}
              isNavigationHovered={isAnyHovered}
            />
          </div>
        ))}

        <div ref={viewAllRef} className="shrink-0">
          <Button
            variant="neutral"
            className={cn(
              // Highlight button nếu category active bị ẩn và không hover
              isActiveCategoryHidden && !isAnyHovered && "bg-background"
            )}
            onClick={() => setIsSidebarOpen(true)}
          >
            {t("View All")}
            <ListFilterIcon className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Categories;
