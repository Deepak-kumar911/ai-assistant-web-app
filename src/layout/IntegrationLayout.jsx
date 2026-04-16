import { Link, NavLink, Outlet, useParams, useNavigate, Navigate, Route, Routes } from "react-router-dom";
import { integrationConfigs } from "../config/integrations/integration";
import Header from "../components/layout/Header";
import IntegrationSidebar from "../components/layout/IntegrationSidebar";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getPlatformIntegrationApi } from "../utils/apis/integrationApi";
import { setIntegrationDetail } from "../stateManagement/slices/integrationSlice";

export default function IntegrationLayout() {
  const { theme, sidebarOpen } = useSelector(state => state?.ui)
  const { platform } = useParams();
  const navigate = useNavigate();
  const [loading,setLoading] = useState(false)
  const dispatch = useDispatch()

  if (!platform || !integrationConfigs[platform]) {
    return <div className="p-6">Platform not supported</div>;
  }

  const config = integrationConfigs[platform]

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await getPlatformIntegrationApi({type:platform});
      dispatch(setIntegrationDetail(response?.data?.data || null))
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(platform){
      fetchDetails();
    }
  }, []);


  return (
    <>
      <div className={`relative flex h-screen overflow-hidden transition-colors duration-300 ${theme.bg} ${theme.text}`}>
        {/* Sidebar */}
        <IntegrationSidebar />
        {/* Main content */}
        <div className={`ml-0 transition-all duration-300 ease-in-out w-full ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          <Header />
          <main className="flex-1 overflow-y-auto p-6" style={{ height: '100vh' }}>
            {/* Content */}
             <Routes>
          {/* Redirect default -> overview */}
          <Route index element={<Navigate to="overview" replace />} />

          {config.sidebar.map((item) => {
            const Component = item?.component;
            return (
              <Route
                key={item.path}
                path={item.path}
                element={ Component ? (  <Component />  ) : (
                    <div>
                      {config.name} - {item.label} Page
                    </div>
                  )
                }
              />
            );
          })}
        </Routes>
          </main>
        </div>
      </div>
    </>
  );
}
