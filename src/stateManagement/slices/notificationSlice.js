import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotification:(state,action) =>{
      state.notifications = action?.payload
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { 
    setNotification,
    addNotification, 
    clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
