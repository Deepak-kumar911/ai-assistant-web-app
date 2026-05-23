// pages/WorkflowSetup.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, AlertCircle, CheckCircle, XCircle, Zap, Shield, Loader2, Sparkles } from 'lucide-react';
import FlowCanvas from '../../../components/workflow/canvas/FlowCanvas';
import WorkflowValidation from '../../../components/workflow/WorkflowValidation';
import { workflowService } from '../../../services/workflowService';
import { validateWorkflow, validateNode } from '../../../components/workflow/NodeValidator';
import { instagramTemplate } from '../../../components/templates/InstagramTemplate';
import Toast from '../../../components/common/Toast';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

export default function WorkflowSetup() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const workflowId = searchParams.get('workflowId');

    const [workflow, setWorkflow] = useState(null);
    const [workflowName, setWorkflowName] = useState('');
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [validation, setValidation] = useState({ isValid: true, errors: [], warnings: [] });
    const [showValidation, setShowValidation] = useState(false);
    const [toast, setToast] = useState(null);
    const [autoSave, setAutoSave] = useState(false);

    useEffect(() => {
        if (workflowId) {
            fetchWorkflow();
        } else {
            initializeTemplate();
        }
    }, [workflowId]);

    // Auto-save every 30 seconds
    useEffect(() => {
        if (!workflowId && nodes.length === 0) return;

        const interval = setInterval(() => {
            if (nodes.length > 0 && workflowName) {
                handleSave(true);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [nodes, edges, workflowName]);

    const fetchWorkflow = async () => {
        setLoading(true);
        try {
            const data = await workflowService.getWorkflow(workflowId);
            setWorkflow(data);
            setWorkflowName(data.name);
            setNodes(data.nodes || []);
            setEdges(data.edges || []);
            const validationResult = validateWorkflow(data.nodes || [], data.edges || []);
            setValidation(validationResult);
        } catch (error) {
            showToast('Failed to load workflow', 'error');
        } finally {
            setLoading(false);
        }
    };

    const initializeTemplate = () => {
        setNodes(instagramTemplate.nodes);
        setEdges(instagramTemplate.edges);
        setWorkflowName('New Instagram Post');
        const validationResult = validateWorkflow(instagramTemplate.nodes, instagramTemplate.edges);
        setValidation(validationResult);
    };

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleNodesChange = (newNodes) => {
        setNodes(newNodes);
        const validationResult = validateWorkflow(newNodes, edges);
        setValidation(validationResult);
    };

    const handleEdgesChange = (newEdges) => {
        setEdges(newEdges);
        const validationResult = validateWorkflow(nodes, newEdges);
        setValidation(validationResult);
    };

    const handleSave = async (isAutoSave = false) => {
        const finalValidation = validateWorkflow(nodes, edges);

        if (!finalValidation.isValid && !isAutoSave) {
            setValidation(finalValidation);
            setShowValidation(true);
            showToast('Please fix validation errors before saving', 'error');
            return;
        }

        if (isAutoSave) {
            setAutoSave(true);
        } else {
            setSaving(true);
        }

        try {
            const workflowData = {
                name: workflowName,
                nodes,
                edges,
                type: 'instagram-post',
                updatedAt: new Date().toISOString(),
            };

            if (workflowId) {
                await workflowService.updateWorkflow(workflowId, workflowData);
                if (!isAutoSave) showToast('Workflow updated successfully', 'success');
            } else {
                const created = await workflowService.createWorkflow(workflowData);
                if (!isAutoSave) {
                    showToast('Workflow created successfully', 'success');
                    navigate(`/workflow/setup?workflowId=${created._id}`);
                }
            }
        } catch (error) {
            if (!isAutoSave) showToast('Failed to save workflow', 'error');
        } finally {
            setSaving(false);
            setAutoSave(false);
        }
    };

    const handleBack = () => {
        navigate('/scheduler');
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="p-2 hover:bg-slate-800 rounded-xl transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <input
                                type="text"
                                value={workflowName}
                                onChange={(e) => setWorkflowName(e.target.value)}
                                placeholder="Workflow Name"
                                className="bg-transparent text-xl font-semibold text-white border border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>

                        <div className="flex gap-2">
                            {!validation.isValid && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 rounded-xl">
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                    <span className="text-xs font-medium text-red-400">{validation.errors.length} errors</span>
                                </div>
                            )}
                            {validation.isValid && validation.warnings.length > 0 && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 rounded-xl">
                                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                                    <span className="text-xs font-medium text-orange-400">{validation.warnings.length} warnings</span>
                                </div>
                            )}
                            {validation.isValid && validation.warnings.length === 0 && nodes.length > 0 && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-xl">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-xs font-medium text-green-400">Valid workflow</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {autoSave && (
                            <div className="flex items-center gap-2 text-slate-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-xs">Auto-saving...</span>
                            </div>
                        )}

                        <button
                            onClick={() => setShowValidation(true)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2 text-slate-300"
                        >
                            <Shield className="w-4 h-4" />
                            Validate
                        </button>

                        <button
                            onClick={() => handleSave(false)}
                            disabled={saving}
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Saving...' : 'Save Workflow'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Flow Canvas */}
            <div className="flex-1 relative">
                <FlowCanvas
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={handleEdgesChange}
                />
            </div>



            {/* Validation Modal */}
            {showValidation && (
                <WorkflowValidation
                    validation={validation}
                    nodes={nodes}
                    onClose={() => setShowValidation(false)}
                    onFix={(nodeId, field) => {
                        setShowValidation(false);
                    }}
                />
            )}

            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
}