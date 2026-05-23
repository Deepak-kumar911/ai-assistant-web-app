// stateManagement/slices/uiSlice.ts (Updated)
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  mobileSidebarOpen: false,
  theme: {
    bg: 'bg-gray-50',
    text: 'text-gray-900',
    card: 'bg-white',
    sidebar: 'bg-white',
    primary: 'bg-indigo-600',
    hover: 'hover:bg-gray-100',
    border: 'border-gray-200'
  },
  currentTheme: 'light'
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleMobileSidebar: (state) => {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },
    openMobileSidebar: (state) => {
      state.mobileSidebarOpen = true;
    },
    closeMobileSidebar: (state) => {
      state.mobileSidebarOpen = false;
    },
    setTheme: (state, action) => {
      state.currentTheme = action.payload;
      if (action.payload === 'dark') {
        state.theme = {
          bg: 'bg-gray-900',
          text: 'text-white',
          card: 'bg-gray-800',
          sidebar: 'bg-gray-800',
          primary: 'bg-indigo-500',
          hover: 'hover:bg-gray-700',
          border: 'border-gray-700'
        };
      } else {
        state.theme = {
          bg: 'bg-gray-50',
          text: 'text-gray-900',
          card: 'bg-white',
          sidebar: 'bg-white',
          primary: 'bg-indigo-600',
          hover: 'hover:bg-gray-100',
          border: 'border-gray-200'
        };
      }
    }
  }
});

export const { 
  toggleSidebar, 
  toggleMobileSidebar, 
  openMobileSidebar, 
  closeMobileSidebar, 
  setTheme 
} = uiSlice.actions;
export default uiSlice.reducer;