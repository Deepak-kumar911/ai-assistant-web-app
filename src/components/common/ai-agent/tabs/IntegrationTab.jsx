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
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A]/70 border border-white/10 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-[#F8FAFC] tracking-tight">{stats.total}</p>
              <p className="text-xs text-[#94A3B8] font-medium mt-0.5">Total Channels</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#94A3B8]">
              <FiLink size={18} />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A]/70 border border-white/10 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-emerald-400 tracking-tight">{stats.connected}</p>
              <p className="text-xs text-[#94A3B8] font-medium mt-0.5">Connected & Live</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FiCheckCircle size={18} />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A]/70 border border-white/10 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-cyan-400 tracking-tight">{stats.active}</p>
              <p className="text-xs text-[#94A3B8] font-medium mt-0.5">Active Automation</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FiTrendingUp size={18} />
            </div>
          </div>
        </div>

        {/* Header Bar & Add Integration Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC]">Connected Platforms</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Connect external messaging platforms and omnichannel web widgets to your autonomous agent.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-[#080C14] shadow-[0_0_14px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <FiPlus size={16} />
            <span>Add Integration</span>
          </button>
        </div>

        {/* Integrations Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader />
          </div>
        ) : list.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400">
              <FiLink size={28} />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-[#F8FAFC] mb-1">No integrations connected yet</h4>
            <p className="text-xs text-[#94A3B8] mb-5 max-w-sm">
              Link your WhatsApp, Instagram, Website, or CRM platforms to empower your AI assistant to handle live inquiries.
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 text-[#080C14] shadow-[0_0_12px_rgba(6,182,212,0.25)] cursor-pointer"
            >
              <FiPlus size={15} />
              <span>Connect Platform</span>
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
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={handleCardClick}
                  className={`group relative p-5 rounded-2xl bg-[#0F172A]/70 border backdrop-blur-xl text-left transition-all duration-200 cursor-pointer shadow-lg flex flex-col justify-between ${
                    isConnected
                      ? 'border-white/10 hover:border-white/20 hover:shadow-cyan-500/5'
                      : 'border-amber-500/30 hover:border-amber-500/50 bg-amber-500/[0.03]'
                  }`}
                >
                  <div>
                    {/* Top Right: Status Badge & 3-Dot Menu */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                        {integrationIcons(item?.type)}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Status Badge */}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isConnected
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : effectiveStatus === 'expired'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {isConnected ? (
                            <>
                              <FiCheckCircle size={10} className="text-emerald-400" />
                              <span>Connected</span>
                            </>
                          ) : (
                            <>
                              <FiAlertCircle size={10} className={effectiveStatus === 'expired' ? 'text-amber-400' : 'text-rose-400'} />
                              <span>Attention</span>
                            </>
                          )}
                        </span>

                        {/* 3-Dot Menu Button */}
                        <div className="relative integration-card-menu">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === item._id ? null : item._id);
                            }}
                            className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
                                className="absolute right-0 mt-1 w-48 py-1.5 bg-[#131D31]/95 border border-white/15 rounded-xl shadow-2xl z-30 backdrop-blur-2xl"
                              >
                                <button
                                  type="button"
                                  onClick={() => handleReconnect(item)}
                                  disabled={reconnectingId === item._id}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-white/5 transition-colors cursor-pointer"
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
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#CBD5E1] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
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
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
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
                      <h4 className="font-bold text-xs sm:text-sm text-[#F8FAFC] mb-1 flex items-center gap-2">
                        <span>{platform?.name || item?.type || 'Integration'}</span>
                        {isInstagram && instagramHealth?.username && (
                          <span className="text-[11px] font-normal text-[#94A3B8] truncate max-w-[120px]">
                            @{instagramHealth.username}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                        {!isConnected && isInstagram
                          ? (instagramHealth?.statusReason || 'Connection issue detected. Reconnect to resume automation.')
                          : (item?.description || `Manage and route your connected ${platform?.name || item?.type} conversations`)}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom CTA hint */}
                  <div className="mt-4 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                    {!isConnected && isInstagram ? (
                      <span className="text-amber-400 font-medium flex items-center gap-1">
                        <FiAlertTriangle size={12} />
                        Reconnect needed
                      </span>
                    ) : (
                      <span className="text-cyan-400/80 group-hover:text-cyan-300 font-semibold flex items-center gap-1">
                        <span>Configure channel</span>
                        <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
                      </span>
                    )}
                  </div>
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