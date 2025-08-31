import { createSlice } from "@reduxjs/toolkit";
import { themes } from "../../utils/constant";

const initialState = {
  sidebarOpen: true,
  mobileSidebarOpen: false,
  currentTheme: "dark",
  theme:themes["dark"]
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleMobileSidebar: (state) => {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },
    setTheme: (state, action) => {
      state.currentTheme = action.payload;
      state.theme = themes[action?.payload]
    },
    resetUI: () => initialState,
  },
});

export const { toggleSidebar, toggleMobileSidebar, setTheme, resetUI } =
  uiSlice.actions;
export default uiSlice.reducer;
