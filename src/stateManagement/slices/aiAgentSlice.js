import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  details: null,
};

const authSlice = createSlice({
  name: "ai_agent",
  initialState,
  reducers: {
    setAgentDetail: (state, action) => {
      state.details = action.payload;
    },
    resentAgentDetail: () => initialState,
  },
});

export const { 
    setAgentDetail, 
    resentAgentDetail, 
   } = authSlice.actions;

export default authSlice.reducer;
