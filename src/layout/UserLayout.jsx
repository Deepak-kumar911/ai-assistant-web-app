// layouts/UserLayout.tsx (Complete working version)
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getToken } from '../utils/helperFunction';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import MobileNavigation from '../components/layout/MobileNavigation';
import { AnimatePresence, motion } from 'framer-motion';
import { closeMobileSidebar } from '../stateManagement/slices/uiSlice';

export default function UserLayout({children}) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sidebarOpen, mobileSidebarOpen } = useSelector((state) => state?.ui);
  const { login } = useSelector((state) => state?.auth);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Close mobile sidebar when switching to desktop
      if (!mobile && mobileSidebarOpen) {
        dispatch(closeMobileSidebar());
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [dispatch, mobileSidebarOpen]);

  useEffect(() => {
    if (!login || !getToken()) {
      navigate('/sign-in');
    }
  }, [location?.pathname, login, navigate]);

  if (!login || !getToken()) {
    return null;
  }

  // Calculate margin only for desktop
  const getMarginLeft = () => {
    if (isMobile) return '0rem';
    return sidebarOpen ? '16rem' : '5rem';
  };

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-[#0A0A0B] text-gray-200">
      {/* Animated gradient orbs */}
      <div className="fixed top-0 -left-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed bottom-0 -right-48 w-96 h-96 bg-violet-500/10 rounded-full blur-[128px] pointer-events-none" />
      
      <div className="relative flex flex-1 min-h-0">
        {/* Sidebar - visible on both mobile and desktop but controlled differently */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div 
          className="relative flex flex-col flex-1 min-w-0 transition-all duration-300"
          style={{ marginLeft: getMarginLeft() }}
        >
          <Header />
          <main className="flex-1 overflow-y-auto custom-scrollbar pb-20 md:pb-6">
            <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                 {children || <Outlet />}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
}