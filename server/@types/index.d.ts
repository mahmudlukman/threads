// ====== USER PARAMS
export type CreateUserParams = {
  name: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
};

export type UpdateUserParams = {
  name: string;
  username: string;
  avatar?: string;
};

// ====== THREAD PARAMS
export type CreateThreadParams = {
  text: string;
  author: string;
  communityId: string | null;
  image?: {
    public_id: string;
    url: string;
  };
};

export type addCommentToThreadParams = {
  threadId: string;
  userId: string;
};

export type DeleteThreadParams = {
  threadId: string;
};

export type GetAllThreadsParams = {
  query: string;
  limit: number;
  page: number;
};

export type GetAllThreadsByIdParams = {
  threadId: string;
};

export type GetAllChildThreadsParams = {
  threadId: string;
};
