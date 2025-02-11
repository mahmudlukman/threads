"use client"

import { redirect } from "next/navigation";
import PostThread from "@/components/forms/PostThread";
import { RootState } from "@/types";
import { useSelector } from "react-redux";

const Page = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  if (!user) return null;

  if (!user?.onboarded) redirect("/onboarding");

  return (
    <>
      <h1 className="head-text">Create Thread</h1>

      <PostThread userId={user?._id} />
    </>
  );
};

export default Page;
