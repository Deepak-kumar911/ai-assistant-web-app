// pages/ai-agent/AllAgent.tsx (Redesigned)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { 
  FiCpu, 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiMoreVertical, 
  FiPlay, 
  FiPause, 
  FiTrash2,
  FiClock,
  FiTrendingUp,
  FiActivity,
  FiChevronRight,
  FiGrid,
  FiList
} from 'react-icons/fi';
import { setAgentDetail } from '../../stateManagement/slices/aiAgentSlice';
import { getAllUserAIagentApi } from '../../api/authApi';
import Loader from '../../components/common/Loader';

const AllAgent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedAgent, setSelectedAgent] = useState(null);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await getAllUserAIagentApi();
      setList(response?.data?.data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const filteredAgents = list.filter(agent => {
    const matchesSearch = agent?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && agent?.isOnOff) ||
                         (filterStatus === 'paused' && !agent?.isOnOff);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: list.length,
    active: list.filter(a => a?.isOnOff).length,
    paused: list.filter(a => !a?.isOnOff).length,
    avgResponse: '0.8s'
  };

  const handleAgentClick = (agent) => {
    dispatch(setAgentDetail(agent));
    navigate(`/ai-agent/manage/${agent._id}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            AI Agents
          </h1>
          <p className="text-gray-400 mt-1">Manage and monitor your intelligent automation agents</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/ai-agent/create')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          <FiPlus size={18} />
          <span>Create New Agent</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0F0F12] border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-cyan-500/10">
              <FiCpu className="text-cyan-400" size={18} />
            </div>
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <p className="text-sm text-gray-400">Total Agents</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#0F0F12] border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <FiActivity className="text-emerald-400" size={18} />
            </div>
            <span className="text-2xl font-bold text-white">{stats.active}</span>
          </div>
          <p className="text-sm text-gray-400">Active Agents</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0F0F12] border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-yellow-500/10">
              <FiPause className="text-yellow-400" size={18} />
            </div>
            <span className="text-2xl font-bold text-white">{stats.paused}</span>
          </div>
          <p className="text-sm text-gray-400">Paused Agents</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-[#0F0F12] border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-violet-500/10">
              <FiTrendingUp className="text-violet-400" size={18} />
            </div>
            <span className="text-2xl font-bold text-white">{stats.avgResponse}</span>
          </div>
          <p className="text-sm text-gray-400">Avg Response Time</p>
        </motion.div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search agents by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0F0F12] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="flex bg-[#0F0F12] border border-white/10 rounded-xl p-1">
            {['all', 'active', 'paused'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-400 border border-white/10'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div className="flex bg-[#0F0F12] border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white/10 text-cyan-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white/10 text-cyan-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiList size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Agents Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader />
        </div>
      ) : filteredAgents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/10 to-violet-500/10 flex items-center justify-center mb-4">
            <FiCpu size={40} className="text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No agents found</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? "No agents match your search criteria" 
              : "Create your first AI agent to get started"}
          </p>
          {(searchTerm || filterStatus !== 'all') ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              Clear filters
            </button>
          ) : (
            <button
              onClick={() => navigate('/ai-agent/create')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg text-white font-medium hover:shadow-lg transition-all"
            >
              <FiPlus size={16} />
              Create Agent
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            : "space-y-3"
          }
        >
          <AnimatePresence>
            {filteredAgents.map((agent) => (
              <motion.div
                key={agent._id}
                variants={itemVariants}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4 }}
                className={`group relative bg-[#0F0F12] border border-white/10 rounded-2xl transition-all hover:border-white/20 hover:shadow-xl ${
                  viewMode === 'list' ? 'p-4' : 'p-5'
                }`}
              >
                {viewMode === 'grid' ? (
                  // Grid View
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                          <FiCpu className="text-cyan-400" size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">{agent?.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${agent?.isOnOff ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                            <span className={`text-xs font-medium ${agent?.isOnOff ? 'text-emerald-400' : 'text-yellow-400'}`}>
                              {agent?.isOnOff ? 'Active' : 'Paused'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAgent(selectedAgent === agent._id ? null : agent._id);
                          }}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FiMoreVertical size={16} className="text-gray-400" />
                        </button>
                        {selectedAgent === agent._id && (
                          <div className="absolute right-0 mt-2 w-36 bg-[#1A1A1F] border border-white/10 rounded-lg shadow-xl z-10">
                            <button className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2">
                              <FiPlay size={14} /> Start
                            </button>
                            <button className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2">
                              <FiPause size={14} /> Pause
                            </button>
                            <button className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-white/10 transition-colors flex items-center gap-2">
                              <FiTrash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                      {agent?.description || 'No description provided'}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 pt-3 border-t border-white/10">
                      <div className="flex items-center gap-1.5">
                        <FiClock size={12} className="text-gray-500" />
                        <span className="text-xs text-gray-500">Created 2d ago</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FiActivity size={12} className="text-gray-500" />
                        <span className="text-xs text-gray-500">1.2k tasks</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleAgentClick(agent)}
                      className="w-full flex items-center justify-between px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group/btn"
                    >
                      <span className="text-sm font-medium text-gray-300">Manage Agent</span>
                      <FiChevronRight size={16} className="text-gray-400 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                ) : (
                  // List View
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                        <FiCpu className="text-cyan-400" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-white">{agent?.name}</h3>
                          <div className={`w-1.5 h-1.5 rounded-full ${agent?.isOnOff ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                          <span className={`text-xs font-medium ${agent?.isOnOff ? 'text-emerald-400' : 'text-yellow-400'}`}>
                            {agent?.isOnOff ? 'Active' : 'Paused'}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm truncate max-w-md">
                          {agent?.description || 'No description provided'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-1.5">
                          <FiClock size={12} className="text-gray-500" />
                          <span className="text-xs text-gray-500">Created 2d ago</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5">
                          <FiActivity size={12} className="text-gray-500" />
                          <span className="text-xs text-gray-500">1.2k tasks</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAgentClick(agent)}
                      className="ml-4 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <FiChevronRight size={18} className="text-gray-400" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default AllAgent;