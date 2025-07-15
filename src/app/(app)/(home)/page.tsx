"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

const Home = () => {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.auth.session.queryOptions());
  console.log("data: ", data?.user);
  return (
    <div className="p-4">
      <h1>Home Page</h1>
    </div>
  );
};

export default Home;
