import { apiSlice } from "../api/apiSlice";
import { getThreadsFromResult } from "../../helper";

export const threadApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createThread: builder.mutation({
      query: (data) => ({
        url: "create-thread",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Thread", id: "LIST" }],
    }),
    getThreads: builder.query({
      query: ({ page = 1, limit = 6 }) => ({
        url: `threads?page=${page}&limit=${limit}`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...(result ? getThreadsFromResult(result) : []),
        { type: "Thread", id: "LIST" },
      ],
    }),
    addCommentToThread: builder.mutation({
      query: (data) => ({
        url: "comment",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Thread", id: "LIST" }],
    }),
    getAllChildThreads: builder.query({
      query: () => ({
        url: "child-threads",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getThreadsFromResult(result),
        { type: "Thread", id: "LIST" },
      ],
    }),
    getThreadById: builder.query({
      query: (threadId) => ({
        url: `thread/${threadId}`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getThreadsFromResult(result),
        { type: "Thread", id: "LIST" },
      ],
    }),
    likeThread: builder.mutation({
      query: (threadId) => ({
        url: `like-thread/${threadId}`,
        method: "PUT",
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Thread", id: "LIST" }],
    }),
    deleteThread: builder.mutation({
      query: (threadId) => ({
        url: `delete-thread/${threadId}`,
        method: "DELETE",
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Thread", id: "LIST" }],
    }),
  }),
});

export const {
  useCreateThreadMutation,
  useAddCommentToThreadMutation,
  useGetAllChildThreadsQuery,
  useGetThreadByIdQuery,
  useGetThreadsQuery,
  useDeleteThreadMutation,
  useLikeThreadMutation,
} = threadApi;
