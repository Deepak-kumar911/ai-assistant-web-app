// components/integration/IntegrationModal.tsx (Redesigned)
import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSearch, FiPlus, FiCheck, FiAlertCircle, FiZap } from "react-icons/fi";
import Loader from "../../Loader";
import { integrationIcons } from "../tabs/IntegrationTab";
import { useSelector } from "react-redux";
import { platformIntegationList } from "../../../../utils/platformIntegrationList";
import { addWebIntegrationApi } from "../../../../api/integration/integrationApi";
import { toast } from "react-toastify";
import { connectPlatformApi, oauthIntegratePlatformApi } from "../../../../api/integration/platformIntegrationApi";

export default function IntegrationModal({ isOpen, setIsOpen, refetch }) {
  const { details } = useSelector(state => state?.ai_agent);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({ type: null, loading: false });
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { value: "all", label: "All", icon: "🎯" },
    { value: "communication", label: "Communication", icon: "💬" },
    { value: "crm", label: "CRM & Sales", icon: "📊" },
    { value: "storage", label: "Storage", icon: "📁" },
    { value: "automation", label: "Automation", icon: "⚡" },
  ];

  const openOAuthPopup = (url, type) => {
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      url,
      `${type}-oauth`,
      `width=${width},height=${height},left=${left},top=${top},popup=yes,toolbar=no,menubar=no,location=no,status=no`
    );
    return popup;
  };

  const addIntegration = async (type) => {
    if (!type || !details?._id) return;
    setSaving({ type, loading: true });
    try {
      if (type === "website") {
        await addWebIntegrationApi({ agentId: details?._id });
        toast.success("Website integrated successfully");
        refetch && refetch();
        setIsOpen(false);
      } else {
        const result = await connectPlatformApi(type);
        setSelectedPlatform(type);
        const { url } = result?.data || {};
        if (url) {
          openOAuthPopup(url, type);
        }
      }
    } catch (error) {
      console.error('Error adding integration:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    } finally {
      setSaving({ type: null, loading: false });
    }
  };

  const filtered = platformIntegationList?.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;
      const { code } = event.data || {};
      if (!code) return;

      try {
        setSaving({ type: selectedPlatform, loading: true });
        await oauthIntegratePlatformApi({
          platform: selectedPlatform,
          code,
          agentId: details?._id,
        });
        toast.success(`${selectedPlatform} connected successfully`);
        refetch && refetch();
        setIsOpen(false);
      } catch (error) {
        toast.error(error?.response?.data?.message || "OAuth failed");
      } finally {
        setSaving({ type: null, loading: false });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [details?._id, selectedPlatform]);

  const getIntegrationStatus = (type) => {
    // You can implement this to check if integration is already connected
    return false; // Placeholder
  };

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-[#0F0F12] border border-white/10 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Connect Integration
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Connect external platforms to enhance your agent's capabilities
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
              <FiX size={20} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader />
            </div>
          ) : (
            <>
              {/* Search and Filter Bar */}
              <div className="px-6 pt-6 pb-4 space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search integrations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#1A1A1F] border border-white/10 rounded-xl px-10 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  />
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                        ${selectedCategory === cat.value
                          ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-400 border border-white/10'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }
                      `}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Integration Grid */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                {filtered.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {filtered.map((item, idx) => {
                        const isConnected = getIntegrationStatus(item.type);
                        const isSaving = saving?.loading && saving?.type === item.type;
                        const isDisabled = saving?.loading && !isSaving;
                        
                        return (
                          <motion.button
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => !isDisabled && !isConnected && addIntegration(item.type)}
                            disabled={isDisabled || isConnected}
                            className={`
                              relative p-4 rounded-xl border transition-all text-left group
                              ${isConnected 
                                ? 'bg-emerald-500/5 border-emerald-500/30 cursor-default opacity-75' 
                                : 'bg-[#1A1A1F] border-white/10 hover:border-cyan-500/50 hover:shadow-lg'
                              }
                              ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                          >
                            {/* Connected Badge */}
                            {isConnected && (
                              <div className="absolute top-3 right-3">
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20">
                                  <FiCheck size={10} className="text-emerald-400" />
                                  <span className="text-[10px] text-emerald-400">Connected</span>
                                </div>
                              </div>
                            )}

                            {/* Icon & Name */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`
                                w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                                ${isConnected 
                                  ? 'bg-emerald-500/10' 
                                  : 'bg-gradient-to-br from-white/5 to-white/10 group-hover:from-cyan-500/20 group-hover:to-violet-500/20'
                                }
                              `}>
                                {isSaving ? (
                                  <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                                ) : (
                                  <div className="text-2xl">
                                    {integrationIcons(item?.name)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">{item?.name}</h3>
                                <p className="text-xs text-gray-500 capitalize">{item?.category || 'Integration'}</p>
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                              {item?.description || `Connect your ${item?.name} account to automate workflows`}
                            </p>

                            {/* Action Button */}
                            {!isConnected && (
                              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                <span className="text-xs text-gray-500">
                                  {isSaving ? 'Connecting...' : 'Click to connect'}
                                </span>
                                <FiPlus size={14} className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/10 to-violet-500/10 flex items-center justify-center mb-4">
                      <FiAlertCircle size={32} className="text-gray-500" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">No integrations found</h4>
                    <p className="text-sm text-gray-400">
                      {search ? "Try adjusting your search or filter" : "No integrations available at the moment"}
                    </p>
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="mt-4 text-sm text-cyan-400 hover:text-cyan-300"
                      >
                        Clear search
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiZap size={14} className="text-cyan-400" />
                <p className="text-xs text-gray-400">
                  Connect integrations to unlock powerful automation features
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </Dialog>
  );
}