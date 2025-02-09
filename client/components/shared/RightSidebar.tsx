"use client";

import UserCard from "../cards/UserCard";
import { useSelector } from "react-redux";
import { RootState } from "@/types";
import { useGetUsersQuery } from "../../redux/features/user/userApi";
import { useGetCommunitiesQuery } from "../../redux/features/community/communityApi";
import { useEffect } from "react";
import { redirect } from "next/navigation";

interface User {
  _id: string;
  name: string;
  username: string;
  avatar: {
    url: string;
  } | null;
}

interface Community {
  _id: string;
  name: string;
  username: string;
  avatar: {
    url: string;
  } | null;
}

const RightSidebar = () => {
  // const { user } = useSelector((state: RootState) => state.auth);
  const { data: users, isError, isLoading } = useGetUsersQuery({ pageSize: 4 });
  const { data: communities } = useGetCommunitiesQuery({ pageSize: 4 });

  const similarMinds = users?.users || [];
  const suggestedCommunities = communities?.communities || [];

  if (isLoading) return <div>Loading Users</div>;
  if (isError) return <div>Error loading Users</div>;

  return (
    <section className="custom-scrollbar rightsidebar">
      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-heading4-medium text-light-1">
          Suggested Communities
        </h3>

        <div className="mt-7 flex w-[350px] flex-col gap-9">
          {suggestedCommunities.length > 0 ? (
            <>
              {suggestedCommunities.map((community: Community) => (
                <UserCard
                  key={community._id}
                  id={community._id}
                  name={community.name}
                  username={community.username}
                  avatar={community.avatar?.url || ""}
                  personType="Community"
                />
              ))}
            </>
          ) : (
            <p className="!text-base-regular text-light-3">
              No communities yet
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-heading4-medium text-light-1">Similar Minds</h3>
        <div className="mt-7 flex w-[350px] flex-col gap-10">
          {similarMinds.length > 0 ? (
            <>
              {similarMinds.map((person: User) => (
                <UserCard
                  key={person._id}
                  id={person._id}
                  name={person.name}
                  username={person.username}
                  avatar={person.avatar?.url || ""}
                  personType="User"
                />
              ))}
            </>
          ) : (
            <p className="!text-base-regular text-light-3">No users yet</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;