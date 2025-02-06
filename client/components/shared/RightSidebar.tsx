"use client";

import UserCard from "../cards/UserCard";
// import { fetchCommunities } from "@/lib/actions/community.actions";
import { useSelector } from "react-redux";
import { RootState } from "@/types";
import { useGetUsersQuery } from "../../redux/features/user/userApi";
// import { useRouter } from "next/navigation";

const RightSidebar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  // const router = useRouter();
  const { data, isError, isLoading } = useGetUsersQuery({pageSize: 4});

  const similarMinds = data?.users || [];

  console.log(similarMinds);

  //   const suggestedCOmmunities = await fetchCommunities({ pageSize: 4 });

  if (!user) return null;
  if (isLoading) return <div>Loading Users</div>;
  if (isError) return <div>Error loading Users</div>;

  return (
    <section className="custom-scrollbar rightsidebar">
      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-heading4-medium text-light-1">
          Suggested Communities
        </h3>

        {/* <div className="mt-7 flex w-[350px] flex-col gap-9">
          {suggestedCOmmunities.communities.length > 0 ? (
            <>
              {suggestedCOmmunities.communities.map((community) => (
                <UserCard
                  key={community.id}
                  id={community.id}
                  name={community.name}
                  username={community.username}
                  imgUrl={community.image}
                  personType="Community"
                />
              ))}
            </>
          ) : (
            <p className="!text-base-regular text-light-3">
              No communities yet
            </p>
          )}
        </div> */}
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
