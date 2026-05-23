// components/integration/tab/IntegrationTab.tsx (Redesigned)
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IntegrationModal from "../model/IntegrationModal";
import { FaGlobe, FaWhatsapp, FaInstagram, FaFacebook, FaSlack, FaGoogle, FaMicrosoft, FaShopify } from "react-icons/fa";
import { SiZapier, SiSalesforce } from "react-icons/si";
import Loader from "../../Loader";
import { useNavigate } from "react-router-dom";
import { getAllPlatformIntegrationApi } from "../../../../api/integration/platformIntegrationApi";
import { platformIntegationList } from "../../../../utils/platformIntegrationList";
import { toast } from "react-toastify";
import { FiPlus, FiLink, FiTrendingUp, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

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
  const navigate = useNavigate();

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await getAllPlatformIntegrationApi();
      setList(response?.data?.data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const getConnectionStatus = (integration) => {
    // This would come from your API
    return integration?.status;
  };

  const stats = {
    total: list.length,
    connected: list.filter(i => i?.status === 'connected').length,
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
              const status = item?.status;
              const isConnected = status === 'connected';
              
              return (
                <motion.button
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/ai-agent/integration/${item?._id}/${item.type}/overview`)}
                  className="group relative p-4 bg-[#0F0F12] border border-white/10 rounded-2xl text-left hover:border-white/20 transition-all"
                >
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {isConnected ? (
                      <FiCheckCircle size={14} className="text-emerald-400" />
                    ) : (
                      <FiAlertCircle size={14} className="text-yellow-400" />
                    )}
                  </div>

                  {/* Icon */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {integrationIcons(item?.type)}
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      isConnected 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {status}
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      {platform?.name || item?.type || 'Integration'}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {item?.description || `Connect your ${platform?.name || item?.type} account`}
                    </p>
                  </div>

                  {/* Hover Arrow */}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiTrendingUp size={14} className="text-cyan-400" />
                  </div>
                </motion.button>
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