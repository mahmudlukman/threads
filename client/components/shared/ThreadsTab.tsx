"use client";

import { IThread } from "@/types";
import { useGetUserThreadsQuery } from "@/redux/features/user/userApi";
import { useGetCommunityPostsQuery } from "@/redux/features/community/communityApi";
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

const ThreadsTab = ({ currentUserId, accountId, accountType }: Props) => {
  // Conditionally fetch threads based on account type
  const {
    data: userThreadsData,
    isLoading: isUserThreadsLoading,
    isError: isUserThreadsError,
  } = useGetUserThreadsQuery(
    { userId: accountId },
    { skip: accountType !== "User" }
  );

  const {
    data: communityPostsData,
    isLoading: isCommunityPostsLoading,
    isError: isCommunityPostsError,
  } = useGetCommunityPostsQuery(
    { id: accountId },
    { skip: accountType !== "Community" }
  );

  console.log(userThreadsData);

  // Determine the result based on account type
  const result = accountType === "User" ? userThreadsData : communityPostsData;

  // Loading state
  if (isUserThreadsLoading || isCommunityPostsLoading) {
    return <div>Loading threads...</div>;
  }

  // Error state
  if (isUserThreadsError || isCommunityPostsError) {
    return <div>Error loading threads</div>;
  }

  // Redirect if no result
  if (!result) {
    redirect("/");
  }

  // Determine threads and account info
  const threads = result.threads || [];
  const accountInfo =
    accountType === "User"
      ? {
          name: result.name,
          avatar: result.avatar,
          id: result?._id,
        }
      : null;

  return (
    <section className="mt-9 flex flex-col gap-10">
      {threads.map((thread: IThread) => (
        <ThreadCard
          key={thread._id}
          id={thread._id}
          currentUserId={currentUserId}
          parentId={thread.parentId || null}
          content={thread.text}
          author={
            accountType === "User"
              ? {
                  name: accountInfo?.name || "",
                  avatar: accountInfo?.avatar || "",
                  id: accountInfo?.id || "",
                }
              : {
                  name: thread.author.name,
                  avatar: thread.author.avatar,
                  id: thread.author?._id,
                }
          }
          community={
            accountType === "Community"
              ? {
                  name: result.name,
                  id: result.id,
                  avatar: result.avatar,
                }
              : thread.community
              ? {
                  id: thread.community._id,
                  name: thread.community.name,
                  avatar: thread.community.avatar,
                }
              : null
          }
          createdAt={thread.createdAt}
          comments={thread.children}
        />
      ))}
    </section>
  );
};

export default ThreadsTab;
