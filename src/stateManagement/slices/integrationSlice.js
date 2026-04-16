import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  details: null,
};

const integrationSlice = createSlice({
  name: "integration",
  initialState,
  reducers: {
    setIntegrationDetail: (state, action) => {
      state.details = action.payload;
    },
    resentIntegrationDetail: () => initialState,
  },
});

export const { 
    setIntegrationDetail, 
    resentIntegrationDetail, 
   } = integrationSlice.actions;

export default integrationSlice.reducer;
