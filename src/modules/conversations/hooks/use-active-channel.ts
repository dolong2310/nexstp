import { pusherClient } from "@/lib/pusher";
import { Channel, Members } from "pusher-js";
import { useEffect, useState } from "react";
import useActiveList from "../store/use-active-list";

// quản lý danh sách user online/offline realtime giữa các client.
const useActiveChannel = () => {
  const { set, add, remove } = useActiveList();
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

  useEffect(() => {
    let channel = activeChannel;

    if (!channel) {
      channel = pusherClient.subscribe("presence-messenger");
      setActiveChannel(channel);
    }

    channel.bind("pusher:subscription_succeeded", (members: Members) => {
      // lấy danh sách tất cả user đang online và lưu vào store.
      const initialMembers: string[] = [];
      members.each((member: Record<string, any>) =>
        initialMembers.push(member.id)
      );
      set(initialMembers);
    });

    channel.bind("pusher:member_added", (member: Record<string, any>) => {
      // Khi có user mới online (pusher:member_added), thêm user đó vào danh sách active.
      add(member.id);
    });

    channel.bind("pusher:member_removed", (member: Record<string, any>) => {
      // Khi có user offline (pusher:member_removed), xóa user đó khỏi danh sách active.
      remove(member.id);
    });

    return () => {
      if (activeChannel) {
        activeChannel.unbind_all();
        pusherClient.unsubscribe("presence-messenger");
        setActiveChannel(null);
      }
    };
  }, [activeChannel, add, remove, set]);

  return null;
};

export default useActiveChannel;
