"use client";

import { useRouter } from "@/i18n/navigation";
import { useUserStore } from "@/modules/auth/store/use-user-store";
import { User } from "@/payload-types";
import { LogOutIcon, useAuth } from "@payloadcms/ui";

const LogoutAdminButton = () => {
  const router = useRouter();
  const auth = useAuth<User>();

  const removeUser = useUserStore((state) => state.remove);

  const handleLogout = () => {
    removeUser();
    auth.logOut();
    router.push("/admin/login");
  };

  return (
    <button className="logout-button" onClick={handleLogout}>
      <LogOutIcon />
    </button>
  );
};

export default LogoutAdminButton;
