import {
    FiMenu, FiX,FiLogOut,
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { toggleMobileSidebar, toggleSidebar } from '../../stateManagement/slices/uiSlice';
import { integrationConfigs } from '../../config/integrations/integration';

export default function IntegrationSidebar() {
    const dispatch = useDispatch()
    const { theme, mobileSidebarOpen, sidebarOpen } = useSelector(state => state?.ui)
    const location = useLocation()
    const { platform } = useParams();


    if (!platform || !integrationConfigs[platform]) {
        return <div className="p-6">Platform not supported</div>;
    }

    const { name, sidebar } = integrationConfigs[platform];

    return (
        <>
            {mobileSidebarOpen && (<div className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden" onClick={() => dispatch(toggleMobileSidebar())}></div>)}
            <aside
                className={`fixed z-40 top-0 left-0 h-full ${theme.sidebar} shadow-xl transform transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-20'} ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} `}>
                <div className="flex flex-col h-full">
                    <div className={`flex items-center p-4 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
                        {sidebarOpen && <h1 className="text-xl font-bold tracking-wide">Assistant AI</h1>}
                        <button onClick={() => dispatch(toggleSidebar())} className="p-2 rounded-md hover:bg-gray-200 md:block hidden">
                            {sidebarOpen ? <FiX /> : <FiMenu />}
                        </button>
                        <button onClick={() => dispatch(toggleMobileSidebar())} className="p-2 rounded-md hover:bg-gray-200 md:hidden">
                            <FiX />
                        </button>
                    </div>

                    <nav className="flex-1 px-2 mt-6 space-y-2">
                       {sidebarOpen && <div className="font-bold text-lg border-b">{name}</div>}
                        {sidebar?.filter(ele=>ele?.isSidebar)?.map((item) => {
                            const Icon = item.icon;
                            return <NavLink
                                key={item.path}
                                to={`/integration/${platform}/${item.path}`}
                                className={`flex items-center w-full gap-3 p-3 rounded-xl transition-all duration-200 ${location?.pathname.includes(item?.path) ? `${theme?.primary} text-white` : theme?.hover}`} >
                                 <Icon size={item?.iconSize} />
                                {sidebarOpen && <span className="text-sm font-medium">{item?.label}</span>}
                            </NavLink>
                        })}
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
