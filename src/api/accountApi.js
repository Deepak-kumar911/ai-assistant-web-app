import {
  getApiWithToken,
  postApiWithToken,
  patchApiWithToken,
  deleteApiWithToken,
} from "./apiInterface";

/**
 * Account & Member management API (Tasks 40 & 41, TRD §6.1, REQ-ACCT-02/03)
 */

// List all active members and pending invites for active account
export const listMembersApi = () => {
  return getApiWithToken("account/members");
};

// Invite a member by email with role ('member' | 'owner')
export const inviteMemberApi = (payload) => {
  return postApiWithToken("account/invite", payload);
};

// Update member role (owner <-> member) with live Redis sync
export const updateMemberRoleApi = (userId, payload) => {
  return patchApiWithToken(`account/members/${userId}/role`, payload);
};

// Remove member from account
export const removeMemberApi = (userId) => {
  return deleteApiWithToken(`account/members/${userId}`);
};

// Switch active workspace context (Task 40 & 42)
export const switchAccountApi = (payload) => {
  return postApiWithToken("account/switch", payload);
};

// Get account plan usage and agent limits
export const getAccountUsageApi = () => {
  return getApiWithToken("account/usage");
};
