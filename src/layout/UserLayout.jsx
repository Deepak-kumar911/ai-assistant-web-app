// layouts/UserLayout.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import MobileNavigation from '../components/layout/MobileNavigation';
import { AnimatePresence, motion } from 'framer-motion';
import { closeMobileSidebar } from '../stateManagement/slices/uiSlice';

export default function UserLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sidebarOpen, mobileSidebarOpen } = useSelector((state) => state?.ui);
  const { login } = useSelector((state) => state?.auth);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

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
    if (!login) {
      navigate('/sign-in');
    }
  }, [location?.pathname, login, navigate]);

  if (!login) {
    return null;
  }

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-[#080C14] text-[#F8FAFC] font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Dynamic Ambient Background Lights */}
      <div 
        aria-hidden="true" 
        className="fixed top-0 -left-48 w-96 sm:w-[32rem] h-96 sm:h-[32rem] bg-cyan-500/[0.07] rounded-full blur-[140px] pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="fixed bottom-0 -right-48 w-96 sm:w-[32rem] h-96 sm:h-[32rem] bg-blue-600/[0.06] rounded-full blur-[140px] pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="fixed top-1/3 right-1/4 w-72 h-72 bg-teal-500/[0.03] rounded-full blur-[160px] pointer-events-none" 
      />

      {/* Main Viewport Shell */}
      <div className="relative flex flex-1 min-h-0 w-full">
        {/* Navigation Sidebar (Desktop drawer + Mobile slideover) */}
        <Sidebar />

        {/* Dynamic Content Canvas with Responsive Offset */}
        <div
          className={`relative flex flex-col flex-1 min-w-0 transition-all duration-300 ease-out w-full ${
            isMobile ? 'ml-0' : sidebarOpen ? 'ml-64' : 'ml-20'
          }`}
        >
          {/* Sticky Header with Glassmorphic Backdrop */}
          <Header />

          {/* Main Scrollable Canvas with WCAG AAA Scroll Padding */}
          <main 
            id="main-content" 
            tabIndex={-1} 
            className="flex-1 overflow-y-auto custom-scrollbar scroll-pt-20 outline-none pb-20 md:pb-8"
          >
            <div className="w-full max-w-[1536px] mx-auto p-3.5 sm:p-5 md:p-6 lg:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  {children || <Outlet />}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on small viewports) */}
      <MobileNavigation />
    </div>
  );
}