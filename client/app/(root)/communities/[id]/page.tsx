/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { communityTabs } from "@/constants";
import UserCard from "@/components/cards/UserCard";
import ThreadsTab from "@/components/shared/ThreadsTab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelector } from "react-redux";
import { RootState } from "@/types";
import { useGetCommunityDetailsQuery } from "@/redux/features/community/communityApi";
import { skipToken } from "@reduxjs/toolkit/query";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = ({ params }: PageProps) => {
  // Unwrap the params promise using React.use()
  const resolvedParams = use(params);
  const { user } = useSelector((state: RootState) => state.auth);
  const [communityDetails, setCommunityDetails] = useState([]);

  // Use RTK Query hook with resolved params
  const { data, isLoading, error } = useGetCommunityDetailsQuery(
    user ? { id: resolvedParams.id } : skipToken
  );

  useEffect(() => {
    if (data && data.communityDetails) {
      setCommunityDetails(data.communityDetails);
    }
  }, [data]);

  if (!user) return null;
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading community details</div>;
  if (!communityDetails) return null;

  // Ensure threads and members are arrays, even if null/undefined
    const threads = data.communityDetails.threads || [];
    const members = data.communityDetails.members || [];

    console.log(data);

  return (
    <section>
      <ProfileHeader
        accountId={data.communityDetails.createdBy}
        authUserId={user?._id}
        name={data.communityDetails.name}
        username={data.communityDetails.username}
        avatar={data.avatar?.url || ""}
        bio={data.communityDetails.bio}
        type="Community"
      />

      <div className="mt-9">
        <Tabs defaultValue="threads" className="w-full">
          <TabsList className="tab">
            {communityTabs.map((tab) => (
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
                    {threads && threads.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="threads" className="w-full text-light-1">
            <ThreadsTab
              currentUserId={user?._id}
              accountId={data.communityDetails._id}
              accountType="Community"
            />
          </TabsContent>

          <TabsContent value="members" className="mt-9 w-full text-light-1">
            <section className="mt-9 flex flex-col gap-10">
              {members && members.length > 0 ? (
                members.map((member: any) => (
                  <UserCard
                    key={member._id}
                    id={member._id}
                    name={member.name}
                    username={member.username}
                    avatar={member.image}
                    personType="User"
                  />
                ))
              ) : (
                <p className="text-light-1">No members found</p>
              )}
            </section>
          </TabsContent>

          <TabsContent value="requests" className="w-full text-light-1">
            <ThreadsTab
              currentUserId={user?._id}
              accountId={data.communityDetails._id}
              accountType="Community"
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default Page;
