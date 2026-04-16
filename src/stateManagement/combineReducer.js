import {  combineReducers } from "@reduxjs/toolkit";
import {persistReducer,} from "redux-persist";
import storage from "redux-persist/lib/storage";

import uiReducer from "./slices/uiSlice";
import authReducer from "./slices/authSlice";
import notificationReducer from "./slices/notificationSlice";
import aiAgentReducer from "./slices/aiAgentSlice"
import integrationReducer from "./slices/integrationSlice"

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["ui", "auth","ai_agent","integration"], 
};

const rootReducer = combineReducers({
  ui: uiReducer,
  auth: authReducer,
  notifications: notificationReducer,
  ai_agent:aiAgentReducer,
  integration:integrationReducer
});

export const persistedReducer = persistReducer(persistConfig, rootReducer);
