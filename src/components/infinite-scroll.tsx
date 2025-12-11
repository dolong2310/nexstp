import * as React from "react";

/**
 * InfiniteScroll Component
 * 
 * Component hỗ trợ infinite scroll sử dụng Intersection Observer API
 * để tự động tải thêm dữ liệu khi user scroll đến cuối (hoặc đầu) danh sách.
 * 
 * @param {boolean} isLoading - Trạng thái đang tải dữ liệu. Khi true, không trigger load thêm để tránh gọi API trùng lặp
 * @param {boolean} hasMore - Còn dữ liệu để tải thêm hay không. Khi false, sẽ không trigger hàm next()
 * @param {() => unknown} next - Hàm callback được gọi khi cần load thêm dữ liệu (thường là fetch API)
 * @param {number} [threshold=1] - Ngưỡng hiển thị để trigger load (0-1). VD: 0.8 = trigger khi element hiển thị 80%
 * @param {Element | Document | null} [root=null] - Element container làm root cho Intersection Observer. null = viewport
 * @param {string} [rootMargin="0px"] - Margin xung quanh root (CSS syntax). VD: "200px" = trigger sớm hơn 200px
 * @param {boolean} [reverse] - Đảo ngược vị trí observe. false = observe cuối (scroll xuống), true = observe đầu (scroll lên)
 * @param {React.ReactNode} [children] - Các element con để render. Ref observer sẽ được attach vào element đầu/cuối
 * 
 * @example
 * <InfiniteScroll
 *   isLoading={loading}
 *   hasMore={hasNextPage}
 *   next={fetchMoreData}
 *   threshold={0.8}
 *   rootMargin="200px"
 * >
 *   {items.map(item => <ItemCard key={item.id} {...item} />)}
 * </InfiniteScroll>
 */
interface InfiniteScrollProps {
  isLoading: boolean;
  hasMore: boolean;
  next: () => unknown;
  threshold?: number;
  root?: Element | Document | null;
  rootMargin?: string;
  reverse?: boolean;
  children?: React.ReactNode;
}

const InfiniteScroll = ({
  isLoading,
  hasMore,
  next,
  threshold = 1,
  root = null,
  rootMargin = "0px",
  reverse,
  children,
}: InfiniteScrollProps) => {
  const observer = React.useRef<IntersectionObserver>(null);
  // This callback ref will be called when it is dispatched to an element or detached from an element,
  // or when the callback function changes.
  const observerRef = React.useCallback(
    (element: HTMLElement | null) => {
      let safeThreshold = threshold;
      if (threshold < 0 || threshold > 1) {
        console.warn(
          "threshold should be between 0 and 1. You are exceed the range. will use default value: 1"
        );
        safeThreshold = 1;
      }
      // When isLoading is true, this callback will do nothing.
      // It means that the next function will never be called.
      // It is safe because the intersection observer has disconnected the previous element.
      if (isLoading) return;

      if (observer.current) observer.current.disconnect();
      if (!element) return;

      // Create a new IntersectionObserver instance because hasMore or next may be changed.
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && hasMore) {
            next();
          }
        },
        { threshold: safeThreshold, root, rootMargin }
      );
      observer.current.observe(element);
    },
    [hasMore, isLoading, next, threshold, root, rootMargin]
  );

  const flattenChildren = React.useMemo(
    () => React.Children.toArray(children),
    [children]
  );

  return (
    <>
      {flattenChildren.map((child, index) => {
        if (!React.isValidElement(child)) {
          process.env.NODE_ENV === "development" &&
            console.warn("You should use a valid element with InfiniteScroll");
          return child;
        }

        const isObserveTarget = reverse
          ? index === 0
          : index === flattenChildren.length - 1;
        const ref = isObserveTarget ? observerRef : null;
        // @ts-ignore ignore ref type
        return React.cloneElement(child, { ref });
      })}
    </>
  );
};

export default InfiniteScroll;
