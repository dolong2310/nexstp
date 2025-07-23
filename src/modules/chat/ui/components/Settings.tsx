import ThemeButton from "@/components/theme-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LogOutIcon, SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <div className="group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold text-gray-500 hover:text-foreground hover:bg-primary-foreground cursor-pointer">
          <SettingsIcon className="h-6 w-6 shrink-0" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="p-4">
          <h4 className="font-semibold">Settings</h4>

          <ul className="mt-4 space-y-2">
            <li className="flex items-center justify-between mt-2">
              <span>Theme mode:</span>
              <ThemeButton />
            </li>

            <li className="flex items-center justify-between mt-2">
              <div className="w-full pt-4 mt-4 border-t">
                <button
                  className="flex items-center gap-2 cursor-pointer"
                  // onClick={() => signOut()}
                >
                  <span>Logout</span>
                  <LogOutIcon />
                </button>
              </div>
            </li>
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Settings;
