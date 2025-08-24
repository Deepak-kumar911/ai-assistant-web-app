import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { useAppContext } from '../context/AppContext';
export default function UserLayout({ children }) {
  const { theme, sidebarOpen } = useAppContext()


  return (
    <div className={`relative flex h-screen overflow-hidden transition-colors duration-300 ${theme.bg} ${theme.text}`}>
      <Sidebar />
      <div className={`ml-0 transition-all duration-300 ease-in-out w-full ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <Header />
        <main className="flex-1 overflow-y-auto p-6" style={{height:'100vh'}}>
          {children}
        </main>
      </div>
    </div>
  );
}
