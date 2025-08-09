"use client";

import {
  FacebookIcon,
  InstagramIcon,
  TelegramIcon,
  TwitterIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Share2Icon } from "lucide-react";

interface Props {}

const SocialsShareButton = (props: Props) => {
  const handleSocialShare =
    (platform: "facebook" | "instagram" | "telegram" | "twitter") => () => {
      const url = encodeURIComponent(window.location.href);
      // const text = encodeURIComponent(`Check out ${launchpad.title}`); // &text=${text}
      let shareUrl = "";

      switch (platform) {
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          break;
        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?url=${url}`;
          break;
        case "telegram":
          shareUrl = `https://t.me/share/url?url=${url}`;
          break;
        case "instagram":
          shareUrl = `https://www.instagram.com/`;
          break;
        default:
          break;
      }
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="absolute top-4 right-4"
        >
          <Share2Icon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex items-center gap-2 w-fit">
        <Button
          variant="neutral"
          size="icon"
          onClick={handleSocialShare("facebook")}
        >
          <FacebookIcon />
        </Button>
        <Button
          variant="neutral"
          size="icon"
          onClick={handleSocialShare("instagram")}
        >
          <InstagramIcon />
        </Button>
        <Button
          variant="neutral"
          size="icon"
          onClick={handleSocialShare("telegram")}
        >
          <TelegramIcon />
        </Button>
        <Button
          variant="neutral"
          size="icon"
          onClick={handleSocialShare("twitter")}
        >
          <TwitterIcon />
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default SocialsShareButton;
