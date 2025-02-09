"use client";

import { RootState } from "@/types";
// import { OrganizationSwitcher, SignedIn, SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";

const Topbar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <nav className="topbar">
      <Link href="/" className="flex items-center gap-4">
        <Image src="/logo.svg" alt="logo" width={28} height={28} />
        <p className="text-heading3-bold text-light-1 max-xs:hidden">Threads</p>
      </Link>

      <div className="flex items-center gap-1">
        <div className="block md:hidden">
          {user && (
            <div className="flex cursor-pointer">
              <Image
                src="/assets/logout.svg"
                alt="logout"
                width={24}
                height={24}
              />
            </div>
          )}
        </div>

        {/* <OrganizationSwitcher
          appearance={{
            baseTheme: dark,
            elements: {
              organizationSwitcherTrigger: "py-2 px-4",
            },
          }}
        /> */}
      </div>
    </nav>
  );
};

export default Topbar;
