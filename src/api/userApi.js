import { patchApiWithToken } from "./apiInterface";

/**
 * User Profile API (Task 50)
 * Update user's name and/or avatarUrl
 */
export const updateUserProfileApi = (payload) => {
  return patchApiWithToken("user/profile", payload);
};
