// components/common/ai-agent/tabs/AgentBehaviour.tsx (Updated - Clean inline form)
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import FormButton from '../../form/FormButton';
import { useFormik } from 'formik';
import { agentBehaviourInitVal, agentBehaviourValidSchema } from '../../../../utils/validation';
import FormTextArea from '../../form/FormTextArea';
import { toast } from 'react-toastify';
import { updateAgentInfoApi } from '../../../../api/authApi';
import { FiSave, FiZap, FiTrendingUp, FiShield, FiCopy } from 'react-icons/fi';

export default function AgentBehaviour({ refetch, onSave }) {
  const { details } = useSelector(state => state?.ai_agent);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values) {
    setSaving(true);
    let payload = {
      behaviour: values?.behaviour,
      _id: details?._id
    };
    try {
      const response = await updateAgentInfoApi(payload);
      toast.success(response?.data?.message);
      refetch && refetch();
      onSave?.();
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    } finally {
      setSaving(false);
    }
  }

  const formik = useFormik({
    initialValues: { ...agentBehaviourInitVal, behaviour: details?.behaviour },
    validationSchema: agentBehaviourValidSchema,
    enableReinitialize: true,
    onSubmit: handleSubmit
  });

  const examples = [
    {
      title: "Customer Support",
      prompt: "You are a helpful customer support agent for an e-commerce store. Help users with product inquiries, order status, returns, and refunds. Be polite, professional, and solution-oriented.",
      icon: "🎯"
    },
    {
      title: "Technical Support",
      prompt: "Act as a technical support specialist. Answer questions about API integration, debugging, system architecture, and best practices. Use clear, technical language and provide code examples when helpful.",
      icon: "⚙️"
    },
    {
      title: "Sales Assistant",
      prompt: "You are a sales assistant. Help qualify leads, answer pricing questions, explain product features, and schedule demos with the sales team. Be persuasive but not pushy.",
      icon: "📈"
    }
  ];

  const setExample = (prompt) => {
    formik.setFieldValue('behaviour', prompt);
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={formik.handleSubmit}
      className="p-6 space-y-6"
    >
      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-white/10">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 shrink-0">
            <FiZap size={20} className="text-cyan-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">Define Agent Behavior</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Write a system prompt that tells the agent how to behave. Be specific about its role, 
              tone, capabilities, and constraints. Good prompts lead to better responses.
            </p>
          </div>
        </div>
      </div>

      {/* Behaviour Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">System Prompt</label>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(formik.values.behaviour || '');
              toast.info('Copied to clipboard');
            }}
            className="text-xs text-gray-500 hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <FiCopy size={12} />
            Copy
          </button>
        </div>
        <FormTextArea
          name="behaviour"
          placeholder={`Describe how your agent should behave. For example:

"You are a professional customer support agent for an AI software company. Help users with technical issues, account management, and product questions. Be friendly, patient, and solution-focused. Never share internal information or make promises you can't keep."`}
          formik={formik}
          rows={8}
        />
      </div>

      {/* Example Prompts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FiTrendingUp size={14} className="text-cyan-400" />
          <span className="text-xs font-medium text-gray-400">Try these examples</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {examples.map((example, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setExample(example.prompt)}
              className="p-3 text-left bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{example.icon}</span>
                <span className="text-sm font-medium text-gray-300">{example.title}</span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-3 group-hover:text-gray-400">
                {example.prompt}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Guidelines */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <FiShield size={14} className="text-emerald-400" />
          <h5 className="text-sm font-medium text-white">Best Practices</h5>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-400">
          <div className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            <span>Clearly define the agent's role and responsibilities</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            <span>Specify the tone (professional, friendly, technical)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            <span>Set boundaries on what the agent can and cannot do</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            <span>Include examples of good responses if possible</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-white/10">
        <FormButton
          loading={saving}
          type="submit"
          icon={<FiSave size={16} />}
        >
          Save Behavior
        </FormButton>
      </div>
    </motion.form>
  );
}