// components/integration/tab/IntegrationTab.tsx (Redesigned)
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IntegrationModal from "../model/IntegrationModal";
import { FaGlobe, FaWhatsapp, FaInstagram, FaFacebook, FaSlack, FaGoogle, FaMicrosoft, FaShopify } from "react-icons/fa";
import { SiZapier, SiSalesforce } from "react-icons/si";
import Loader from "../../Loader";
import { useNavigate } from "react-router-dom";
import { getAllPlatformIntegrationApi, getInstagramStatusApi, reconnectInstagramApi } from "../../../../api/integration/platformIntegrationApi";
import { platformIntegationList } from "../../../../utils/platformIntegrationList";
import { toast } from "react-toastify";
import { FiPlus, FiLink, FiTrendingUp, FiCheckCircle, FiAlertCircle, FiMoreVertical, FiRefreshCw, FiExternalLink, FiAlertTriangle } from "react-icons/fi";

export const integrationIcons = (name) => {
  switch (name?.toLowerCase()) {
    case "website":
      return <FaGlobe className="text-blue-400 text-2xl" />;
    case "whatsapp":
      return <FaWhatsapp className="text-green-400 text-2xl" />;
    case "instagram":
      return <FaInstagram className="text-pink-400 text-2xl" />;
    case "facebook":
      return <FaFacebook className="text-blue-400 text-2xl" />;
    case "slack":
      return <FaSlack className="text-purple-400 text-2xl" />;
    case "google":
      return <FaGoogle className="text-red-400 text-2xl" />;
    case "microsoft":
      return <FaMicrosoft className="text-blue-400 text-2xl" />;
    case "shopify":
      return <FaShopify className="text-emerald-400 text-2xl" />;
    case "salesforce":
      return <SiSalesforce className="text-blue-400 text-2xl" />;
    case "zapier":
      return <SiZapier className="text-orange-400 text-2xl" />;
    default:
      return <FaGlobe className="text-blue-400 text-2xl" />;
  }
};

export default function IntegrationTab({ agentId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [instagramHealth, setInstagramHealth] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [reconnectingId, setReconnectingId] = useState(null);
  const navigate = useNavigate();

  const fetchInstagramHealth = async () => {
    try {
      const response = await getInstagramStatusApi({ agentId });
      if (response?.data?.data) {
        setInstagramHealth(response.data.data);
      }
    } catch (err) {
      console.warn("Could not fetch Instagram health status:", err);
    }
  };

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await getAllPlatformIntegrationApi();
      setList(response?.data?.data || []);
      await fetchInstagramHealth();
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [agentId]);

  // Close 3-dot dropdown menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (activeMenuId && !e.target.closest('.integration-card-menu')) {
        setActiveMenuId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [activeMenuId]);

  const handleReconnect = async (item) => {
    try {
      setReconnectingId(item._id);
      setActiveMenuId(null);
      toast.info("Preparing Instagram reconnection session...");
      const response = await reconnectInstagramApi({ agentId });
      const authUrl = response?.data?.url;
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        toast.error("Failed to generate reconnect authorization link");
      }
    } catch (err) {
      console.error("Reconnect error:", err);
      toast.error(err?.response?.data?.message || "Failed to initiate reconnection");
    } finally {
      setReconnectingId(null);
    }
  };

  const stats = {
    total: list.length,
    connected: list.filter(i => {
      if (i?.type === 'instagram' && instagramHealth) {
        return instagramHealth.status === 'connected';
      }
      return i?.status === 'connected';
    }).length,
    active: list.filter(i => i?.isActive).length
  };

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-gray-400">Total Integrations</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-2xl font-bold text-emerald-400">{stats.connected}</p>
            <p className="text-xs text-gray-400">Connected</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-2xl font-bold text-cyan-400">{stats.active}</p>
            <p className="text-xs text-gray-400">Active</p>
          </div>
        </div>

        {/* Add Integration Button */}
        <div className="md:flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">Connected Platforms</h3>
            <p className="text-sm text-gray-400">Manage your connected integrations</p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center mt-3 md:mt-0 gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            <FiPlus size={16} />
            Add Integration
          </button>
        </div>

        {/* Integrations Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : list.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/10 to-violet-500/10 flex items-center justify-center mb-4">
              <FiLink size={32} className="text-gray-500" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">No integrations yet</h4>
            <p className="text-sm text-gray-400 mb-6">Connect your first platform to get started</p>
            <button
              onClick={() => setIsOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl text-white font-medium"
            >
              Add Integration
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {list.map((item, idx) => {
              const platform = platformIntegationList?.find(ele => ele?.type === item?.type);
              
              // Derive health status for Instagram using Task 46 status endpoint
              const isInstagram = item?.type === 'instagram';
              const effectiveStatus = (isInstagram && instagramHealth?.status)
                ? instagramHealth.status
                : item?.status || 'connected';
              const isConnected = effectiveStatus === 'connected';

              const handleCardClick = () => {
                if (isInstagram && !isConnected) {
                  toast.warning(
                    instagramHealth?.statusReason ||
                    "Instagram connection requires attention. Please click the 3-dot menu to Reconnect.",
                    { autoClose: 4000 }
                  );
                  setActiveMenuId(item._id);
                  return;
                }
                navigate(`/ai-agent/integration/${item?._id}/${item.type}/overview`);
              };

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={handleCardClick}
                  className={`group relative p-4 bg-[#0F0F12] border rounded-2xl text-left transition-all cursor-pointer ${
                    isConnected
                      ? 'border-white/10 hover:border-white/20'
                      : 'border-amber-500/30 hover:border-amber-500/50 bg-amber-500/[0.02]'
                  }`}
                >
                  {/* Top Right: Status Badge & 3-Dot Menu */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {integrationIcons(item?.type)}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        isConnected
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : effectiveStatus === 'expired'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {isConnected ? (
                          <>
                            <FiCheckCircle size={11} className="text-emerald-400" />
                            <span>Connected</span>
                          </>
                        ) : (
                          <>
                            <FiAlertCircle size={11} className={effectiveStatus === 'expired' ? 'text-amber-400' : 'text-rose-400'} />
                            <span>Needs Attention</span>
                          </>
                        )}
                      </span>

                      {/* 3-Dot (Kebab) Menu Button */}
                      <div className="relative integration-card-menu">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === item._id ? null : item._id);
                          }}
                          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="More actions"
                        >
                          <FiMoreVertical size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {activeMenuId === item._id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -4 }}
                              transition={{ duration: 0.15 }}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 mt-1 w-48 py-1.5 bg-[#121217] border border-white/10 rounded-xl shadow-2xl z-30 backdrop-blur-xl"
                            >
                              <button
                                type="button"
                                onClick={() => handleReconnect(item)}
                                disabled={reconnectingId === item._id}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-white/5 transition-colors"
                              >
                                <FiRefreshCw size={13} className={reconnectingId === item._id ? "animate-spin" : ""} />
                                <span>Reconnect Account</span>
                              </button>
                              {isConnected && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    navigate(`/ai-agent/integration/${item?._id}/${item.type}/overview`);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                  <FiExternalLink size={13} />
                                  <span>Manage Platform</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  fetchInstagramHealth();
                                  fetchList();
                                  setActiveMenuId(null);
                                  toast.success("Health status refreshed");
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                              >
                                <FiTrendingUp size={13} />
                                <span>Refresh Status</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                      <span>{platform?.name || item?.type || 'Integration'}</span>
                      {isInstagram && instagramHealth?.username && (
                        <span className="text-[11px] font-normal text-gray-400 truncate max-w-[120px]">
                          @{instagramHealth.username}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {!isConnected && isInstagram
                        ? (instagramHealth?.statusReason || 'Connection issue detected. Reconnect to resume automation.')
                        : (item?.description || `Manage your connected ${platform?.name || item?.type} account`)}
                    </p>
                  </div>

                  {/* Hover or Unhealthy Notice */}
                  {!isConnected && isInstagram ? (
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                        <FiAlertTriangle size={12} />
                        Click 3-dot menu to reconnect
                      </span>
                    </div>
                  ) : (
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiTrendingUp size={14} className="text-cyan-400" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add New Integration Modal */}
      <IntegrationModal 
        isOpen={isOpen} 
        refetch={fetchList} 
        setIsOpen={setIsOpen} 
        agentId={agentId}
      />
    </>
  );
}