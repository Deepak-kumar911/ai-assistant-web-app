import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiSave, 
  FiUser, 
  FiBriefcase, 
  FiUploadCloud, 
  FiTrash2, 
  FiCpu,
  FiCrop
} from 'react-icons/fi';
import { agentInfoInitVal, agentInfoValidSchema } from '../../../../utils/validation';
import { updateAgentInfoApi } from '../../../../api/authApi';
import { setAgentDetail } from '../../../../stateManagement/slices/aiAgentSlice';
import AvatarCropperModal from '../AvatarCropperModal';

export default function AgentInfo({ onSave }) {
  const dispatch = useDispatch();
  const { details } = useSelector((state) => state?.ai_agent);
  const [saving, setSaving] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [selectedFileToCrop, setSelectedFileToCrop] = useState(null);
  const fileInputRef = useRef(null);

  async function handleSubmit(values) {
    setSaving(true);
    const payload = {
      name: values?.name,
      companyName: values?.companyName,
      description: values?.description,
      avatarUrl: values?.avatarUrl,
      agentImg: values?.avatarUrl,
      fullAgentImg: values?.avatarUrl,
      _id: details?._id || values?._id,
    };

    try {
      const response = await updateAgentInfoApi(payload);
      if (response?.data?.status === 1 || response?.status === 200) {
        toast.success(response?.data?.message || 'Agent information updated successfully');
        dispatch(setAgentDetail({ ...details, ...payload }));
        onSave?.();
      } else {
        toast.error(response?.data?.message || 'Failed to update agent');
      }
    } catch (error) {
      console.error('Error updating agent info:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong updating agent information');
    } finally {
      setSaving(false);
    }
  }

  const formik = useFormik({
    initialValues: {
      name: details?.name || '',
      companyName: details?.companyName || '',
      description: details?.description || '',
      avatarUrl: details?.avatarUrl || details?.agentImg || '',
      _id: details?._id,
    },
    validationSchema: agentInfoValidSchema,
    enableReinitialize: true,
    onSubmit: handleSubmit,
  });

  // Handle file selection and trigger cropper modal
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar file must be less than 5MB');
      return;
    }

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'].includes(file.type)) {
      toast.error('Please upload a valid image file (PNG, JPG, WEBP, or SVG)');
      return;
    }

    setSelectedFileToCrop(file);
    setIsCropperOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAvatar = () => {
    formik.setFieldValue('avatarUrl', '');
    toast.info('Avatar removed');
  };

  const currentAvatar = formik.values.avatarUrl;

  return (
    <>
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={formik.handleSubmit}
        className="p-5 sm:p-7 space-y-7 select-none"
      >
        {/* 1. AGENT PROFILE AVATAR / IMAGE SECTION WITH CROP FEATURE */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Visual Avatar Preview */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative shrink-0 group cursor-pointer"
            title="Click to change and crop avatar"
          >
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt={formik.values.name || 'Agent Avatar'}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-[0_0_16px_rgba(6,182,212,0.2)] group-hover:opacity-80 transition-opacity"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-2 border-white/10 flex items-center justify-center text-cyan-400 shadow-lg group-hover:scale-105 transition-transform">
                <FiCpu size={32} />
              </div>
            )}

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-opacity">
              <FiCrop size={20} className="text-cyan-400" />
            </div>
          </div>

          {/* Upload & Crop Controls */}
          <div className="flex-1 min-w-0 space-y-3 w-full">
            <div>
              <h4 className="text-sm font-bold text-[#F8FAFC]">Agent Profile Avatar</h4>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Upload and crop your agent's circular avatar. Displayed across conversational widgets and platform integrations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Hidden native file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                id="agent-avatar-file"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] active:scale-95 text-xs font-semibold text-[#F8FAFC] border border-white/15 hover:border-cyan-500/40 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              >
                <FiUploadCloud size={14} className="text-cyan-400" />
                <span>{currentAvatar ? 'Change & Crop Image' : 'Upload & Crop Image'}</span>
              </button>

              {currentAvatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                >
                  <FiTrash2 size={13} />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. CORE INFORMATION FIELDS (Responsive 2-column grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Agent Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#CBD5E1]">
            Agent Name <span className="text-cyan-400">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-[#64748B] pointer-events-none">
              <FiUser size={15} />
            </span>
            <input
              type="text"
              name="name"
              placeholder="e.g., Customer Support Specialist"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full bg-[#131D31] border text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] rounded-xl pl-10 pr-3.5 py-2.5 transition-all focus:outline-none focus:ring-1 ${
                formik.touched.name && formik.errors.name
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/40'
                  : 'border-white/10 hover:border-white/20 focus:border-cyan-500 focus:ring-cyan-500/50'
              }`}
            />
          </div>
          {formik.touched.name && formik.errors.name ? (
            <p className="text-[11px] text-rose-400">{formik.errors.name}</p>
          ) : (
            <p className="text-[10px] text-[#64748B]">Descriptive identifier for your autonomous agent</p>
          )}
        </div>

        {/* Company Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#CBD5E1]">
            Company / Workspace Name
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-[#64748B] pointer-events-none">
              <FiBriefcase size={15} />
            </span>
            <input
              type="text"
              name="companyName"
              placeholder="e.g., Oxinno Technologies"
              value={formik.values.companyName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full bg-[#131D31] border border-white/10 hover:border-white/20 focus:border-cyan-500 text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] rounded-xl pl-10 pr-3.5 py-2.5 transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>
          <p className="text-[10px] text-[#64748B]">Used to contextually introduce your business</p>
        </div>
      </div>

      {/* 3. DESCRIPTION TEXTAREA */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[#CBD5E1]">
          Agent Purpose & Description
        </label>
        <textarea
          name="description"
          rows={4}
          placeholder="Describe what this agent does, its primary focus, key capabilities, and target audience..."
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full bg-[#131D31] border border-white/10 hover:border-white/20 focus:border-cyan-500 text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] rounded-xl p-3.5 transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/50 leading-relaxed custom-scrollbar"
        />
        <p className="text-[10px] text-[#64748B]">A clear summary helps your team understand the agent's responsibilities</p>
      </div>

      {/* 4. ACTIONS FOOTER - Proper Primary Cyan Button */}
      <div className="flex items-center justify-end pt-5 border-t border-white/[0.08]">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-[#080C14] shadow-[0_0_14px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.98] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-[#080C14] border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <FiSave size={15} />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </motion.form>

    {/* Avatar Cropper Modal */}
    <AvatarCropperModal
      isOpen={isCropperOpen}
      onClose={() => {
        setIsCropperOpen(false);
        setSelectedFileToCrop(null);
      }}
      agent={details}
      initialFile={selectedFileToCrop}
      onUploadSuccess={(newAvatarUrl) => {
        formik.setFieldValue('avatarUrl', newAvatarUrl);
        formik.setFieldValue('agentImg', newAvatarUrl);
        formik.setFieldValue('fullAgentImg', newAvatarUrl);
        onSave?.();
      }}
    />
  </>
  );
}