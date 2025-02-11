"use client";
import { redirect, useSearchParams } from "next/navigation";
import Searchbar from "@/components/shared/Searchbar";
import Pagination from "@/components/shared/Pagination";
import CommunityCard from "@/components/cards/CommunityCard";
import { useSelector } from "react-redux";
import { RootState } from "@/types";
import { useGetCommunitiesQuery } from "@/redux/features/community/communityApi";

const Page = () => {
  const searchParams = useSearchParams();
  const searchString = searchParams.get("q") || "";
  const pageNumber = +(searchParams?.get("page") ?? 1);

  const { data, isLoading, isError } = useGetCommunitiesQuery({
    searchString,
    pageNumber,
    pageSize: 25,
  });

  const { user } = useSelector((state: RootState) => state.auth);
  if (!user) return null;

  if (!user?.onboarded) redirect("/onboarding");

  const communities = data?.communities || [];

  if (isLoading) return <div>Loading Users</div>;
  if (isError) return <div>Error loading Users</div>;

  return (
    <>
      <h1 className="head-text">Communities</h1>

      <div className="mt-5">
        <Searchbar routeType="communities" />
      </div>

      <section className="mt-9 flex flex-wrap gap-4">
        {communities.length === 0 ? (
          <p className="no-result">No Result</p>
        ) : (
          <>
            {communities.map((community: any) => (
              <CommunityCard
                key={community._id}
                id={community._id}
                name={community.name}
                username={community.username}
                avatar={community.avatar?.url || ""}
                bio={community.bio}
                members={community.members}
              />
            ))}
          </>
        )}
      </section>

      <Pagination
        path="communities"
        pageNumber={pageNumber}
        isNext={data?.isNext}
      />
    </>
  );
};

export default Page;
