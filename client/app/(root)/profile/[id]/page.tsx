"use client";
import Image from "next/image";
import { redirect } from "next/navigation";
import { profileTabs } from "@/constants";
import ThreadsTab from "@/components/shared/ThreadsTab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelector } from "react-redux";
import { RootState } from "@/types";

const Page = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return null;

  if (!user?.onboarded) redirect("/onboarding");

  return (
    <section>
      <ProfileHeader
        accountId={user?._id}
        authUserId={user?._id}
        name={user.name}
        username={user.username}
        avatar={user.avatar?.url || ""}
        bio={user.bio}
        type={"User"}
      />

      <div className="mt-9">
        <Tabs defaultValue="threads" className="w-full">
          <TabsList className="tab">
            {profileTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className="tab">
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <p className="max-sm:hidden">{tab.label}</p>

                {tab.label === "Threads" && (
                  <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                    {user?.threads?.length || 0}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {profileTabs.map((tab) => (
            <TabsContent
              key={`content-${tab.label}`}
              value={tab.value}
              className="w-full text-light-1"
            >
              <ThreadsTab
                currentUserId={user?._id}
                accountId={user?._id}
                accountType="User"
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};
export default Page;
