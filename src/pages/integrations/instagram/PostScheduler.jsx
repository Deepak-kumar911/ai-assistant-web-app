// pages/PostScheduler.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Image, Video, Plus, Filter, Search, Grid3x3, LayoutList, Instagram, Sparkles, ChevronRight, MessageCircle, TrendingUp } from 'lucide-react';
import WorkflowCard from '../../../components/workflow/WorkflowCard';
import { workflowService } from '../../../services/workflowService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Toast from '../../../components/common/Toast';
import "../../../styles/post-scheduler.css"

export default function PostScheduler() {
    const navigate = useNavigate();
    const [workflows, setWorkflows] = useState([]);
    const [filteredWorkflows, setFilteredWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchScheduledPosts();
    }, []);

    useEffect(() => {
        filterWorkflows();
    }, [searchTerm, filterType, workflows]);

    const fetchScheduledPosts = async () => {
        try {
            const data = await workflowService.getAllWorkflows();
            const instagramWorkflows = data.filter(wf =>
                wf.type === 'instagram-post' ||
                wf.nodes?.some(node => node.type === 'instagram')
            );
            setWorkflows(instagramWorkflows);
            setFilteredWorkflows(instagramWorkflows);
        } catch (error) {
            showToast('Failed to load scheduled posts', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterWorkflows = () => {
        let filtered = [...workflows];
        if (searchTerm) {
            filtered = filtered.filter(wf =>
                wf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                wf.caption?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filterType !== 'all') {
            filtered = filtered.filter(wf => wf.postType === filterType);
        }
        filtered.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
        setFilteredWorkflows(filtered);
    };

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreateNew = () => {
        navigate('/integration/instagram/post-scheduler/new');
    };

    const handleEditWorkflow = (workflowId) => {
        navigate(`/integration/instagram/post-scheduler/update?workflowId=${workflowId}`);
    };

    const handleDeleteWorkflow = async (workflowId) => {
        if (window.confirm('Are you sure you want to delete this scheduled post?')) {
            try {
                await workflowService.deleteWorkflow(workflowId);
                await fetchScheduledPosts();
                showToast('Post deleted successfully', 'success');
            } catch (error) {
                showToast('Failed to delete post', 'error');
            }
        }
    };

    const handleDuplicateWorkflow = async (workflowId) => {
        try {
            await workflowService.duplicateWorkflow(workflowId);
            await fetchScheduledPosts();
            showToast('Post duplicated successfully', 'success');
        } catch (error) {
            showToast('Failed to duplicate post', 'error');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-black">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                                <Instagram className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                                Post Scheduler
                            </h1>
                            <span className="px-2 py-1 bg-purple-500/20 backdrop-blur-sm rounded-lg text-xs font-semibold text-purple-300 border border-purple-500/30">
                                BETA
                            </span>
                        </div>
                        <p className="text-slate-400 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Manage and schedule your Instagram content with AI-powered automation
                        </p>
                    </div>

                    <button
                        onClick={handleCreateNew}
                        className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
                        <div className="relative flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            <span>Create New</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                </div>


                {/* Filters Bar */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-4 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search posts by name or caption..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>

                        <div className="flex gap-2">
                            {['all', 'post', 'reel', 'carousel'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${filterType === type
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                        : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    {type === 'post' && <Image className="w-4 h-4" />}
                                    {type === 'reel' && <Video className="w-4 h-4" />}
                                    {type === 'carousel' && <Grid3x3 className="w-4 h-4" />}
                                    <span className="capitalize">{type === 'all' ? 'All Types' : type}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-1 bg-slate-900/50 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Grid3x3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <LayoutList className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Workflows Grid/List */}
                <div className={viewMode === 'grid'
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }>
                    <AnimatePresence>
                        {filteredWorkflows.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="col-span-full text-center py-20"
                            >
                                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12">
                                    <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">No scheduled posts yet</h3>
                                    <p className="text-slate-400 mb-6">Create your first Instagram post schedule with AI automation</p>
                                    <button onClick={handleCreateNew} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white hover:shadow-lg transition-all">
                                        Create New Post
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            filteredWorkflows.map((workflow, index) => (
                                <motion.div
                                    key={workflow._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <WorkflowCard
                                        workflow={workflow}
                                        onEdit={() => handleEditWorkflow(workflow._id)}
                                        onDelete={() => handleDeleteWorkflow(workflow._id)}
                                        onDuplicate={() => handleDuplicateWorkflow(workflow._id)}
                                        viewMode={viewMode}
                                    />
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
}