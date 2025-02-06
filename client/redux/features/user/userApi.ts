import { apiSlice } from "../api/apiSlice";
import { getUsersFromResult } from "../../helper";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserInfo: builder.query({
      query: ({ userId }) => ({
        url: `get-user/${userId}`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result, error, arg) => [{ type: "User", id: arg.userId }],
    }),
    getUsers: builder.query({
      query: ({ searchString, pageNumber, pageSize, sortBy }) => ({
        url: "get-users",
        method: "GET",
        params: {
          searchString,
          pageNumber,
          pageSize,
          sortBy,
        },
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...(result?.users
          ? result.users.map(({ _id }: { _id: string }) => ({
              type: "User" as const,
              id: _id,
            }))
          : []),
        { type: "User" as const, id: "LIST" },
      ],
    }),
    getUserThreads: builder.query({
      query: ({ userId }) => ({
        url: `user-threads/${userId}`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getUsersFromResult(result),
        { type: "User", id: "LIST" },
      ],
    }),
    getActivity: builder.query({
      query: ({ userId }) => ({
        url: `get-activity/${userId}`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getUsersFromResult(result),
        { type: "User", id: "LIST" },
      ],
    }),
    updateUserProfile: builder.mutation({
      query: ({ data }) => ({
        url: "update-user",
        method: "PUT",
        body: data,
        formData: true,
        credentials: "include" as const,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "User", id: arg.data.id },
        { type: "User", id: "LIST" },
      ],
    }),
    getSavedThreads: builder.query({
      query: ({ userId, searchQuery, filter, page, pageSize }) => ({
        url: `saved-thread/${userId}`,
        method: "GET",
        params: {
          searchQuery,
          filter,
          page,
          pageSize,
        },
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getUsersFromResult(result).filter((tag) => tag.type === "User"),
        { type: "User", id: "SAVED_THREADS" },
      ],
    }),
    toggleSavedThread: builder.mutation({
      query: (threadId) => ({
        url: `toggle-save-thread/${threadId}`,
        method: "POST",
        credentials: "include" as const,
      }),
      invalidatesTags: () => [{ type: "User", id: "SAVED_THREADS" }],
    }),
    follow: builder.mutation({
      query: (userToFollowId) => ({
        url: `follow/${userToFollowId}`,
        method: "PUT",
        credentials: "include" as const,
      }),
      invalidatesTags: () => [{ type: "User", id: "LIST" }],
    }),
    unfollow: builder.mutation({
      query: (userToUnFollowId) => ({
        url: `unfollow/${userToUnFollowId}`,
        method: "PUT",
        credentials: "include" as const,
      }),
      invalidatesTags: () => [{ type: "User", id: "LIST" }],
    }),
    getFollowers: builder.query({
      query: ({ userId }) => ({
        url: `get-followers/${userId}`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result, error, arg) => [{ type: "User", id: arg.userId }],
    }),
    getFollowings: builder.query({
      query: ({ userId }) => ({
        url: `get-followings/${userId}`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result, error, arg) => [{ type: "User", id: arg.userId }],
    }),
  }),
});

export const {
  useGetUserInfoQuery,
  useUpdateUserProfileMutation,
  useGetUsersQuery,
  useFollowMutation,
  useGetActivityQuery,
  useGetFollowersQuery,
  useGetFollowingsQuery,
  useGetSavedThreadsQuery,
  useGetUserThreadsQuery,
  useToggleSavedThreadMutation,
  useUnfollowMutation,
} = userApi;
