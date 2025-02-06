import { apiSlice } from "../api/apiSlice";
import { getCommunitiesFromResult } from "../../helper";

export const communityApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCommunity: builder.mutation({
      query: (data) => ({
        url: "create-community",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Community", id: "LIST" }],
    }),
    getCommunityDetails: builder.query({
      query: ({ id }) => ({
        url: `community/${id}`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getCommunitiesFromResult(result),
        { type: "Community", id: "LIST" },
      ],
    }),
    getCommunityPosts: builder.query({
      query: ({ id }) => ({
        url: `community/${id}`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getCommunitiesFromResult(result),
        { type: "Community", id: "LIST" },
      ],
    }),
    getCommunities: builder.query({
      query: ({ searchString, pageNumber, pageSize, sortBy }) => ({
        url: "communities",
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
        ...getCommunitiesFromResult(result),
        { type: "Community", id: "LIST" },
      ],
    }),
    joinCommunity: builder.mutation({
      query: (communityId) => ({
        url: `community/join/${communityId}`,
        method: "PUT",
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Community", id: "LIST" }],
    }),
    leaveCommunity: builder.mutation({
      query: (communityId) => ({
        url: `community/leave/${communityId}`,
        method: "PUT",
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Community", id: "LIST" }],
    }),
    updateCommunity: builder.mutation({
      query: (data) => ({
        url: `update-community/${data.id}`,
        method: "PUT",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Community", id: "LIST" }],
    }),
    deleteCommunity: builder.mutation({
      query: (communityId) => ({
        url: `delete-community/${communityId}`,
        method: "DELETE",
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Community", id: "LIST" }],
    }),
  }),
});

export const {
  useCreateCommunityMutation,
  useGetCommunityDetailsQuery,
  useGetCommunityPostsQuery,
  useGetCommunitiesQuery,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
  useUpdateCommunityMutation,
  useDeleteCommunityMutation,
} = communityApi;
