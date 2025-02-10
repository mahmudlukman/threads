import Image from "next/image";
import Link from "next/link";

import { formatDateString } from "@/lib/utils";
import DeleteThread from "../forms/DeleteThread";

interface Props {
  id: string;
  currentUserId: string;
  parentId: string | null;
  content: string;
  image?: {
    public_id: string;
    url: string;
  };
  author: {
    name: string;
    avatar: string | { url: string };
    id: string;
  };
  community: {
    id: string;
    name: string;
    avatar: string | { url: string };
  } | null;
  createdAt: string;
  comments: {
    author: {
      avatar: string | { url: string };
    };
  }[];
  isComment?: boolean;
}

const ThreadCard = ({
  id,
  currentUserId,
  parentId,
  content,
  image,
  author,
  community,
  createdAt,
  comments,
  isComment,
}: Props) => {
  // Helper function to get initials
  console.log('Thread Image Data:', image);
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to get avatar URL
  const getAvatarUrl = (avatar: string | { url: string } | undefined) => {
    if (!avatar) return "";
    if (typeof avatar === "string") return avatar;
    return avatar.url || "";
  };

  const authorAvatarUrl = getAvatarUrl(author.avatar);
  const communityAvatarUrl = community ? getAvatarUrl(community.avatar) : "";

  return (
    <article
      className={`flex w-full flex-col rounded-xl ${
        isComment ? "px-0 xs:px-7" : "bg-dark-2 p-7"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex w-full flex-1 flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
              {authorAvatarUrl ? (
                <Image
                  src={authorAvatarUrl}
                  alt="user_community_image"
                  fill
                  className="cursor-pointer rounded-full object-cover"
                />
              ) : (
                <div className="h-full w-full rounded-full bg-gray-500 flex items-center justify-center">
                  <span className="text-base-semibold text-light-1">
                    {getInitials(author.name)}
                  </span>
                </div>
              )}
            </Link>

            <div className="thread-card_bar" />
          </div>

          <div className="flex w-full flex-col">
            <Link href={`/profile/${author.id}`} className="w-fit">
              <h4 className="cursor-pointer text-base-semibold text-light-1">
                {author.name}
              </h4>
            </Link>

            <p className="mt-2 text-small-regular text-light-2">{content}</p>

            {/* Thread Image Section */}
            {image?.url && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-gray-700">
                <div className="relative w-full">
                  <div style={{ paddingTop: "56.25%" }} className="relative">
                    <Image
                      src={image.url}
                      alt="Thread image"
                      fill
                      className="object-contain absolute top-0 left-0"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className={`${isComment && "mb-10"} mt-5 flex flex-col gap-3`}>
              <div className="flex gap-3.5">
                <Image
                  src="/assets/heart-gray.svg"
                  alt="heart"
                  width={24}
                  height={24}
                  className="cursor-pointer object-contain"
                />
                <Link href={`/thread/${id}`}>
                  <Image
                    src="/assets/reply.svg"
                    alt="reply"
                    width={24}
                    height={24}
                    className="cursor-pointer object-contain"
                  />
                </Link>
                <Image
                  src="/assets/repost.svg"
                  alt="repost"
                  width={24}
                  height={24}
                  className="cursor-pointer object-contain"
                />
                <Image
                  src="/assets/share.svg"
                  alt="share"
                  width={24}
                  height={24}
                  className="cursor-pointer object-contain"
                />
              </div>

              {isComment && comments.length > 0 && (
                <Link href={`/thread/${id}`}>
                  <p className="mt-1 text-subtle-medium text-gray-1">
                    {comments.length} repl{comments.length > 1 ? "ies" : "y"}
                  </p>
                </Link>
              )}
            </div>
          </div>
        </div>

        <DeleteThread
          threadId={JSON.stringify(id)}
          currentUserId={currentUserId}
          authorId={author.id}
          parentId={parentId}
          isComment={isComment}
        />
      </div>

      {!isComment && comments.length > 0 && (
        <div className="ml-1 mt-3 flex items-center gap-2">
          {comments.slice(0, 2).map((comment, index) => {
            const commentAvatarUrl = getAvatarUrl(comment.author.avatar);
            return (
              <div key={index} className="relative w-6 h-6">
                {commentAvatarUrl ? (
                  <Image
                    src={commentAvatarUrl}
                    alt={`user_${index}`}
                    fill
                    className={`${
                      index !== 0 && "-ml-5"
                    } rounded-full object-cover`}
                  />
                ) : (
                  <div
                    className={`${
                      index !== 0 && "-ml-5"
                    } w-full h-full rounded-full bg-gray-500 flex items-center justify-center`}
                  >
                    <span className="text-xs text-light-1">
                      {getInitials("User")}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          <Link href={`/thread/${id}`}>
            <p className="mt-1 text-subtle-medium text-gray-1">
              {comments.length} repl{comments.length > 1 ? "ies" : "y"}
            </p>
          </Link>
        </div>
      )}

      {!isComment && community && (
        <Link
          href={`/communities/${community.id}`}
          className="mt-5 flex items-center"
        >
          <p className="text-subtle-medium text-gray-1">
            {formatDateString(createdAt)}
            {community && ` - ${community.name} Community`}
          </p>

          <div className="relative ml-1 h-4 w-4">
            {communityAvatarUrl ? (
              <Image
                src={communityAvatarUrl}
                alt={community.name}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="h-full w-full rounded-full bg-gray-500 flex items-center justify-center">
                <span className="text-[8px] text-light-1">
                  {getInitials(community.name)}
                </span>
              </div>
            )}
          </div>
        </Link>
      )}
    </article>
  );
};

export default ThreadCard;
