import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  login: false,
  details: null,
  subscription: null,
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
    setSubscription: (state, action) => {
      state.subscription = action.payload;
    },
    logout: () => initialState,
  },
});

export const { 
    setLogin, 
    setDetails, 
    setSubscription, 
    logout } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export default authSlice.reducer;
