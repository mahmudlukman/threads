import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

interface AvatarData {
  public_id?: string;
  url?: string;
}

interface Member {
  avatar?: string | AvatarData;
  name: string;
}

interface Props {
  id: string;
  name: string;
  username: string;
  avatar: string | AvatarData;
  bio: string;
  members: Member[];
}

// Function to get initials from a name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Function to get avatar URL
const getAvatarUrl = (avatar?: string | AvatarData) => {
  if (!avatar) return null;
  if (typeof avatar === "string") return avatar;
  return avatar.url || null;
};

const CommunityCard = ({ id, name, username, avatar, bio, members }: Props) => {
  const avatarUrl = getAvatarUrl(avatar);

  return (
    <article className="community-card">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/communities/${id}`} className="relative h-12 w-12">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="community_avatar"
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="h-full w-full rounded-full bg-gray-500 flex items-center justify-center">
              <span className="text-base-semibold text-light-1">
                {getInitials(name)}
              </span>
            </div>
          )}
        </Link>

        <div>
          <Link href={`/communities/${id}`}>
            <h4 className="text-base-semibold text-light-1">{name}</h4>
          </Link>
          <p className="text-small-medium text-gray-1">@{username}</p>
        </div>
      </div>

      <p className="mt-4 text-subtle-medium text-gray-1">{bio}</p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/communities/${id}`}>
          <Button size="sm" className="community-card_btn">
            View
          </Button>
        </Link>

        {members.length > 0 && (
          <div className="flex items-center">
            {members.slice(0, 3).map((member, index) => {
              const memberAvatarUrl = getAvatarUrl(member.avatar);
              return memberAvatarUrl ? (
                <Image
                  key={index}
                  src={memberAvatarUrl}
                  alt={`member_${index}`}
                  width={28}
                  height={28}
                  className={`${
                    index !== 0 && "-ml-2"
                  } rounded-full object-cover`}
                />
              ) : (
                <div
                  key={index}
                  className={`w-7 h-7 rounded-full bg-gray-500 flex items-center justify-center ${
                    index !== 0 ? "-ml-2" : ""
                  }`}
                >
                  <span className="text-xs font-normal text-white">
                    {getInitials(member.name)}
                  </span>
                </div>
              );
            })}
            {members.length > 3 && (
              <p className="ml-1 text-subtle-medium text-gray-1">
                {members.length}+ Users
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default CommunityCard;
