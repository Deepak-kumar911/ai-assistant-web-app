// components/common/ai-agent/tabs/AgentBehaviour.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import { agentBehaviourInitVal, agentBehaviourValidSchema } from '../../../../utils/validation';
import { toast } from 'react-toastify';
import { updateAgentInfoApi } from '../../../../api/authApi';
import { FiSave, FiZap, FiTrendingUp, FiShield, FiCopy, FiCheck } from 'react-icons/fi';

export default function AgentBehaviour({ refetch, onSave }) {
  const { details } = useSelector(state => state?.ai_agent);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(values) {
    setSaving(true);
    let payload = {
      behaviour: values?.behaviour,
      _id: details?._id
    };
    try {
      const response = await updateAgentInfoApi(payload);
      toast.success(response?.data?.message || 'Agent behavior saved successfully');
      refetch && refetch();
      onSave?.();
    } catch (error) {
      console.error('Error saving agent behavior:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    } finally {
      setSaving(false);
    }
  }

  const formik = useFormik({
    initialValues: { ...agentBehaviourInitVal, behaviour: details?.behaviour || '' },
    validationSchema: agentBehaviourValidSchema,
    enableReinitialize: true,
    onSubmit: handleSubmit
  });

  const examples = [
    {
      title: "Customer Support",
      prompt: "You are a professional customer support specialist. Help users with product inquiries, order status, troubleshooting, returns, and refunds. Maintain an empathetic, polite, and solution-oriented tone. Never speculate about internal processes.",
      icon: "🎯",
      tag: "Support"
    },
    {
      title: "Technical Specialist",
      prompt: "Act as a senior technical support engineer. Provide precise answers regarding API integration, debugging workflows, webhooks, and architecture. Use clean syntax examples and guide the developer step by step.",
      icon: "⚙️",
      tag: "Technical"
    },
    {
      title: "Sales & Growth",
      prompt: "You are a consultative sales assistant. Qualify inbound leads, explain product features, suggest relevant pricing plans, and encourage booking a live demo with the team. Be persuasive, helpful, and concise.",
      icon: "📈",
      tag: "Sales"
    }
  ];

  const handleCopy = () => {
    if (!formik.values.behaviour) return;
    navigator.clipboard.writeText(formik.values.behaviour);
    setCopied(true);
    toast.info('Copied prompt to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const setExample = (prompt) => {
    formik.setFieldValue('behaviour', prompt);
    toast.info('Example prompt loaded into editor');
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onSubmit={formik.handleSubmit}
      className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto"
    >
      {/* 1. INFO BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-500/20 backdrop-blur-md p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 shrink-0 text-cyan-400">
            <FiZap size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#F8FAFC] tracking-tight">Agent Personality & System Prompt</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed mt-1">
              Specify your agent's persona, operating rules, capabilities, and conversational guardrails. 
              A well-crafted prompt ensures accurate, brand-aligned responses across every customer interaction.
            </p>
          </div>
        </div>
      </div>

      {/* 2. SYSTEM PROMPT TEXTAREA */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#CBD5E1] tracking-wide uppercase">
            System Prompt <span className="text-cyan-400">*</span>
          </label>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!formik.values.behaviour}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#94A3B8] hover:text-cyan-400 hover:bg-white/[0.04] transition-all disabled:opacity-40 cursor-pointer"
          >
            {copied ? <FiCheck size={13} className="text-emerald-400" /> : <FiCopy size={13} />}
            <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
          </button>
        </div>

        <div className="relative">
          <textarea
            name="behaviour"
            rows={7}
            maxLength={300}
            value={formik.values.behaviour}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder={`Describe how your agent should behave (200-300 characters). For example:

"You are a dedicated support representative. Answer user questions clearly and concisely. When explaining workflows, use numbered steps. Politely ask for clarification or offer escalation when uncertain."`}
            className={`w-full bg-[#131D31] border text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] rounded-2xl p-4 transition-all focus:outline-none focus:ring-1 leading-relaxed custom-scrollbar ${
              formik.touched.behaviour && formik.errors.behaviour
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/40'
                : 'border-white/10 hover:border-white/20 focus:border-cyan-500 focus:ring-cyan-500/50'
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] px-1">
          {formik.touched.behaviour && formik.errors.behaviour ? (
            <span className="text-rose-400 font-medium">{formik.errors.behaviour}</span>
          ) : (
            <span className="text-[#94A3B8]">Limit: 200–300 characters for focused system instructions</span>
          )}
          <span className={`font-mono text-xs font-semibold ${
            (formik.values.behaviour || '').length > 300 
              ? 'text-rose-400' 
              : (formik.values.behaviour || '').length >= 200 
              ? 'text-cyan-400' 
              : 'text-[#64748B]'
          }`}>
            {(formik.values.behaviour || '').length} / 300
          </span>
        </div>
      </div>

      {/* 3. READY-TO-USE PRESETS / EXAMPLES */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FiTrendingUp size={14} className="text-cyan-400" />
          <span className="text-xs font-bold text-[#CBD5E1] tracking-wide uppercase">
            Prompt Presets & Templates
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {examples.map((example, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setExample(example.prompt)}
              className="text-left p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-cyan-500/40 backdrop-blur-sm transition-all duration-200 group flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl group-hover:scale-110 transition-transform">{example.icon}</span>
                    <h5 className="text-xs sm:text-sm font-bold text-[#F8FAFC] group-hover:text-cyan-300 transition-colors">
                      {example.title}
                    </h5>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                    {example.tag}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] line-clamp-3 leading-relaxed group-hover:text-[#CBD5E1] transition-colors">
                  {example.prompt}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-cyan-400/80 group-hover:text-cyan-300 font-semibold">
                <span>Use Template</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. BEST PRACTICES CHECKLIST */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3.5">
          <FiShield size={16} className="text-emerald-400" />
          <h5 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">System Prompt Best Practices</h5>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#94A3B8]">
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
            <span><strong className="text-[#CBD5E1]">Define Core Persona:</strong> State role, communication style, and company identity clearly.</span>
          </div>
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
            <span><strong className="text-[#CBD5E1]">Establish Boundaries:</strong> State what topics or actions the agent must decline or escalate.</span>
          </div>
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
            <span><strong className="text-[#CBD5E1]">Specify Tone:</strong> Indicate whether tone should be technical, friendly, casual, or formal.</span>
          </div>
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
            <span><strong className="text-[#CBD5E1]">Provide Examples:</strong> Include sample conversation flows for consistent output quality.</span>
          </div>
        </div>
      </div>

      {/* 5. ACTIONS FOOTER - Proper Primary Cyan Button */}
      <div className="flex items-center justify-end pt-4 border-t border-white/[0.08]">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-[#080C14] shadow-[0_0_14px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.98] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-[#080C14] border-t-transparent rounded-full animate-spin" />
              <span>Saving Behavior...</span>
            </>
          ) : (
            <>
              <FiSave size={15} />
              <span>Save Behavior</span>
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}