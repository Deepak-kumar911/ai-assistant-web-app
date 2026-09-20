import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../stateManagement/store";
import { ToastProvider } from "../components/ui";

export default function AppWrapper({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </PersistGate>
    </Provider>
  );
}
