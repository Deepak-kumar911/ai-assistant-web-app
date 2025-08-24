import React, { useEffect, useState } from 'react'
import { FiBell, FiChevronDown, FiMenu, FiSearch } from 'react-icons/fi'
import { useAppContext } from '../../context/AppContext'

export default function Header() {
    const { theme, toggleMobileSidebar, currentTheme, setCurrentTheme } = useAppContext()
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        setNotifications([
            { id: 1, message: 'New user registered', time: '2 mins ago', read: false },
            { id: 2, message: 'System update available', time: '1 hour ago', read: true },
            { id: 3, message: 'Your report is ready', time: '3 hours ago', read: true },
        ]);
    }, []);

    return (
        <header className={`flex items-center justify-between px-6 py-2 sticky top-0 z-10 ${theme.card} shadow-sm`}>
            <div className="flex items-center gap-4">
                <button onClick={toggleMobileSidebar} className="p-2 rounded-md hover:bg-gray-200 md:hidden">
                    <FiMenu />
                </button>
                <div className="relative">
                    <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => setCurrentTheme(currentTheme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-gray-200">
                    {currentTheme === 'dark' ? '☀️' : '🌙'}
                </button>
                <div className="relative">
                    <FiBell className="text-xl cursor-pointer" />
                    {notifications.some(n => !n.read) && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full text-white flex items-center justify-center">JP</div>
                    <span className="hidden md:inline">John</span>
                    <FiChevronDown className="hidden md:inline" />
                </div>
            </div>
        </header>
    )
}
