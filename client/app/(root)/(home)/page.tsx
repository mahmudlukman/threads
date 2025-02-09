"use client"

import { useGetThreadsQuery } from "@/redux/features/thread/threadApi";
import { redirect } from "next/navigation";
import ThreadCard from "@/components/cards/ThreadCard";
import Pagination from "@/components/shared/Pagination";
import { useSelector } from "react-redux";
import { IThread, RootState } from "@/types";

const THREADS_PER_PAGE = 6; // Match the default limit from your API

const Home = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const currentPage = searchParams.page ? +searchParams.page : 1;
  
  // Using RTK Query hook with pagination parameters
  const { data: result, isLoading, error } = useGetThreadsQuery({
    page: currentPage,
    limit: THREADS_PER_PAGE,
  });

  if (!user) return null;

  if (!user.onboarded) redirect("/onboarding");

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading threads</div>;
  }

  const threads = result?.threads || [];
  const totalPages = result?.totalPages || 1;

  return (
    <>
      <h1 className='head-text text-left'>Home</h1>
      <section className='mt-9 flex flex-col gap-10'>
        {threads.length === 0 ? (
          <p className='no-result'>No threads found</p>
        ) : (
          <>
            {threads.map((thread: IThread) => (
              <ThreadCard
                key={thread._id}
                id={thread._id}
                currentUserId={user?._id}
                parentId={thread.parentId ?? null}
                content={thread.text}
                author={{ ...thread.author, id: thread.author._id }}
                community={thread.community ? { id: thread.community._id, name: thread.community.name, avatar: thread.community.avatar } : null}
                createdAt={thread.createdAt}
                comments={thread.children}
              />
            ))}
          </>
        )}
      </section>
      <Pagination
        path='/'
        pageNumber={currentPage}
        isNext={currentPage < totalPages}
      />
    </>
  );
};

export default Home;