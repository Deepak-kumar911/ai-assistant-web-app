import { createContext, useContext, useEffect, useState } from "react";
import { themes } from "../utils/constant";

// Create the context
const AppContext = createContext({
    login: false,
    details: null,
    subscription: null,
    sidebarOpen: null,
    mobileSidebarOpen: null,
    currentTheme: null,
    activeNavItem: null,
    notifications: [],
    theme: null,
    toggleSidebar: null,
    toggleMobileSidebar: null
});

// Provider component
export const AppProvider = ({ children }) => {
    const [login, setLogin] = useState(false);
    const [details, setDetails] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState('dark');
    const [notifications, setNotifications] = useState([]);
    const theme = themes[currentTheme];
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setMobileSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <AppContext.Provider value={{
            login, setLogin, details, setDetails, subscription, setSubscription,
            sidebarOpen, setSidebarOpen, mobileSidebarOpen, setMobileSidebarOpen, currentTheme, setCurrentTheme,
            notifications, setNotifications, theme, toggleSidebar, toggleMobileSidebar
        }}>
            {children}
        </AppContext.Provider>
    );
};

// Hook to use the context
export const useAppContext = () => {
    return useContext(AppContext);
};
