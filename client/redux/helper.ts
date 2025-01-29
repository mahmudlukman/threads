/* eslint-disable @typescript-eslint/no-explicit-any */
type EntityType =
  | "Community"
  | "Thread"
  | "Notification"
  | "User"
  | "Interaction";

export const getEntitiesFromResult = <T extends EntityType>(
  result: any,
  entityType: T
): Array<{ type: T; id: string | number }> => {
  if (Array.isArray(result)) {
    return result.map(({ id }) => ({ type: entityType, id }));
  }
  if (result && typeof result === "object" && "id" in result) {
    return [{ type: entityType, id: result.id }];
  }
  return [];
};

// Usage examples:
export const getCommunitiesFromResult = (result: any) =>
  getEntitiesFromResult(result, "Community");

export const getThreadsFromResult = (result: any) =>
  getEntitiesFromResult(result, "Thread");

export const getNotificationsFromResult = (result: any) =>
  getEntitiesFromResult(result, "Notification");

export const getUsersFromResult = (result: any) =>
  getEntitiesFromResult(result, "User");

export const getInteractionsFromResult = (result: any) =>
  getEntitiesFromResult(result, "Interaction");
