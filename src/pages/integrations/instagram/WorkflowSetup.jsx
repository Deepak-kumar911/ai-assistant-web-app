// pages/WorkflowSetup.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Save,
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Shield,
  Loader2,
  Sparkles,
} from 'lucide-react';
import FlowCanvas from '../../../components/workflow/canvas/FlowCanvas';
import WorkflowValidation from '../../../components/workflow/WorkflowValidation';
import { workflowService } from '../../../services/workflowService';
import { validateWorkflow } from '../../../components/workflow/NodeValidator';
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
      setWorkflowName(data.name || 'Untitled Workflow');
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
    setWorkflowName('Instagram Lead Automation');
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
        name: workflowName || 'Instagram Lead Automation',
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
    navigate(-1);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="h-[calc(100vh-4.25rem)] w-full flex flex-col overflow-hidden bg-[#080C14]">
      {/* Sleek Compact Header */}
      <div className="bg-[#0F172A]/85 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-2.5 shrink-0 z-20">
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handleBack}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 shadow-sm shadow-cyan-500/10">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Workflow Name"
                className="bg-white/[0.04] hover:bg-white/[0.07] focus:bg-[#080C14] text-xs sm:text-sm font-bold text-[#F8FAFC] border border-white/10 focus:border-cyan-500/70 rounded-lg px-2.5 py-1 outline-none transition-all w-44 sm:w-60 truncate"
              />
            </div>

            {/* Validation Status Pill */}
            <div className="hidden md:flex items-center gap-1.5">
              {!validation.isValid ? (
                <button
                  type="button"
                  onClick={() => setShowValidation(true)}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-semibold hover:bg-rose-500/20 transition-colors cursor-pointer"
                >
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{validation.errors.length} {validation.errors.length === 1 ? 'error' : 'errors'}</span>
                </button>
              ) : validation.warnings.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowValidation(true)}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold hover:bg-amber-500/20 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>{validation.warnings.length} {validation.warnings.length === 1 ? 'warning' : 'warnings'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                  <CheckCircle className="w-3 h-3 shrink-0" />
                  <span>Ready to deploy</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {autoSave && (
              <div className="hidden sm:flex items-center gap-1.5 text-[#94A3B8] text-[11px]">
                <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                <span>Saving...</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowValidation(true)}
              className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg text-xs font-semibold text-[#CBD5E1] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Validate</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-[#080C14] rounded-lg text-xs font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:shadow-[0_0_18px_rgba(6,182,212,0.4)] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{saving ? 'Saving...' : 'Save Workflow'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Flow Canvas Viewport */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
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
          onFix={() => {
            setShowValidation(false);
          }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}