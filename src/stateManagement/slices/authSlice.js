import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  login: false,
  details: null,           // user: { _id, email, name, avatarUrl, authProvider, emailVerified }
  account: null,           // current workspace: { _id, name, plan, role }
  role: null,              // 'owner' | 'admin' | 'operator'
  availableAccounts: [],   // list of workspaces for tenant switching
  subscription: null,
  bootstrapped: false,     // session bootstrap status flag
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLogin: (state, action) => {
      state.login = action.payload;
    },
    setDetails: (state, action) => {
      state.details = action.payload;
    },
    setAccount: (state, action) => {
      state.account = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    setAvailableAccounts: (state, action) => {
      state.availableAccounts = action.payload || [];
    },
    setSubscription: (state, action) => {
      state.subscription = action.payload;
    },
    setBootstrapped: (state, action) => {
      state.bootstrapped = action.payload;
    },
    setSession: (state, action) => {
      const payload = action.payload || {};
      state.login = true;
      state.details = payload.user || payload.details || state.details;
      state.account = payload.account || state.account;
      state.role = payload.role || payload.account?.role || state.role;
      state.availableAccounts = payload.availableAccounts || state.availableAccounts;
      state.bootstrapped = true;
    },
    logout: () => ({
      ...initialState,
      bootstrapped: true,
    }),
  },
});

export const {
  setLogin,
  setDetails,
  setAccount,
  setRole,
  setAvailableAccounts,
  setSubscription,
  setBootstrapped,
  setSession,
  logout,
} = authSlice.actions;

export const selectAuth = (state) => state.auth;
export default authSlice.reducer;
