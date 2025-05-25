import { createContext, useContext, useState } from "react";

// Create the context
const AppContext = createContext({
    login: false,
    details: null,
    subscription: null
});

// Provider component
export const AppProvider = ({ children }) => {
    const [login, setLogin] = useState(false);
    const [details, setDetails] = useState(null);
    const [subscription, setSubscription] = useState(null);

    return (
        <AppContext.Provider value={{ login, setLogin, details, setDetails, subscription, setSubscription }}>
            {children}
        </AppContext.Provider>
    );
};

// Hook to use the context
export const useAppContext = () => {
    return useContext(AppContext);
};
