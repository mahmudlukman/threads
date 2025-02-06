"use client";

import UserCard from "../cards/UserCard";
import { useSelector } from "react-redux";
import { RootState } from "@/types";
import { useGetUsersQuery } from "../../redux/features/user/userApi";
import { useGetCommunitiesQuery } from "../../redux/features/community/communityApi";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const RightSidebar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  // const router = useRouter();
  const { data: users, isError, isLoading } = useGetUsersQuery({ pageSize: 4 });
  const { data: communities } = useGetCommunitiesQuery({ pageSize: 4 });

  const similarMinds = users?.users || [];

  const suggestedCommunities = communities?.communities || [];

  // useEffect(() => {
  //   if (!user) {
  //     router.push("/login");
  //   }
  // }, [user, router]);

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
              {suggestedCommunities.map(
                (community: {
                  id: string;
                  name: string;
                  username: string;
                  image: string;
                }) => (
                  <UserCard
                    key={community.id}
                    id={community.id}
                    name={community.name}
                    username={community.username}
                    avatar={community.image}
                    personType="Community"
                  />
                )
              )}
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
              {similarMinds.map(
                (person: {
                  id: string;
                  name: string;
                  username: string;
                  avatar: string;
                }) => (
                  <UserCard
                    key={person.id}
                    id={person.id}
                    name={person.name}
                    username={person.username}
                    avatar={person.avatar}
                    personType="User"
                  />
                )
              )}
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
