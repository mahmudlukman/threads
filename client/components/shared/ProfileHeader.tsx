import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/types";

interface Props {
  name: string;
  username: string;
  avatar: string;
  bio: string;
  type?: string;
}

// Function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const ProfileHeader = ({ name, username, avatar, bio, type }: Props) => {
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <div className="flex w-full flex-col justify-start">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-20 w-20 object-cover">
            {avatar ? (
              <Image
                src={avatar}
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

          <div className="flex-1">
            <h2 className="text-left text-heading3-bold text-light-1">
              {name}
            </h2>
            <p className="text-base-medium text-gray-1">@{username}</p>
          </div>
        </div>
        {user?._id && type !== "Community" && (
          <Link href="/profile/edit">
            <div className="flex cursor-pointer gap-3 rounded-lg bg-dark-3 px-4 py-2">
              <Image
                src="/assets/edit.svg"
                alt="logout"
                width={16}
                height={16}
              />

              <p className="text-light-2 max-sm:hidden">Edit</p>
            </div>
          </Link>
        )}
      </div>

      <p className="mt-6 max-w-lg text-base-regular text-light-2">{bio}</p>

      <div className="mt-12 h-0.5 w-full bg-dark-3" />
    </div>
  );
};

export default ProfileHeader;
