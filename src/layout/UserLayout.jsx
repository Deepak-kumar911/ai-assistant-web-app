import { useSelector } from 'react-redux';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getToken } from '../utils/helperFunction';
export default function UserLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const {theme,sidebarOpen} = useSelector(state=>state?.ui)
  const {login} = useSelector(state=>state?.auth)

  useEffect(()=>{
    if(!login || !getToken()){
      navigate("/sign-in")
    }
  },[location?.pathname])


  if(!login || !getToken()){
    return
  }

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
