"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useDeleteThreadMutation } from "@/redux/features/thread/threadApi";

interface Props {
  threadId: string;
  currentUserId: string;
  authorId: string;
  parentId: string | null;
  isComment?: boolean;
}

const DeleteThread = ({
  threadId,
  currentUserId,
  authorId,
  parentId,
  isComment,
}: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const [deleteThread, { isLoading }] = useDeleteThreadMutation();

  if (currentUserId !== authorId || pathname === "/") return null;

  const handleDelete = async () => {
    try {
      // Parse threadId if it's a string, otherwise use as is
      const parsedThreadId = typeof threadId === 'string' ? JSON.parse(threadId) : threadId;
      
      await deleteThread(parsedThreadId).unwrap();

      // If this is a main thread (not a comment) or has no parent, redirect to home
      if (!parentId || !isComment) {
        router.push("/");
      }
    } catch (error) {
      console.error('Failed to delete thread:', error);
    }
  };

  return (
    <Image
      src="/assets/delete.svg"
      alt="delete"
      width={18}
      height={18}
      className={`cursor-pointer object-contain ${isLoading ? 'opacity-50' : ''}`}
      onClick={handleDelete}
      style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
    />
  );
};

export default DeleteThread;