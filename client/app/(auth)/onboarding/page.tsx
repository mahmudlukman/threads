"use client"

import { redirect } from "next/navigation";
import AccountProfile from "@/components/forms/AccountProfile";
import { useSelector } from "react-redux";
import { RootState } from "@/types";

const Page = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return null; // to avoid typescript warnings

  if (user?.onboarded) redirect("/");

  const data = {
    username: user?.username ?? "",
    name: user?.name ?? "",
    bio: user?.bio ?? "",
    avatar: typeof user?.avatar === "string" ? { public_id: "", url: user.avatar } : user?.avatar ?? null,
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20 bg-dark-4">
      <h1 className="head-text">Onboarding</h1>
      <p className="mt-3 text-base-regular text-light-2">
        Complete your profile now, to use Threads.
      </p>

      <section className="mt-9 bg-dark-2 p-10">
        <AccountProfile user={data} btnTitle="Continue" />
      </section>
    </main>
  );
};

export default Page;
