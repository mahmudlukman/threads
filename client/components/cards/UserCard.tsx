"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface AvatarData {
  public_id?: string;
  url?: string;
}

interface Props {
  id: string;
  name: string;
  username: string;
  avatar: string | AvatarData;
  personType: string;
}

const UserCard = ({ id, name, username, avatar, personType }: Props) => {
  const router = useRouter();

  const isCommunity = personType === "Community";

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarUrl = (avatar: string | AvatarData) => {
    if (!avatar) return "";
    if (typeof avatar === "string") return avatar;
    return avatar.url || "";
  };

  const avatarUrl = getAvatarUrl(avatar);

  return (
    <article className="user-card">
      <div className="user-card_avatar">
        <div className="relative h-12 w-12">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="user_logo"
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
        </div>

        <div className="flex-1 text-ellipsis">
          <h4 className="text-base-semibold text-light-1">{name}</h4>
          <p className="text-small-medium text-gray-1">@{username}</p>
        </div>
      </div>

      <Button
        className="user-card_btn"
        onClick={() => {
          if (isCommunity) {
            router.push(`/communities/${id}`);
          } else {
            router.push(`/profile/${id}`);
          }
        }}
      >
        View
      </Button>
    </article>
  );
}

export default UserCard;
