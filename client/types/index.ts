import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
  code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
  confirmPassword: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
});

export const UserValidation = z.object({
  avatar: z.string().optional(),
  name: z
    .string()
    .min(3, { message: "Minimum 3 characters." })
    .max(30, { message: "Maximum 30 characters." }),
  username: z
    .string()
    .min(3, { message: "Minimum 3 characters." })
    .max(30, { message: "Maximum 30 characters." }),
  bio: z
    .string()
    .min(3, { message: "Minimum 3 characters." })
    .max(1000, { message: "Maximum 1000 characters." }),
});

export const ThreadValidation = z.object({
  thread: z.string().nonempty().min(3, { message: "Minimum 3 characters." }),
  accountId: z.string(),
});

export const CommentValidation = z.object({
  thread: z.string().nonempty().min(3, { message: "Minimum 3 characters." }),
});

interface Avatar {
  public_id: string;
  url: string;
}

export interface User {
  _id: string;
  avatar?: Avatar | null;
  username?: string;
  email?: string;
  name?: string;
  bio?: string;
  onboarded?: boolean;
  saved?: string[];
  followers?: string[];
  following?: string[];
  threads?: string[];
  communities?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RootState {
  auth: {
    user: User | null;
  };
}

// Community Types
export interface ICommunity {
  _id: string;
  username: string;
  name: string;
  avatar?: Avatar;
  bio?: string;
  createdBy: string; // User ID
  threads: string[];
  members: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Thread Types (based on your previous components)
export interface IThread {
  _id: string;
  text: string;
  author: {
    _id: string;
    name: string;
    avatar: string;
  };
  community?: {
    _id: string;
    name: string;
    avatar: string;
  } | null;
  parentId?: string | null;
  children: IThread[];
  createdAt: string;
}

// API Response Types
export interface UserResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CommunityResponse {
  communities: ICommunity[];
  total: number;
  page: number;
  pageSize: number;
}

// Utility Types for Queries
export interface PaginationParams {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
}
