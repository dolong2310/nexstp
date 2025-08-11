// "use client";

// import useProductFilter from "../../hooks/use-product-filter";
// import PriceFilter from "./price-filter";
// import FilterItem from "./product-filter-item";
// import TagsFilter from "./tags-filter";

// const ProductFilters = () => {
//   const [filters, setFilters] = useProductFilter();

//   const hasAnyFilters = Object.entries(filters).some(([key, value]) => {
//     if (key === "sort") {
//       return false;
//     }

//     if (Array.isArray(value)) {
//       return value.length > 0;
//     }

//     if (typeof value === "string") {
//       return value !== "";
//     }

//     return value !== null;
//   });

//   const onChange = (key: keyof typeof filters, value: unknown) => {
//     setFilters({ ...filters, [key]: value });
//   };

//   const onClear = () => {
//     setFilters({
//       minPrice: "",
//       maxPrice: "",
//       tags: [],
//     });
//   };

//   return (
//     <div className="border rounded-md bg-background">
//       <div className="flex items-center justify-between border-b p-4">
//         <p className="font-medium">Filters</p>
//         {hasAnyFilters && (
//           <button
//             type="button"
//             className="underline cursor-pointer"
//             onClick={onClear}
//           >
//             Clear
//           </button>
//         )}
//       </div>

//       <FilterItem title="Price">
//         <PriceFilter
//           minPrice={filters.minPrice}
//           maxPrice={filters.maxPrice}
//           onMinPriceChange={(value) => onChange("minPrice", value)}
//           onMaxPriceChange={(value) => onChange("maxPrice", value)}
//         />
//       </FilterItem>

//       <FilterItem title="Tags" className="border-b-0">
//         <TagsFilter
//           values={filters.tags}
//           onChange={(value) => onChange("tags", value)}
//         />
//       </FilterItem>
//     </div>
//   );
// };

// export default ProductFilters;
