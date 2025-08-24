
import { useAppContext } from '../../context/AppContext'

import {
    FiMenu, FiX, FiHome, FiPieChart, FiUsers, FiSettings, FiLogOut,
} from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
    { url: '/dashboard', icon: <FiHome size={20} />, text: 'Dashboard' },
    { url: '/ai-agent', icon: <FiPieChart size={20} />, text: 'AI Agents' },
    { url: '/form', icon: <FiUsers size={20} />, text: 'Form' },
    { url: '/settings', icon: <FiSettings size={20} />, text: 'Settings' },
];

export default function Sidebar() {
    const { theme, toggleMobileSidebar, mobileSidebarOpen, sidebarOpen, toggleSidebar } = useAppContext()
    const location = useLocation()
    const navigate = useNavigate()

    return (
        <>
            {mobileSidebarOpen && (
                <div className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden" onClick={toggleMobileSidebar}></div>
            )}

            <aside
                className={`fixed z-40 top-0 left-0 h-full ${theme.sidebar} shadow-xl transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
            >
                <div className="flex flex-col h-full">
                    <div className={`flex items-center p-4 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
                        {sidebarOpen && <h1 className="text-xl font-bold tracking-wide">ProUI</h1>}
                        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-200 md:block hidden">
                            {sidebarOpen ? <FiX /> : <FiMenu />}
                        </button>
                        <button onClick={toggleMobileSidebar} className="p-2 rounded-md hover:bg-gray-200 md:hidden">
                            <FiX />
                        </button>
                    </div>

                    <nav className="flex-1 px-2 mt-6 space-y-2">
                        {navItems.map((item) => (
                            <button
                                key={item?.url}
                                onClick={() => navigate(item?.url)}
                                className={`flex items-center w-full gap-3 p-3 rounded-xl transition-all duration-200
                  ${location?.pathname.includes(item?.url) ? `${theme?.primary} text-white` : theme?.hover}`}
                            >
                                {item?.icon}
                                {sidebarOpen && <span className="text-sm font-medium">{item?.text}</span>}
                            </button>
                        ))}
                    </nav>

                    <div className={`p-4 border-t ${theme?.border} flex ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
                        {sidebarOpen && (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">JP</div>
                                <div>
                                    <p className="text-sm font-medium">John Parker</p>
                                    <p className="text-xs text-gray-400">Admin</p>
                                </div>
                            </div>
                        )}
                        <button className="p-2 rounded-md hover:bg-gray-100">
                            <FiLogOut />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}
