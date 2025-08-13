"use client";

import { useState } from "react";

const languages = [
  {
    code: "en",
    label: "English",
    description: (
      <ol className="list-decimal pl-6 space-y-4">
        <li>
          Nexstp is a multi-tenant e-commerce platform built with Next.js,
          designed to support multiple stores (tenants) operating on a single
          system.
        </li>
        <li>
          The project uses PayloadCMS for dynamic content and data management,
          including products, banners, launchpads, users, and more.
        </li>
        <li>
          API communication is handled via tRPC, ensuring type-safe interactions
          between client and server for robust development and reduced type
          errors.
        </li>
        <li>
          Stripe integration enables secure payment processing, supporting both
          direct product purchases and crowdfunding campaigns (launchpads).
        </li>
        <li>
          Real-time chat functionality is powered by Pusher, with custom
          chunking logic to bypass payload size limitations.
        </li>
        <li>
          State management is implemented using Zustand, optimizing workflows
          for cart, checkout, and complex data flows.
        </li>
        <li>
          The UI leverages TailwindCSS, Shadcn UI, and Radix UI for a modern,
          responsive, and accessible design, including dark mode and skeleton
          loading effects.
        </li>
        <li>
          Product review features allow users to rate and review only items they
          have purchased, with average ratings, rating distribution, and
          detailed review displays.
        </li>
        <li>
          The system supports role-based access control: super admin, tenant,
          and user, each with distinct permissions and capabilities.
        </li>
        <li>
          Comprehensive management of products, orders, banners, categories,
          tags, and tenant-specific fields is provided.
        </li>
        <li>
          User experience is enhanced with lazy loading, streaming, and virtual
          scrolling for large product lists.
        </li>
        <li>
          The project integrates modern libraries such as React Query, React
          Virtual, Zod, React Hook Form, Date-fns, Nuqs, MongoDB, and
          TypeScript.
        </li>
        <li>
          Automated data seeding for media, banners, categories, and tenants
          accelerates development and testing.
        </li>
        <li>
          Multi-store support allows each tenant to manage their own products,
          banners, launchpads, and information independently.
        </li>
        <li>
          Launchpads automatically convert to products when campaigns expire.
        </li>
        <li>
          Advanced search and filtering features enable users to find products
          by category, tag, price, and sort criteria.
        </li>
        <li>
          Cart management is tenant-specific, supporting purchases from multiple
          stores simultaneously.
        </li>
        <li>
          Security is enforced through authentication, authorization, and
          validation for sensitive operations.
        </li>
        <li>
          Real-time notifications, chat, and advanced features deliver a modern
          user experience.
        </li>
        <li>
          The architecture is designed for scalability, extensibility, and easy
          integration of new features and external services, optimizing both
          frontend and backend performance.
        </li>
      </ol>
    ),
  },
  {
    code: "vi",
    label: "Vietnamese",
    description: (
      <ol className="list-decimal pl-6 space-y-4">
        <li>
          Dự án Nexstp là một nền tảng thương mại điện tử đa tenant, cho phép
          nhiều cửa hàng (tenant) cùng hoạt động trên một hệ thống duy nhất.
        </li>
        <li>
          Sử dụng Next.js làm framework chính, kết hợp PayloadCMS để quản trị
          nội dung và dữ liệu động cho sản phẩm, banner, launchpad, user, v.v.
        </li>
        <li>
          API được xây dựng với tRPC, đảm bảo type-safe giữa client và server,
          giúp phát triển nhanh và giảm lỗi kiểu dữ liệu.
        </li>
        <li>
          Tích hợp Stripe để xử lý thanh toán, hỗ trợ các chiến dịch
          crowdfunding (launchpad) và mua bán sản phẩm trực tiếp.
        </li>
        <li>
          Hệ thống chat real-time sử dụng Pusher, có cơ chế chunking dữ liệu để
          vượt qua giới hạn payload của Pusher.
        </li>
        <li>
          Quản lý trạng thái ứng dụng với Zustand, tối ưu cho các thao tác giỏ
          hàng, mua hàng, và các luồng dữ liệu phức tạp.
        </li>
        <li>
          Giao diện hiện đại sử dụng TailwindCSS, Shadcn UI, Radix UI, hỗ trợ
          dark mode, responsive, và hiệu ứng skeleton loading.
        </li>
        <li>
          Tính năng review sản phẩm: người dùng chỉ có thể đánh giá sản phẩm đã
          mua, hệ thống tính toán rating trung bình, phân bố rating, và hiển thị
          review chi tiết.
        </li>
        <li>
          Hỗ trợ phân quyền: super admin, tenant, user; mỗi vai trò có quyền
          truy cập và thao tác khác nhau trên hệ thống.
        </li>
        <li>
          Quản lý sản phẩm, đơn hàng, banner quảng cáo, category, tag, và các
          trường thông tin mở rộng cho từng tenant.
        </li>
        <li>
          Tối ưu trải nghiệm người dùng với lazy loading, streaming, virtual
          scroll cho danh sách sản phẩm lớn.
        </li>
        <li>
          Tích hợp các thư viện hiện đại như React Query, React Virtual, Zod,
          React Hook Form, Date-fns, Nuqs, MongoDB, TypeScript.
        </li>
        <li>
          Hệ thống seed dữ liệu tự động cho media, banner, category, tenant,
          giúp khởi tạo môi trường phát triển nhanh chóng.
        </li>
        <li>
          Hỗ trợ multi-store, mỗi tenant có thể quản lý sản phẩm, banner,
          launchpad, và thông tin riêng biệt.
        </li>
        <li>
          Có cơ chế tự động chuyển đổi launchpad thành sản phẩm khi hết hạn
          chiến dịch.
        </li>
        <li>
          Tính năng tìm kiếm, lọc sản phẩm theo category, tag, giá, và sắp xếp
          theo nhiều tiêu chí.
        </li>
        <li>
          Quản lý giỏ hàng theo từng tenant, hỗ trợ mua nhiều sản phẩm từ nhiều
          cửa hàng khác nhau.
        </li>
        <li>
          Hệ thống bảo mật với xác thực, phân quyền, và kiểm tra điều kiện khi
          thao tác dữ liệu nhạy cảm.
        </li>
        <li>
          Tích hợp real-time notification, chat, và các tính năng nâng cao cho
          trải nghiệm người dùng.
        </li>
        <li>
          Dự án được xây dựng với tư duy mở rộng, dễ dàng thêm mới tính năng,
          tích hợp dịch vụ bên ngoài, và tối ưu cho cả frontend và backend.
        </li>
      </ol>
    ),
  },
];

const AboutDescription = () => {
  const [language, setLanguage] = useState(languages[0]);

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev?.code === "en" ? languages[1] : languages[0]));
  };

  return (
    <div className="mt-6 font-base text-base sm:text-xl">
      {language?.description}
      <span
        className="inline-block ml-2 mt-4 font-bold cursor-pointer"
        onClick={handleToggleLanguage}
      >
        ...{language?.code === "vi" ? "English" : "Vietnamese"}
      </span>
    </div>
  );
};

export default AboutDescription;
